"use server";

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { syncUser } from "./userActions";

async function requireUserId() {
  const user = await syncUser();
  if (!user) throw new Error("Unauthorized");
  return user.id;
}

export async function getProjectMessages(projectId: string) {
  const user = await syncUser();
  if (!user) return [];

  return prisma.message.findMany({
    where: { projectId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function getWorkspaceMessages(workspaceId: string) {
  const user = await syncUser();
  if (!user) return [];

  return prisma.message.findMany({
    where: { workspaceId },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        }
      }
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function sendMessage(content: string, { projectId, workspaceId }: { projectId?: string, workspaceId?: string }) {
  const userId = await requireUserId();
  
  if (!projectId && !workspaceId) throw new Error("Target missing (Project or Workspace)");

  const message = await prisma.message.create({
    data: {
      content,
      userId,
      projectId: projectId || null,
      workspaceId: workspaceId || null,
    },
    include: {
      sender: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
          email: true,
        }
      }
    }
  });

  if (projectId) revalidatePath(`/dashboard/projects/${projectId}`);
  else if (workspaceId) revalidatePath(`/dashboard`);
  
  return message;
}
