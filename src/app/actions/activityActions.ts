'use server'

import prisma from '@/lib/prisma'
import { syncUser } from './userActions'

export async function logActivity(taskId: string, type: string, content: string, metadata?: any) {
  try {
    const user = await syncUser()
    if (!user) return

    return await prisma.taskActivity.create({
      data: {
        taskId,
        userId: user.id,
        type,
        content,
        metadata
      }
    })
  } catch (err) {
    console.error("Error logging activity:", err)
  }
}

export async function getTaskActivities(taskId: string) {
  try {
    return await prisma.taskActivity.findMany({
      where: { taskId },
      include: {
        user: true
      },
      orderBy: { createdAt: 'desc' }
    })
  } catch (err) {
    console.error("Error fetching activities:", err)
    return []
  }
}
