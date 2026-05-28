import { put } from '@vercel/blob'
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const MAX_SIZE = 10 * 1024 * 1024

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const userId = session.user.id

  const formData = await request.formData()
  const file = formData.get('file') as File | null
  const taskId = formData.get('taskId') as string | null

  if (!file || !taskId) {
    return NextResponse.json({ error: 'Missing file or taskId' }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'File too large (max 10 MB)' }, { status: 413 })
  }

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
    select: { id: true },
  })

  if (!task) {
    return NextResponse.json({ error: 'Task not found or no access' }, { status: 404 })
  }

  const blob = await put(`tasks/${taskId}/${Date.now()}-${file.name}`, file, {
    access: 'public',
  })

  const attachment = await prisma.taskAttachment.create({
    data: {
      taskId,
      userId,
      url: blob.url,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || 'application/octet-stream',
    },
  })

  return NextResponse.json(attachment)
}
