'use server'

import prisma from '@/lib/prisma'
import { syncUser } from './userActions'

async function requireUserId() {
  const user = await syncUser()
  if (!user) throw new Error('Unauthorized')
  return user.id
}

// ── Get current user's role in a workspace ──
export async function getWorkspaceRole(workspaceId: string) {
  const userId = await requireUserId()
  
  // Check if owner first (always ADMIN)
  const workspace = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId },
  })
  if (workspace) return 'ADMIN' as const

  // Check membership table
  const membership = await prisma.workspaceMember.findUnique({
    where: { userId_workspaceId: { userId, workspaceId } },
  })
  
  return membership?.role || null
}

// ── Require ADMIN role ──
export async function requireWorkspaceAdmin(workspaceId: string) {
  const role = await getWorkspaceRole(workspaceId)
  if (role !== 'ADMIN') {
    throw new Error('Permission denied: Admin access required')
  }
  return true
}

// ── Require at least MEMBER role ──
export async function requireWorkspaceMember(workspaceId: string) {
  const role = await getWorkspaceRole(workspaceId)
  if (!role || role === 'VIEWER') {
    throw new Error('Permission denied: Member access required')
  }
  return role
}

// ── Check permission for a project (by traversing project → workspace) ──
export async function checkProjectPermission(projectId: string, requiredRole: 'ADMIN' | 'MEMBER' | 'VIEWER' = 'MEMBER') {
  const userId = await requireUserId()
  
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { userId: true, workspaceId: true },
  })
  if (!project) throw new Error('Project not found')
  
  // Project creator always has full access
  if (project.userId === userId) return 'ADMIN' as const
  
  // Check workspace role if project belongs to a workspace
  if (project.workspaceId) {
    const role = await getWorkspaceRole(project.workspaceId)
    if (!role) throw new Error('Permission denied: Not a workspace member')
    
    const roleHierarchy = { ADMIN: 3, MEMBER: 2, VIEWER: 1 }
    if (roleHierarchy[role] < roleHierarchy[requiredRole]) {
      throw new Error(`Permission denied: ${requiredRole} access required`)
    }
    return role
  }
  
  // Check direct project membership
  const isMember = await prisma.project.findFirst({
    where: { id: projectId, members: { some: { id: userId } } },
  })
  if (!isMember) throw new Error('Permission denied')
  
  return 'MEMBER' as const
}

// ── Set a member's role in a workspace (admin only) ──
export async function setMemberRole(workspaceId: string, targetUserId: string, role: 'ADMIN' | 'MEMBER' | 'VIEWER') {
  await requireWorkspaceAdmin(workspaceId)
  
  // Can't change owner's role
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (workspace?.ownerId === targetUserId) {
    throw new Error('Cannot change workspace owner role')
  }
  
  const membership = await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: targetUserId, workspaceId } },
    update: { role },
    create: { userId: targetUserId, workspaceId, role },
  })
  
  return membership
}

// ── Remove a member from workspace (admin only) ──
export async function removeWorkspaceMember(workspaceId: string, targetUserId: string) {
  await requireWorkspaceAdmin(workspaceId)
  
  const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } })
  if (workspace?.ownerId === targetUserId) {
    throw new Error('Cannot remove workspace owner')
  }
  
  // Remove from membership table
  await prisma.workspaceMember.deleteMany({
    where: { userId: targetUserId, workspaceId },
  })
  
  // Also disconnect from workspace members relation
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { members: { disconnect: { id: targetUserId } } },
  })
  
  return true
}

// ── Add a member to workspace ──
export async function addWorkspaceMember(workspaceId: string, email: string, role: 'MEMBER' | 'VIEWER' = 'MEMBER') {
  await requireWorkspaceAdmin(workspaceId)
  
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('User not found')
  
  // Add to membership table
  const membership = await prisma.workspaceMember.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId } },
    update: { role },
    create: { userId: user.id, workspaceId, role },
  })
  
  // Also connect to workspace members relation (for backward compat)
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { members: { connect: { id: user.id } } },
  })
  
  return membership
}

// ── Get all members of a workspace with their roles ──
export async function getWorkspaceMembers(workspaceId: string) {
  const memberships = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: { user: true },
    orderBy: { joinedAt: 'asc' },
  })
  
  // Also include owner
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: { owner: true },
  })
  
  if (!workspace) return []
  
  const ownerInList = memberships.find(m => m.userId === workspace.ownerId)
  const result = memberships.map(m => ({
    id: m.userId,
    name: m.user.name,
    email: m.user.email,
    avatarUrl: m.user.avatarUrl,
    role: m.userId === workspace.ownerId ? 'ADMIN' as const : m.role,
    joinedAt: m.joinedAt,
  }))
  
  // Ensure owner is always listed
  if (!ownerInList) {
    result.unshift({
      id: workspace.ownerId,
      name: workspace.owner.name,
      email: workspace.owner.email,
      avatarUrl: workspace.owner.avatarUrl,
      role: 'ADMIN' as const,
      joinedAt: workspace.createdAt,
    })
  }
  
  return result
}
