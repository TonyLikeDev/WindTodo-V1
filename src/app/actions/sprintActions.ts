'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { getAuthUser, syncUser } from './userActions'

async function requireUserId() {
  const user = await syncUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
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

export async function getSprints(projectId: string) {
  const user = await getAuthUser()
  if (!user) return []
  await requireProjectAccess(projectId, user.id)
  return prisma.sprint.findMany({
    where: { projectId },
    orderBy: [{ position: 'asc' }, { startDate: 'asc' }],
    include: {
      _count: { select: { tasks: true } },
    },
  })
}

export async function getBacklogTasks(projectId: string) {
  const user = await getAuthUser()
  if (!user) return []
  await requireProjectAccess(projectId, user.id)

  return prisma.task.findMany({
    where: {
      list: { projectId },
    },
    include: {
      assignee: true,
      creator: true,
      sprint: { select: { id: true, name: true } },
      list: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createSprint(
  projectId: string,
  name: string,
  startDate: Date,
  endDate: Date,
) {
  const userId = await requireUserId()
  await requireProjectAccess(projectId, userId)

  const last = await prisma.sprint.findFirst({
    where: { projectId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const sprint = await prisma.sprint.create({
    data: {
      projectId,
      name: name.trim() || 'New sprint',
      startDate,
      endDate,
      position: (last?.position ?? -1) + 1,
    },
  })
  revalidatePath(`/projects/${projectId}`)
  return sprint
}

export async function updateSprint(
  sprintId: string,
  data: { name?: string; startDate?: Date; endDate?: Date },
) {
  const userId = await requireUserId()
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: { projectId: true },
  })
  if (!sprint) throw new Error('Sprint not found')
  await requireProjectAccess(sprint.projectId, userId)

  const updated = await prisma.sprint.update({ where: { id: sprintId }, data })
  revalidatePath(`/projects/${sprint.projectId}`)
  return updated
}

export async function deleteSprint(sprintId: string) {
  const userId = await requireUserId()
  const sprint = await prisma.sprint.findUnique({
    where: { id: sprintId },
    select: { projectId: true },
  })
  if (!sprint) return
  await requireProjectAccess(sprint.projectId, userId)

  await prisma.sprint.delete({ where: { id: sprintId } })
  revalidatePath(`/projects/${sprint.projectId}`)
}

export async function moveTaskToSprint(taskId: string, sprintId: string | null) {
  const userId = await requireUserId()

  const task = await prisma.task.findFirst({
    where: {
      id: taskId,
      list: {
        project: {
          OR: [
            { userId },
            { members: { some: { userId } } },
          ],
        },
      },
    },
    select: { id: true, list: { select: { projectId: true } } },
  })
  if (!task) throw new Error('Task not found')

  if (sprintId) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      select: { projectId: true },
    })
    if (!sprint || sprint.projectId !== task.list.projectId) {
      throw new Error('Sprint not in this project')
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: { sprintId },
  })
  revalidatePath(`/projects/${task.list.projectId}`)
}
