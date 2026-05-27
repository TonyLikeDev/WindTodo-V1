'use server'

import { cache } from 'react'
import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthUser, syncUser } from './userActions'
import { getProjectTemplate } from '@/lib/projectTemplates'

async function requireUserId() {
  // Writes touch FKs into User — must guarantee the row exists.
  const user = await syncUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

// The project creator is always an implicit ADMIN whether or not a
// ProjectMember row exists for them. Everyone else needs role === ADMIN.
async function requireProjectAdmin(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId },
        { members: { some: { userId, role: 'ADMIN' } } },
      ],
    },
    select: { id: true },
  })
  if (!project) throw new Error('Not authorized: admin required')
}

async function requireProjectAccess(projectId: string, userId: string) {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
    select: { id: true },
  })
  if (!project) throw new Error('Not authorized for this project')
}

// cache() deduplicates calls within a single server request — multiple Suspense sections
// (ProjectsLoader, TasksLoader) both call getProjects() but only one DB query is made.
export const getProjects = cache(async function getProjects() {
  const user = await getAuthUser()
  if (!user) return []

  return prisma.project.findMany({
    where: {
      OR: [
        { userId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    include: {
      members: { include: { user: true } },
      _count: {
        select: { lists: true },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
})

export async function createProject(name: string, color: string) {
  const userId = await requireUserId()

  const project = await prisma.project.create({
    data: {
      name,
      color,
      userId,
      members: {
        create: { userId, role: 'ADMIN' },
      },
    },
  })

  // Auto-create the 3 default workflow columns.
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

export async function createProjectFromTemplate(templateId: string) {
  const userId = await requireUserId()
  const template = getProjectTemplate(templateId)
  if (!template) throw new Error('Unknown template')

  const project = await prisma.project.create({
    data: {
      name: template.name,
      color: template.color,
      userId,
      members: {
        create: { userId, role: 'ADMIN' },
      },
    },
  })

  await prisma.boardList.createMany({
    data: template.columns.map((col, position) => ({
      name: col.name,
      color: col.color,
      userId,
      projectId: project.id,
      position,
    })),
  })

  revalidatePath('/dashboard')
  return project
}

export async function deleteProject(projectId: string) {
  const userId = await requireUserId()
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { id: true, userId: true },
  })
  if (!project) throw new Error('Project not found')

  if (project.userId === userId) {
    // Creator deletes the whole project; cascades clean up lists/tasks.
    await prisma.project.delete({ where: { id: projectId } })
    revalidatePath('/dashboard')
    return
  }

  // Non-creator member: detach themselves from the project instead.
  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { id: true },
  })
  if (!membership) throw new Error('Not authorized for this project')

  await prisma.projectMember.delete({ where: { id: membership.id } })
  revalidatePath('/dashboard')
}

export async function getBoardLists(projectId: string) {
  const user = await getAuthUser()
  if (!user) return []

  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      OR: [
        { userId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    select: { id: true },
  })
  if (!project) return []

  return prisma.boardList.findMany({
    where: { projectId },
    orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
  })
}

export async function createBoardList(
  projectId: string,
  name: string,
  color: string,
  targetIndex?: number,
) {
  const userId = await requireUserId()
  await requireProjectAdmin(projectId, userId)

  const list = await prisma.$transaction(async (tx) => {
    const existing = await tx.boardList.findMany({
      where: { projectId },
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
    where: { id: listId },
    select: { projectId: true },
  })
  if (!list) return
  await requireProjectAdmin(list.projectId, userId)
  await prisma.boardList.update({
    where: { id: listId },
    data: { color },
  })
  revalidatePath(`/projects/${list.projectId}`)
}

export async function renameBoardList(listId: string, name: string) {
  const userId = await requireUserId()
  const trimmed = name.trim()
  if (!trimmed) return
  const list = await prisma.boardList.findFirst({
    where: { id: listId },
    select: { projectId: true },
  })
  if (!list) return
  await requireProjectAdmin(list.projectId, userId)
  await prisma.boardList.update({
    where: { id: listId },
    data: { name: trimmed },
  })
  revalidatePath(`/projects/${list.projectId}`)
}

export async function reorderBoardLists(projectId: string, orderedListIds: string[]) {
  const userId = await requireUserId()
  // Any member can reorder columns (same scope as moving tasks).
  await requireProjectAccess(projectId, userId)

  const lists = await prisma.boardList.findMany({
    where: { projectId },
    select: { id: true },
  })
  const projectIds = new Set(lists.map((l) => l.id))
  if (
    orderedListIds.length !== lists.length ||
    !orderedListIds.every((id) => projectIds.has(id))
  ) {
    throw new Error('Invalid list ids')
  }

  await prisma.$transaction(
    orderedListIds.map((id, i) =>
      prisma.boardList.update({ where: { id }, data: { position: i } }),
    ),
  )
  revalidatePath(`/projects/${projectId}`)
}

export async function deleteBoardList(listId: string) {
  const userId = await requireUserId()
  const list = await prisma.boardList.findFirst({
    where: { id: listId },
    select: { projectId: true },
  })
  if (!list) return
  await requireProjectAdmin(list.projectId, userId)
  // Task cascade on BoardList delete (schema has onDelete: Cascade).
  await prisma.boardList.delete({ where: { id: listId } })
  revalidatePath(`/projects/${list.projectId}`)
}
