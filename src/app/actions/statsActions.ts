'use server';

import prisma from '@/lib/prisma';
import { syncUser } from './userActions';

export async function getOverallStats() {
  const user = await syncUser();
  if (!user) return null;

  const totalProjects = await prisma.project.count({
    where: {
      OR: [
        { userId: user.id },
        { members: { some: { id: user.id } } }
      ]
    }
  });

  const allTasks = await prisma.task.findMany({
    where: {
      list: {
        project: {
          OR: [
            { userId: user.id },
            { members: { some: { id: user.id } } }
          ]
        }
      }
    }
  });

  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = allTasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoTasks = allTasks.filter(t => t.status === 'TODO').length;

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    pendingTasks: totalTasks - completedTasks,
  };
}

export async function getProjectStats(projectId: string) {
  const user = await syncUser();
  if (!user) return null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: true },
  });
  if (!project) return null;

  const lists = await prisma.boardList.findMany({
    where: { projectId },
    select: { id: true, name: true }
  });

  const listIds = lists.map(l => l.id);

  const tasks = await prisma.task.findMany({
    where: { listId: { in: listIds } },
    include: { assignees: true }
  });

  const totalTasks = tasks.length;
  const completedTasks  = tasks.filter(t => t.status === 'DONE').length;
  const inProgressTasks = tasks.filter(t => t.status === 'IN_PROGRESS').length;
  const todoTasks       = tasks.filter(t => t.status === 'TODO').length;
  const unassignedCount = tasks.filter(t => !t.assignees || t.assignees.length === 0).length;

  const userStats = project.members.map((member, idx) => {
    const userTasks   = tasks.filter(t => t.assignees?.some(a => a.id === member.id));
    const done        = userTasks.filter(t => t.status === 'DONE').length;
    const inProg      = userTasks.filter(t => t.status === 'IN_PROGRESS').length;
    const todo        = userTasks.filter(t => t.status === 'TODO').length;
    const total       = userTasks.length;

    // % of their own tasks that are completed
    const completionPct = total > 0 ? Math.round((done / total) * 100) : 0;
    // % of ALL project tasks they are responsible for
    const contributionPct = totalTasks > 0 ? Math.round((total / totalTasks) * 100) : 0;

    return {
      id:              member.id,
      name:            member.name || member.email.split('@')[0],
      email:           member.email,
      avatarUrl:       member.avatarUrl,
      rank:            idx + 1,
      total,
      completed:       done,
      inProgress:      inProg,
      todo,
      completionPct,
      contributionPct,
    };
  });

  // Sort by completionPct desc, then total desc
  userStats.sort((a, b) => b.completionPct - a.completionPct || b.total - a.total);

  return {
    projectName: project.name,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    unassignedCount,
    userStats,
  };
}
