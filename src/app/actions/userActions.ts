'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
};

/**
 * Fast auth check: verifies the JWT locally via cached JWKS — no HTTP
 * roundtrip to Supabase Auth and no DB call. Use this for hot paths that just
 * need `user.id`.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) return null;
  const c = data.claims;
  if (!c.sub || !c.email) return null;
  const meta = (c.user_metadata ?? {}) as { full_name?: string; avatar_url?: string };
  return {
    id: c.sub,
    email: c.email,
    name: meta.full_name || c.email.split('@')[0],
    avatarUrl: meta.avatar_url ?? null,
  };
});

// Track which user ids we've already synced to Postgres in this server
// instance. Resets on cold start. Keeps the full DB sync to at most once per
// cold function lifetime.
const syncedIds = new Set<string>();

/**
 * Full sync: ensures the Postgres `User` row matches the JWT, and migrates a
 * pending placeholder row keyed by email on first real sign-in. Idempotent and
 * skipped for ids already synced in this server instance.
 */
export const syncUser = cache(async (): Promise<AuthUser | null> => {
  const u = await getAuthUser();
  if (!u) return null;
  if (syncedIds.has(u.id)) return u;

  const byId = await prisma.user.findUnique({ where: { id: u.id } });
  if (byId) {
    if (byId.email !== u.email || byId.name !== u.name || byId.avatarUrl !== u.avatarUrl) {
      await prisma.user.update({
        where: { id: u.id },
        data: { email: u.email, name: u.name, avatarUrl: u.avatarUrl },
      });
    }
    syncedIds.add(u.id);
    return u;
  }

  // No row by id yet — see if there's a pending placeholder keyed by email.
  const pending = await prisma.user.findUnique({ where: { email: u.email } });
  if (pending && pending.id.startsWith('pending:')) {
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: pending.id },
        data: { email: `pending-migrating:${pending.id}` },
      });
      await tx.user.create({
        data: { id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl },
      });
      await tx.task.updateMany({ where: { userId: pending.id }, data: { userId: u.id } });
      await tx.task.updateMany({ where: { assigneeId: pending.id }, data: { assigneeId: u.id } });
      await tx.project.updateMany({ where: { userId: pending.id }, data: { userId: u.id } });
      await tx.boardList.updateMany({ where: { userId: pending.id }, data: { userId: u.id } });
      await tx.projectMember.updateMany({
        where: { userId: pending.id },
        data: { userId: u.id },
      });
      await tx.user.delete({ where: { id: pending.id } });
    });
  } else {
    await prisma.user.create({
      data: { id: u.id, email: u.email, name: u.name, avatarUrl: u.avatarUrl },
    });
  }

  syncedIds.add(u.id);
  return u;
});

export async function getAllUsers() {
  const me = await getAuthUser();
  if (!me) return [];
  return prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
}

export type ProjectPeerRow = {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    isPending: boolean;
  };
  projectId: string;
  projectName: string;
  role: 'ADMIN' | 'MEMBER';
};

// One row per (user × shared project). Returns every membership across every
// project the current user is in or created — including the current user's own
// rows so they can see their own roles.
export async function getProjectPeers(): Promise<ProjectPeerRow[]> {
  const me = await getAuthUser();
  if (!me) return [];

  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { userId: me.id },
        { members: { some: { userId: me.id } } },
      ],
    },
    select: {
      id: true,
      name: true,
      userId: true,
      members: {
        include: { user: true },
        orderBy: { user: { name: 'asc' } },
      },
    },
    orderBy: { name: 'asc' },
  });

  const rows: ProjectPeerRow[] = [];
  for (const project of projects) {
    for (const m of project.members) {
      // Creator is implicitly ADMIN even if their stored role drifted.
      const effectiveRole: 'ADMIN' | 'MEMBER' =
        project.userId === m.userId ? 'ADMIN' : m.role;
      rows.push({
        user: {
          id: m.user.id,
          email: m.user.email,
          name: m.user.name,
          avatarUrl: m.user.avatarUrl,
          isPending: m.user.id.startsWith('pending:'),
        },
        projectId: project.id,
        projectName: project.name,
        role: effectiveRole,
      });
    }
  }

  rows.sort((a, b) => {
    const an = (a.user.name || a.user.email).toLowerCase();
    const bn = (b.user.name || b.user.email).toLowerCase();
    if (an !== bn) return an.localeCompare(bn);
    return a.projectName.localeCompare(b.projectName);
  });

  return rows;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function addUserByEmail(emailRaw: string) {
  const me = await syncUser();
  if (!me) return { ok: false as const, error: 'Unauthorized' };
  const email = emailRaw.trim().toLowerCase();
  if (!EMAIL_RE.test(email)) {
    return { ok: false as const, error: 'Invalid email address' };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { ok: false as const, error: 'A user with that email already exists' };
  }

  const user = await prisma.user.create({
    data: {
      id: `pending:${crypto.randomUUID()}`,
      email,
      name: email.split('@')[0],
    },
  });
  revalidatePath('/dashboard/users');
  return { ok: true as const, user };
}

// Any admin (creator or ProjectMember with role=ADMIN) may manage membership
// and roles for a project.
async function assertProjectAdmin(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId },
        { members: { some: { userId, role: 'ADMIN' } } },
      ],
    },
    select: { id: true, userId: true },
  });
  if (!project) throw new Error('Not authorized to manage this project');
  return project;
}

export async function getProjectMembers(projectId: string) {
  const me = await getAuthUser();
  if (!me) return [];
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId: me.id },
        { members: { some: { userId: me.id } } },
      ],
    },
    include: { members: { include: { user: true } } },
  });
  return project?.members ?? [];
}

export async function addMemberToProject(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER' = 'MEMBER',
) {
  const me = await syncUser();
  if (!me) throw new Error('Unauthorized');
  await assertProjectAdmin(projectId, me.id);

  await prisma.projectMember.upsert({
    where: { projectId_userId: { projectId, userId } },
    update: { role },
    create: { projectId, userId, role },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
}

export async function removeMemberFromProject(projectId: string, userId: string) {
  const me = await syncUser();
  if (!me) throw new Error('Unauthorized');
  const project = await assertProjectAdmin(projectId, me.id);
  // Never remove the creator — they're the implicit super-admin.
  if (project.userId === userId) {
    throw new Error('Cannot remove the project creator');
  }
  await prisma.projectMember.deleteMany({
    where: { projectId, userId },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
}

export async function setMemberRole(
  projectId: string,
  userId: string,
  role: 'ADMIN' | 'MEMBER',
) {
  const me = await syncUser();
  if (!me) throw new Error('Unauthorized');
  const project = await assertProjectAdmin(projectId, me.id);
  // Creator is always ADMIN — role changes for them are rejected.
  if (project.userId === userId) {
    throw new Error("The project creator's role can't be changed");
  }
  await prisma.projectMember.update({
    where: { projectId_userId: { projectId, userId } },
    data: { role },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
}
