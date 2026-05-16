'use server';

import prisma from '@/lib/prisma';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function syncUser() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  try {
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {
        email: user.email!,
        name: user.user_metadata.full_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata.avatar_url,
      },
      create: {
        id: user.id,
        email: user.email!,
        name: user.user_metadata.full_name || user.email?.split('@')[0],
        avatarUrl: user.user_metadata.avatar_url,
      },
    });

    return dbUser;
  } catch (err) {
    console.error("Prisma sync failed, using auth fallback:", err);
    return {
      id: user.id,
      email: user.email!,
      name: user.user_metadata.full_name || user.email?.split('@')[0],
      avatarUrl: user.user_metadata.avatar_url,
    } as any;
  }
}


export async function getAllUsers() {
  return await prisma.user.findMany({
    orderBy: { name: 'asc' },
  });
}

export async function getProjectMembers(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  return project?.members || [];
}

export async function addMemberToProject(projectId: string, userId: string) {
  const result = await prisma.project.update({
    where: { id: projectId },
    data: {
      members: {
        connect: { id: userId },
      },
    },
    include: { members: true },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
  return result;
}

export async function removeMemberFromProject(projectId: string, userId: string) {
  const result = await prisma.project.update({
    where: { id: projectId },
    data: {
      members: {
        disconnect: { id: userId },
      },
    },
    include: { members: true },
  });
  revalidatePath(`/projects/${projectId}`);
  revalidatePath('/dashboard');
  return result;
}

export async function updateUserProfile(data: { name: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) throw new Error('Unauthorized');

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: { name: data.name },
  });

  revalidatePath('/dashboard/settings');
  return updatedUser;
}
