'use server'

import prisma from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { syncUser } from './userActions'
import { logActivity } from './activityActions'

async function requireUserId() {
  const user = await syncUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

export async function getTasks(listId: string) {
  try {
    const user = await syncUser()
    if (!user) return []

    return await prisma.task.findMany({
      where: { listId },
      include: {
        creator: true,
        assignees: true,
        list: true,
        subCards: {
          include: {
            assignees: true,
          }
        }
      },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    })
  } catch (err) {
    console.error("Error fetching tasks:", err);
    return [];
  }
}

export async function createTask(title: string, listId: string, assigneeIds?: string[]) {
  const userId = await requireUserId()

  const last = await prisma.task.findFirst({
    where: { listId },
    orderBy: { position: 'desc' },
    select: { position: true },
  })

  const task = await prisma.task.create({
    data: {
      title,
      userId,
      listId,
      position: (last?.position ?? -1) + 1,
      assignees: assigneeIds ? {
        connect: assigneeIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      creator: true,
      assignees: true,
    }
  })

  await logActivity(task.id, 'created', `Created task: ${title}`)

  revalidatePath('/')
  return task
}

export async function updateTask(taskId: string, data: { 
  title?: string, 
  description?: string | null,
  contentJson?: any,
  type?: 'TASK' | 'NOTE' | 'DOC' | 'HEADING',
  color?: string | null,
  assigneeIds?: string[], 
  status?: 'TODO' | 'IN_PROGRESS' | 'DONE',
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
  dueDate?: Date | null,
  reminder?: Date | null,
  estimatedTime?: number | null,
  completedTime?: number | null,
  recurring?: string | null,
  labels?: any,
  isCompleted?: boolean
}) {
  const userId = await requireUserId()
  
  const { assigneeIds, ...rest } = data;

  const oldTask = await prisma.task.findUnique({ where: { id: taskId } });

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...rest,
      assignees: assigneeIds ? {
        set: assigneeIds.map(id => ({ id }))
      } : undefined
    },
    include: {
      creator: true,
      assignees: true,
    }
  })

  // Basic activity logging for status change
  if (data.status && oldTask && data.status !== oldTask.status) {
    await logActivity(taskId, 'status_change', `Changed status to ${data.status}`, { old: oldTask.status, new: data.status })
  }

  revalidatePath('/')
  return task
}

export async function moveTask(
  taskId: string,
  targetListId: string,
  targetIndex: number,
) {
  const userId = await requireUserId()

  const task = await prisma.task.findFirst({
    where: { id: taskId },
  })
  if (!task) return

  const sourceListId = task.listId

  await prisma.$transaction(async (tx) => {
    if (sourceListId === targetListId) {
      const items = await tx.task.findMany({
        where: { listId: targetListId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      })
      const without = items.filter((t) => t.id !== taskId)
      const clamped = Math.max(0, Math.min(targetIndex, without.length))
      const next = [
        ...without.slice(0, clamped),
        { id: taskId },
        ...without.slice(clamped),
      ]
      await Promise.all(
        next.map((t, i) =>
          tx.task.update({ where: { id: t.id }, data: { position: i } }),
        ),
      )
    } else {
      const targetItems = await tx.task.findMany({
        where: { listId: targetListId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      })
      const clamped = Math.max(0, Math.min(targetIndex, targetItems.length))
      const nextTarget = [
        ...targetItems.slice(0, clamped).map((t) => t.id),
        taskId,
        ...targetItems.slice(clamped).map((t) => t.id),
      ]

      await tx.task.update({
        where: { id: taskId },
        data: { listId: targetListId },
      })

      await Promise.all(
        nextTarget.map((id, i) =>
          tx.task.update({ where: { id }, data: { position: i } }),
        ),
      )

      const sourceItems = await tx.task.findMany({
        where: { listId: sourceListId },
        orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
        select: { id: true },
      })
      await Promise.all(
        sourceItems.map((t, i) =>
          tx.task.update({ where: { id: t.id }, data: { position: i } }),
        ),
      )
    }
  })

  revalidatePath('/')
}

export async function getTaskDistributionData(projectId: string) {
  try {
    const tasks = await prisma.task.findMany({
      where: {
        list: { projectId }
      },
      include: {
        assignees: true
      }
    });

    const distribution: Record<string, any> = {};

    tasks.forEach(task => {
      task.assignees.forEach(user => {
        if (!distribution[user.id]) {
          distribution[user.id] = {
            id: user.id,
            name: user.name || user.email.split('@')[0],
            avatar: user.avatarUrl,
            total: 0,
            completed: 0,
            inProgress: 0,
            todo: 0,
            overdue: 0
          };
        }
        
        const stats = distribution[user.id];
        stats.total++;
        if (task.status === 'DONE') stats.completed++;
        else if (task.status === 'IN_PROGRESS') stats.inProgress++;
        else stats.todo++;

        if (task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE') {
          stats.overdue++;
        }
      });
    });

    return Object.values(distribution);
  } catch (err) {
    console.error("Error fetching distribution data:", err);
    return [];
  }
}

export async function deleteTask(taskId: string) {
  const userId = await requireUserId()
  
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: { list: true }
  })
  
  if (!task) return

  await prisma.task.delete({
    where: { id: taskId },
  })
  revalidatePath('/')
}

export async function getBoardCards(listId: string) {
  return await getTasks(listId);
}

export async function getCardById(id: string) {
  return prisma.task.findUnique({
    where: { id },
    include: {
      creator: true,
      assignees: true,
      list: true,
      subCards: {
        include: {
          assignees: true,
        }
      }
    },
  });
}

export async function getProjectTasks(projectId: string) {
  try {
    const user = await syncUser()
    if (!user) return []

    return await prisma.task.findMany({
      where: {
        list: { projectId }
      },
      include: {
        creator: true,
        assignees: true,
        list: true,
        subCards: {
          include: {
            assignees: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    return [];
  }
}
export async function getAllUserTasks() {
  try {
    const userId = await requireUserId()
    
    return await prisma.task.findMany({
      where: {
        OR: [
          { userId },
          { assignees: { some: { id: userId } } }
        ]
      },
      include: {
        creator: true,
        assignees: true,
        list: {
          include: {
            project: true
          }
        },
        subCards: {
          include: {
            assignees: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
    })
  } catch (err) {
    console.error("Error fetching all user tasks:", err);
    return [];
  }
}
