'use server'

import { del } from '@vercel/blob'
import prisma from '@/lib/prisma'
import { getAuthUser } from './userActions'

export async function deleteAttachment(attachmentId: string) {
  const user = await getAuthUser()
  if (!user) throw new Error('Unauthorized')

  const attachment = await prisma.taskAttachment.findFirst({
    where: { id: attachmentId, userId: user.id },
  })

  if (!attachment) throw new Error('Attachment not found')

  await del(attachment.url)
  await prisma.taskAttachment.delete({ where: { id: attachmentId } })
}
