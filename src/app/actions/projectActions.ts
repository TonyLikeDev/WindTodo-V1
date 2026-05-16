'use server'

import prisma from '@/lib/prisma'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { syncUser } from './userActions'

async function requireUserId() {
  const user = await syncUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getProjects(workspaceId?: string) {
  try {
    const user = await syncUser()
    if (!user) return []

    return await prisma.project.findMany({
      where: {
        AND: [
          {
            OR: [
              { userId: user.id },
              { members: { some: { id: user.id } } }
            ]
          },
          workspaceId ? { workspaceId } : {}
        ]
      },
      include: {
        members: true,
        _count: {
          select: { lists: true }
        }
      },
      orderBy: { createdAt: 'asc' },
    })
  } catch (err) {
    return [];
  }
}


export async function getWorkspacesWithProjects() {
  try {
    const userId = await requireUserId()
    
    return await prisma.workspace.findMany({
      where: {
        OR: [
          { ownerId: userId },
          { members: { some: { id: userId } } }
        ]
      },
      include: {
        memberships: {
          where: { userId }
        },
        projects: {
          include: {
            _count: {
              select: { lists: true }
            }
          }
        }
      },
      orderBy: { createdAt: 'asc' }
    })
  } catch (err) {
    console.error("Failed to fetch workspaces, returning empty:", err);
    return [];
  }
}


export async function createWorkspace(name: string) {
  const userId = await requireUserId()
  
  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: userId,
      members: {
        connect: { id: userId }
      },
      memberships: {
        create: {
          userId,
          role: 'ADMIN'
        }
      }
    }
  })
  
  revalidatePath('/dashboard')
  return workspace
}

export async function createProject(name: string, color: string, workspaceId?: string) {
  const userId = await requireUserId()

  // Create project with creator as first member
  const project = await prisma.project.create({
    data: { 
      name, 
      color, 
      userId,
      workspaceId,
      members: {
        connect: { id: userId }
      }
    },
  })

  // Auto-create the 3 default workflow columns
  const DEFAULT_COLUMNS = [
    { name: 'To Do',       color: 'rgba(100, 116, 139, 0.15)', position: 0 },
    { name: 'In Progress', color: 'rgba(59, 130, 246, 0.15)',  position: 1 },
    { name: 'Done',        color: 'rgba(34, 197, 94, 0.15)',   position: 2 },
  ]

  await prisma.boardList.createMany({
    data: DEFAULT_COLUMNS.map((col) => ({
      name:      col.name,
      color:     col.color,
      userId,
      projectId: project.id,
      position:  col.position,
    })),
  })

  revalidatePath('/dashboard')
  return project
}

import { requireWorkspaceAdmin } from './permissionActions'

export async function deleteProject(projectId: string) {
  const userId = await requireUserId()
  
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { workspaceId: true, userId: true }
  })
  
  if (!project) throw new Error('Project not found')
  
  // Must be project creator OR workspace admin
  if (project.userId !== userId && project.workspaceId) {
    await requireWorkspaceAdmin(project.workspaceId)
  }

  const lists = await prisma.boardList.findMany({
    where: { projectId },
    select: { id: true },
  })
  const listIds = lists.map((l) => l.id)
  if (listIds.length > 0) {
    await prisma.task.deleteMany({
      where: { listId: { in: listIds } },
    })
  }
  await prisma.project.delete({ where: { id: projectId } })
  revalidatePath('/dashboard')
}

export async function getBoardLists(projectId: string) {
  try {
    const user = await syncUser()
    if (!user) return []

    // Check user is member or creator of this project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        OR: [
          { userId: user.id },
          { members: { some: { id: user.id } } },
        ],
      },
      select: { id: true },
    })
    if (!project) return []

    // Return ALL lists in the project (not filtered by userId)
    return await prisma.boardList.findMany({
      where: { projectId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    })
  } catch (err) {
    return [];
  }
}


export async function createBoardList(
  projectId: string,
  name: string,
  color: string,
  targetIndex?: number,
) {
  const userId = await requireUserId()

  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    select: { id: true },
  })
  if (!project) throw new Error('Project not found')

  const list = await prisma.$transaction(async (tx) => {
    const existing = await tx.boardList.findMany({
      where: { projectId, userId },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
      select: { id: true },
    })

    const insertAt =
      targetIndex == null
        ? existing.length
        : Math.max(0, Math.min(targetIndex, existing.length))

    const created = await tx.boardList.create({
      data: {
        name,
        color,
        userId,
        projectId,
        position: insertAt,
      },
    })

    const next = [
      ...existing.slice(0, insertAt).map((l) => l.id),
      created.id,
      ...existing.slice(insertAt).map((l) => l.id),
    ]

    await Promise.all(
      next.map((id, i) =>
        tx.boardList.update({ where: { id }, data: { position: i } }),
      ),
    )

    return created
  })

  revalidatePath(`/projects/${projectId}`)
  return list
}

export async function updateBoardListColor(listId: string, color: string) {
  const userId = await requireUserId()
  const list = await prisma.boardList.findFirst({
    where: { id: listId, userId },
    select: { projectId: true },
  })
  if (!list) return
  await prisma.boardList.updateMany({
    where: { id: listId, userId },
    data: { color },
  })
  revalidatePath(`/projects/${list.projectId}`)
}

export async function renameBoardList(listId: string, name: string) {
  const userId = await requireUserId()
  const trimmed = name.trim()
  if (!trimmed) return
  const list = await prisma.boardList.findFirst({
    where: { id: listId, userId },
    select: { projectId: true },
  })
  if (!list) return
  await prisma.boardList.updateMany({
    where: { id: listId, userId },
    data: { name: trimmed },
  })
  revalidatePath(`/projects/${list.projectId}`)
}

export async function deleteBoardList(listId: string) {
  const userId = await requireUserId()
  const list = await prisma.boardList.findFirst({
    where: { id: listId, userId },
    select: { projectId: true },
  })
  if (!list) return
  await prisma.task.deleteMany({ where: { userId, listId } })
  await prisma.boardList.deleteMany({ where: { id: listId, userId } })
  revalidatePath(`/dashboard/projects/${list.projectId}`)
}
