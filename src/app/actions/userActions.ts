'use server';

import { cache } from 'react';
import prisma from '@/lib/prisma';
import { auth } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image: string | null;
};

/**
 * Gets the current authenticated user from the Better Auth session.
 * No HTTP roundtrip — session is read from the cookie.
 */
export const getAuthUser = cache(async (): Promise<AuthUser | null> => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) return null;

  const u = session.user;
  return {
    id: u.id,
    email: u.email,
    name: u.name || u.email.split('@')[0],
    image: u.image ?? null,
  };
});

/**
 * Returns the current user. With Better Auth, the user already exists in the
 * DB after sign-up — no extra sync needed.
 */
export const syncUser = cache(async (): Promise<AuthUser | null> => {
  return getAuthUser();
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
    image: string | null;
    isPending: boolean;
  };
  projectId: string;
  projectName: string;
  role: 'ADMIN' | 'MEMBER';
};

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
      const effectiveRole: 'ADMIN' | 'MEMBER' =
        project.userId === m.userId ? 'ADMIN' : (m.role as 'ADMIN' | 'MEMBER');
      rows.push({
        user: {
          id: m.user.id,
          email: m.user.email,
          name: m.user.name,
          image: m.user.image,
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
