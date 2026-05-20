'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, X, ChevronRight, ChevronDown } from 'lucide-react';
import { getBoardLists, getProjects } from '@/app/actions/projectActions';
import { getProjectTasks, createTask, updateTask, deleteTask } from '@/app/actions/taskActions';
import TaskDetailModal, {
  type ModalTask,
  type ModalUserProfile,
  type TaskPatch,
  type TaskPriority,
  type TaskStatus,
  type TaskType,
} from './TaskDetailModal';

type ProjectTask = Awaited<ReturnType<typeof getProjectTasks>>[number];

type Zoom = 'week' | 'month' | 'quarter';

type ZoomCfg = {
  label: string;
  pxPerDay: number;
  tickUnit: 'week' | 'month';
} & (
  | { mode: 'days'; pastDays: number; futureDays: number }
  | { mode: 'months'; pastMonths: number; futureMonths: number }
);

const ZOOM_CONFIG: Record<Zoom, ZoomCfg> = {
  week:    { label: 'Week',     pxPerDay: 18,   tickUnit: 'week',  mode: 'days',   pastDays: 14, futureDays: 70 },
  month:   { label: 'Month',    pxPerDay: 7.33, tickUnit: 'month', mode: 'days',   pastDays: 30, futureDays: 210 },
  quarter: { label: 'Quarters', pxPerDay: 10,   tickUnit: 'month', mode: 'months', pastMonths: 2, futureMonths: 2 },
};

const HEADER_ROW = 40;
const TASK_ROW = 36;
const TIMELINE_HEADER = 48;

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}
function daysBetween(a: Date, b: Date) {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RoadmapView({ projectId }: { projectId: string }) {
  const tasksKey = `project-tasks:${projectId}`;
  const listsKey = `project-lists:${projectId}`;

  const { data: tasks = [] } = useSWR(tasksKey, () => getProjectTasks(projectId));
  const { data: lists = [] } = useSWR(listsKey, () => getBoardLists(projectId));
  const { data: projects = [] } = useSWR('projects', getProjects, {
    revalidateOnFocus: false,
    dedupingInterval: 10000,
  });
  const members = useMemo<ModalUserProfile[]>(() => {
    const proj = projects.find((p) => p.id === projectId);
    return (proj?.members ?? []).map((m) => ({
      id: m.user.id,
      name: m.user.name,
      avatarUrl: m.user.avatarUrl,
      email: m.user.email,
    }));
  }, [projects, projectId]);

  const [showNewTask, setShowNewTask] = useState(false);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [zoom, setZoom] = useState<Zoom>('month');
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);

  const cfg = ZOOM_CONFIG[zoom];

  const timelineStart = useMemo(() => {
    if (cfg.mode === 'days') {
      const today = startOfDay(new Date());
      today.setDate(today.getDate() - cfg.pastDays);
      return today;
    }
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() - cfg.pastMonths, 1);
  }, [cfg]);

  const timelineEnd = useMemo(() => {
    if (cfg.mode === 'days') {
      const today = startOfDay(new Date());
      today.setDate(today.getDate() + cfg.futureDays);
      return today;
    }
    const now = new Date();
    // First day of the month *after* the last visible month, so the bar can
    // extend through the end of the last month.
    return new Date(now.getFullYear(), now.getMonth() + cfg.futureMonths + 1, 1);
  }, [cfg]);

  const totalDays = daysBetween(timelineEnd, timelineStart);
  const totalPx = Math.round(totalDays * cfg.pxPerDay);

  const dateToPx = (date: Date) => {
    const fromStart =
      (date.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24);
    return fromStart * cfg.pxPerDay;
  };

  const todayPx = dateToPx(new Date());

  const ticks = useMemo(
    () => generateTicks(timelineStart, timelineEnd, cfg.tickUnit),
    [timelineStart, timelineEnd, cfg.tickUnit],
  );

  const openTask = useMemo<ModalTask | null>(() => {
    if (!openTaskId) return null;
    const t = tasks.find((x) => x.id === openTaskId);
    if (!t) return null;
    return {
      id: t.id,
      title: t.title,
      description: t.description,
      status: t.status as TaskStatus,
      priority: t.priority as TaskPriority,
      type: t.type as TaskType,
      startDate: t.startDate,
      endDate: t.endDate,
      assigneeId: t.assigneeId,
      assignee: t.assignee
        ? {
            id: t.assignee.id,
            name: t.assignee.name,
            avatarUrl: t.assignee.avatarUrl,
            email: t.assignee.email,
          }
        : null,
      createdAt: t.createdAt,
    };
  }, [openTaskId, tasks]);

  const patchTask = async (id: string, patch: TaskPatch) => {
    const next = tasks.map((t) => (t.id === id ? { ...t, ...patch } : t));
    mutate(tasksKey, next, false);
    await updateTask(id, patch);
    mutate(tasksKey);
  };

  const removeTask = async (id: string) => {
    mutate(tasksKey, tasks.filter((t) => t.id !== id), false);
    await deleteTask(id);
    mutate(tasksKey);
  };

  // Tasks grouped by their parent list, in list-position order.
  const groups = useMemo(() => {
    const byList = new Map<string, ProjectTask[]>();
    for (const t of tasks) {
      const arr = byList.get(t.list.id) ?? [];
      arr.push(t);
      byList.set(t.list.id, arr);
    }
    return lists.map((l) => ({
      id: l.id,
      name: l.name,
      color: l.color,
      tasks: byList.get(l.id) ?? [],
    }));
  }, [tasks, lists]);

  return (
    <div className="h-full flex flex-col relative">
      <div className="flex-shrink-0 flex items-center justify-end gap-2 px-6 md:px-10 py-3 border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-black/35 backdrop-blur-md">
        <span className="text-xs text-muted-foreground mr-2">Zoom</span>
        <div className="flex items-center gap-1 bg-white/50 dark:bg-slate-900/60 backdrop-blur-md rounded-full border border-white/20 dark:border-white/5 p-1">
          {(Object.keys(ZOOM_CONFIG) as Zoom[]).map((z) => {
            const active = zoom === z;
            return (
              <button
                key={z}
                type="button"
                onClick={() => setZoom(z)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                  active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {ZOOM_CONFIG[z].label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar pb-28">
        <div className="flex min-w-max">
          {/* Left rail */}
          <div className="flex-shrink-0 w-72 sticky left-0 z-10 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-r border-white/20 dark:border-white/5">
            <div
              className="flex items-center px-4 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b border-white/20 dark:border-white/5"
              style={{ height: TIMELINE_HEADER }}
            >
              Task
            </div>
            {groups.length === 0 ? (
              <div className="px-4 py-6 text-sm text-muted-foreground">
                No task lists yet. Create one from the kanban view first.
              </div>
            ) : (
              groups.map((g) => {
                const isCollapsed = collapsed[g.id];
                return (
                  <div key={g.id}>
                    <div
                      className="flex items-center gap-2 px-3 border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/25"
                      style={{ height: HEADER_ROW }}
                    >
                      <button
                        type="button"
                        onClick={() => setCollapsed((s) => ({ ...s, [g.id]: !isCollapsed }))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: g.color }}
                      />
                      <span className="text-sm font-semibold text-foreground truncate flex-1">{g.name}</span>
                      <span className="text-[10px] font-bold text-muted-foreground">{g.tasks.length}</span>
                    </div>
                    {!isCollapsed &&
                      g.tasks.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => setOpenTaskId(t.id)}
                          className="w-full flex items-center gap-2 pl-10 pr-3 border-b border-white/10 dark:border-white/5 hover:bg-white/10 dark:hover:bg-slate-900/25 transition-colors text-left"
                          style={{ height: TASK_ROW }}
                        >
                          <span className={`text-sm truncate ${t.status === 'DONE' ? 'text-muted-foreground line-through opacity-70' : 'text-foreground'}`}>
                            {t.title}
                          </span>
                        </button>
                      ))}
                  </div>
                );
              })
            )}
          </div>

          {/* Right: timeline */}
          <div className="relative" style={{ width: totalPx }}>
            {/* Tick header */}
            <div
              className="relative border-b border-white/20 dark:border-white/5 bg-white/40 dark:bg-black/25 backdrop-blur-md sticky top-0 z-10"
              style={{ height: TIMELINE_HEADER }}
            >
              {ticks.map((t) => (
                <div
                  key={t.toISOString()}
                  className="absolute top-0 bottom-0 flex items-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-2 border-l border-white/10 dark:border-white/10"
                  style={{ left: dateToPx(t) }}
                >
                  {formatTick(t, cfg.tickUnit)}
                </div>
              ))}
            </div>

            {/* Today line */}
            <div
              className="absolute bottom-0 w-px bg-orange-400/80 z-10 pointer-events-none"
              style={{ left: todayPx, top: TIMELINE_HEADER }}
            >
              <div className="absolute -top-2 -left-2 w-4 h-4 rounded-full bg-orange-400" />
            </div>

            {groups.map((g) => {
              const isCollapsed = collapsed[g.id];
              return (
                <div key={g.id}>
                  <div className="relative border-b border-white/20 dark:border-white/5 bg-white/20 dark:bg-black/10" style={{ height: HEADER_ROW }}>
                    {ticks.map((t) => (
                      <div
                        key={t.toISOString()}
                        className="absolute top-0 bottom-0 border-l border-white/10 dark:border-white/10"
                        style={{ left: dateToPx(t) }}
                      />
                    ))}
                  </div>
                  {!isCollapsed &&
                    g.tasks.map((t) => {
                      const span = computeTaskSpan(t, dateToPx);
                      return (
                        <div
                          key={t.id}
                          className="relative border-b border-white/10 dark:border-white/5 hover:bg-white/5 dark:hover:bg-slate-900/10"
                          style={{ height: TASK_ROW }}
                        >
                          {ticks.map((tk) => (
                            <div
                              key={tk.toISOString()}
                              className="absolute top-0 bottom-0 border-l border-white/10 dark:border-white/10"
                              style={{ left: dateToPx(tk) }}
                            />
                          ))}
                          {span && (
                            <button
                              type="button"
                              onClick={() => setOpenTaskId(t.id)}
                              className="absolute top-1/2 -translate-y-1/2 rounded-md px-2 flex items-center shadow-sm overflow-hidden cursor-pointer hover:brightness-105 hover:shadow-md transition-all"
                              style={{
                                left: span.left,
                                width: span.width,
                                height: 22,
                                backgroundColor: t.status === 'DONE' ? 'rgba(16, 185, 129, 0.25)' : t.status === 'IN_PROGRESS' ? g.color + '66' : g.color + '22',
                                border: `1px solid ${t.status === 'DONE' ? 'rgba(16, 185, 129, 0.6)' : t.status === 'IN_PROGRESS' ? g.color : g.color + '66'}`,
                                boxShadow: t.status === 'DONE' ? '0 0 8px rgba(16, 185, 129, 0.3)' : 'none'
                              }}
                              title={t.title}
                            >
                              <span className={`text-[11px] truncate ${
                                t.status === 'DONE' ? 'text-emerald-700 dark:text-emerald-400 font-medium' :
                                t.status === 'IN_PROGRESS' ? 'text-foreground dark:text-white font-bold' :
                                'text-foreground dark:text-white font-medium'
                              }`}>
                                {t.title}
                              </span>
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowNewTask(true)}
        className="fixed md:absolute bottom-24 left-6 z-40 md:z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-xl shadow-primary/30 hover:bg-sky-dark transition-colors"
      >
        <Plus className="w-4 h-4" />
        Task
      </button>

      {showNewTask && (
        <NewTaskModal
          lists={lists}
          onClose={() => setShowNewTask(false)}
          onCreated={() => {
            setShowNewTask(false);
            mutate(tasksKey);
          }}
        />
      )}

      {openTask && (
        <TaskDetailModal
          task={openTask}
          members={members}
          onClose={() => setOpenTaskId(null)}
          onChange={(patch) => patchTask(openTask.id, patch)}
          onDelete={() => {
            removeTask(openTask.id);
            setOpenTaskId(null);
          }}
        />
      )}
    </div>
  );
}

function generateTicks(start: Date, end: Date, unit: 'week' | 'month'): Date[] {
  const ticks: Date[] = [];
  if (unit === 'month') {
    const cur = new Date(start.getFullYear(), start.getMonth(), 1);
    if (cur < start) cur.setMonth(cur.getMonth() + 1);
    while (cur < end) {
      ticks.push(new Date(cur));
      cur.setMonth(cur.getMonth() + 1);
    }
  } else {
    // weeks — first Monday at or after start
    const cur = new Date(start);
    const day = cur.getDay(); // 0..6, 0=Sun
    const daysToMonday = (8 - day) % 7; // 0 if Mon
    cur.setDate(cur.getDate() + daysToMonday);
    while (cur < end) {
      ticks.push(new Date(cur));
      cur.setDate(cur.getDate() + 7);
    }
  }
  return ticks;
}

function formatTick(d: Date, unit: 'week' | 'month') {
  if (unit === 'month') {
    return d.toLocaleDateString('en-US', { month: 'short' });
  }
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function computeTaskSpan(t: ProjectTask, dateToPx: (d: Date) => number) {
  if (!t.startDate || !t.endDate) return null;
  const left = dateToPx(new Date(t.startDate));
  const right = dateToPx(new Date(t.endDate));
  return { left, width: Math.max(right - left, 32) };
}

type BoardListLite = {
  id: string;
  name: string;
  color: string;
};

function NewTaskModal({
  lists,
  onClose,
  onCreated,
}: {
  lists: BoardListLite[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const [title, setTitle] = useState('');
  const [listId, setListId] = useState(lists[0]?.id ?? '');
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !listId) return;
    setSubmitting(true);
    try {
      await createTask(title.trim(), listId);
      onCreated();
    } finally {
      setSubmitting(false);
    }
  }

  if (lists.length === 0) {
    return (
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
        <div className="glass-dark w-full max-w-sm rounded-2xl p-6 shadow-2xl text-center">
          <h3 className="text-lg font-bold text-foreground mb-2">No task lists yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Switch to the kanban view and create a task list before adding tasks here.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-sky-dark"
          >
            Got it
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="glass-dark w-full max-w-md rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">New task</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <label className="block text-xs font-semibold text-muted-foreground mb-1">Title</label>
        <input
          autoFocus
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ship the new onboarding flow"
          className="w-full mb-4 bg-white/10 dark:bg-slate-900/60 border border-white/20 dark:border-white/5 rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 placeholder-muted-foreground/50"
        />

        <label className="block text-xs font-semibold text-muted-foreground mb-1">Task list</label>
        <div className="grid grid-cols-1 gap-2 mb-5">
          {lists.map((l) => {
            const selected = l.id === listId;
            return (
              <button
                key={l.id}
                type="button"
                onClick={() => setListId(l.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                  selected
                    ? 'bg-primary/15 text-primary border border-primary/30'
                    : 'bg-white/10 dark:bg-slate-900/40 text-foreground border border-white/20 dark:border-white/5 hover:bg-white/20 dark:hover:bg-slate-800/40'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: l.color }}
                />
                {l.name}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-full text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting || !title.trim() || !listId}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-sky-dark disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create task'}
          </button>
        </div>
      </form>
    </div>
  );
}
