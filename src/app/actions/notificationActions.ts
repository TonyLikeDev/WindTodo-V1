'use server'

import prisma from '@/lib/prisma'
import { syncUser } from './userActions'
import { revalidatePath } from 'next/cache'

async function requireUserId() {
  const user = await syncUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

// ── Create a notification ──
export async function createNotification(
  targetUserId: string,
  type: string,
  title: string,
  message: string,
  taskId?: string,
  projectId?: string
) {
  return prisma.notification.create({
    data: {
      userId: targetUserId,
      type,
      title,
      message,
      taskId: taskId || null,
      projectId: projectId || null,
    },
  })
}

// ── Get unread notifications for current user ──
export async function getNotifications(limit: number = 20) {
  const userId = await requireUserId()

  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

// ── Get unread count ──
export async function getUnreadCount() {
  const userId = await requireUserId()
  
  return prisma.notification.count({
    where: { userId, isRead: false },
  })
}

// ── Mark single notification as read ──
export async function markAsRead(notificationId: string) {
  const userId = await requireUserId()

  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true },
  })

  revalidatePath('/dashboard')
}

// ── Mark all notifications as read ──
export async function markAllAsRead() {
  const userId = await requireUserId()

  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  })

  revalidatePath('/dashboard')
}

// ── Delete old notifications (cleanup) ──
export async function cleanupOldNotifications() {
  const userId = await requireUserId()
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  await prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true,
      createdAt: { lt: thirtyDaysAgo },
    },
  })
}

// ── Notify project admins/creator when task is auto-completed ──
export async function notifyTaskAutoCompleted(
  taskId: string,
  taskTitle: string,
  projectId: string,
  movedByUserId: string
) {
  // Find the project creator
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true, name: true },
  })
  if (!project) return

  // Don't notify the person who moved the card
  if (project.userId !== movedByUserId) {
    await createNotification(
      project.userId,
      'task_completed',
      `✅ Task completed: "${taskTitle}"`,
      `Task "${taskTitle}" was auto-completed in project "${project.name}" when moved to the final column.`,
      taskId,
      projectId
    )
  }
}

// ── Notify when a task is assigned to someone ──
export async function notifyTaskAssigned(
  taskId: string,
  taskTitle: string,
  assigneeId: string,
  assignedByUserId: string,
  projectName: string
) {
  if (assigneeId === assignedByUserId) return // Don't notify self
  
  await createNotification(
    assigneeId,
    'task_assigned',
    `📋 New task assigned: "${taskTitle}"`,
    `You were assigned to "${taskTitle}" in project "${projectName}".`,
    taskId
  )
}

// ── Notify when deadline is approaching ──
export async function notifyDeadlineApproaching(
  taskId: string,
  taskTitle: string,
  userId: string
) {
  await createNotification(
    userId,
    'deadline',
    `⏰ Deadline approaching: "${taskTitle}"`,
    `Task "${taskTitle}" is due soon. Don't forget to complete it!`,
    taskId
  )
}
