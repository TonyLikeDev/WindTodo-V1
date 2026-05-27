'use server';

import prisma from '@/lib/prisma';
import type { Prisma } from '@prisma/client';
import { getAuthUser } from './userActions';

function cutoffDate(days: number | null | undefined): Date | null {
  if (!days || days <= 0) return null;
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export async function getOverallStats(days?: number | null) {
  const user = await getAuthUser();
  if (!user) return null;

  const projectWhere: Prisma.ProjectWhereInput = {
    OR: [
      { userId: user.id },
      { members: { some: { userId: user.id } } },
    ],
  };
  const since = cutoffDate(days);
  const taskWhere: Prisma.TaskWhereInput = {
    list: { project: projectWhere },
    ...(since && { createdAt: { gte: since } }),
  };

  const [totalProjects, statusCounts] = await Promise.all([
    prisma.project.count({ where: projectWhere }),
    prisma.task.groupBy({
      by: ['status'],
      where: taskWhere,
      _count: { _all: true },
    }),
  ]);

  const byStatus: Record<string, number> = Object.fromEntries(
    statusCounts.map((row) => [row.status, row._count?._all ?? 0])
  );
  const completedTasks = byStatus.DONE ?? 0;
  const inProgressTasks = byStatus.IN_PROGRESS ?? 0;
  const todoTasks = byStatus.TODO ?? 0;
  const totalTasks = completedTasks + inProgressTasks + todoTasks;

  return {
    totalProjects,
    totalTasks,
    completedTasks,
    inProgressTasks,
    todoTasks,
    pendingTasks: totalTasks - completedTasks,
  };
}

export async function getProjectStats(projectId: string, days?: number | null) {
  const user = await getAuthUser();
  if (!user) return null;

  const since = cutoffDate(days);
  const baseTaskWhere: Prisma.TaskWhereInput = {
    list: { projectId },
    ...(since && { createdAt: { gte: since } }),
  };

  // Fan out the project lookup alongside the aggregations — no serial waits.
  const [project, statusCounts, unassignedCount, perMember] = await Promise.all([
    prisma.project.findUnique({
      where: { id: projectId },
      include: { members: { include: { user: true } } },
    }),
    prisma.task.groupBy({
      by: ['status'],
      where: baseTaskWhere,
      _count: { _all: true },
    }),
    prisma.task.count({
      where: { ...baseTaskWhere, assigneeId: null },
    }),
    prisma.task.groupBy({
      by: ['assigneeId', 'status'],
      where: { ...baseTaskWhere, assigneeId: { not: null } },
      _count: { _all: true },
    }),
  ]);
  if (!project) return null;

  const byStatus: Record<string, number> = Object.fromEntries(
    statusCounts.map((row) => [row.status, row._count?._all ?? 0])
  );
  const completedTasks  = byStatus.DONE ?? 0;
  const inProgressTasks = byStatus.IN_PROGRESS ?? 0;
  const todoTasks       = byStatus.TODO ?? 0;
  const totalTasks      = completedTasks + inProgressTasks + todoTasks;

  const memberAgg = new Map<string, { total: number; done: number; inProg: number; todo: number }>();
  for (const row of perMember) {
    const id = row.assigneeId!;
    const entry = memberAgg.get(id) ?? { total: 0, done: 0, inProg: 0, todo: 0 };
    const n = row._count?._all ?? 0;
    entry.total += n;
    if (row.status === 'DONE') entry.done += n;
    else if (row.status === 'IN_PROGRESS') entry.inProg += n;
    else if (row.status === 'TODO') entry.todo += n;
    memberAgg.set(id, entry);
  }

  const userStats = project.members.map(({ user: member }, idx) => {
    const agg = memberAgg.get(member.id) ?? { total: 0, done: 0, inProg: 0, todo: 0 };
    const completionPct   = agg.total  > 0 ? Math.round((agg.done / agg.total) * 100) : 0;
    const contributionPct = totalTasks > 0 ? Math.round((agg.total / totalTasks) * 100) : 0;

    return {
      id:              member.id,
      name:            member.name || member.email.split('@')[0],
      email:           member.email,
      image:       member.image,
      rank:            idx + 1,
      total:           agg.total,
      completed:       agg.done,
      inProgress:      agg.inProg,
      todo:            agg.todo,
      completionPct,
      contributionPct,
    };
  });

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
