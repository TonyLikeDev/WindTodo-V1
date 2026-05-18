'use client';

import { useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { Plus, ArrowRight, X } from 'lucide-react';
import {
  getSprints,
  getBacklogTasks,
  createSprint,
  moveTaskToSprint,
} from '@/app/actions/sprintActions';

type SprintWithCount = Awaited<ReturnType<typeof getSprints>>[number];
type BacklogTask = Awaited<ReturnType<typeof getBacklogTasks>>[number];

const SHORT_DATE = (d: Date) =>
  d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

function isActiveSprint(s: SprintWithCount) {
  const now = Date.now();
  return new Date(s.startDate).getTime() <= now && new Date(s.endDate).getTime() >= now;
}

export default function BacklogView({ projectId }: { projectId: string }) {
  const sprintsKey = `sprints:${projectId}`;
  const tasksKey = `backlog-tasks:${projectId}`;

  const { data: sprints = [] } = useSWR(sprintsKey, () => getSprints(projectId));
  const { data: tasks = [] } = useSWR(tasksKey, () => getBacklogTasks(projectId));

  const [activeTab, setActiveTab] = useState<string>('backlog');
  const [showNewSprint, setShowNewSprint] = useState(false);
  const effectiveTab = activeTab;

  const tabs = useMemo(
    () => [
      ...sprints.map((s) => ({
        id: s.id,
        label: s.name,
        range: `${SHORT_DATE(new Date(s.startDate))} – ${SHORT_DATE(new Date(s.endDate))}`,
        count: s._count.tasks,
        active: isActiveSprint(s),
      })),
      {
        id: 'backlog',
        label: 'Backlog',
        range: '',
        count: tasks.filter((t) => !t.sprintId).length,
        active: false,
      },
    ],
    [sprints, tasks],
  );

  const visibleTasks = useMemo(() => {
    if (effectiveTab === 'backlog') return tasks.filter((t) => !t.sprintId);
    return tasks.filter((t) => t.sprintId === effectiveTab);
  }, [tasks, effectiveTab]);

  const currentSprint = sprints.find((s) => s.id === effectiveTab) ?? null;

  return (
    <div className="h-full overflow-y-auto custom-scrollbar px-6 md:px-10 py-6 pb-32">
      <div className="flex items-center gap-2 flex-wrap mb-6">
        {tabs.map((tab) => {
          const selected = tab.id === effectiveTab;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm transition-colors ${
                selected
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'bg-white/60 text-foreground border border-border hover:bg-white/80'
              }`}
            >
              {tab.active && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              <span className="font-semibold">{tab.label}</span>
              {tab.range && (
                <span className="text-xs text-muted-foreground">{tab.range}</span>
              )}
              <span className="text-xs font-bold bg-white/70 text-foreground rounded-full px-2 py-0.5">
                {tab.count}
              </span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={() => setShowNewSprint(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-full text-sm bg-white/60 text-primary border border-border hover:bg-white/80 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New sprint
        </button>
      </div>

      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground">
          {currentSprint ? currentSprint.name : 'Backlog'}
          {currentSprint && (
            <span className="ml-3 text-sm font-normal text-muted-foreground">
              {SHORT_DATE(new Date(currentSprint.startDate))} – {SHORT_DATE(new Date(currentSprint.endDate))}
            </span>
          )}
        </h2>
        <p className="text-xs text-muted-foreground mt-1">
          {visibleTasks.length} {visibleTasks.length === 1 ? 'task' : 'tasks'}
          {currentSprint && isActiveSprint(currentSprint) ? ' · active sprint' : ''}
        </p>
      </div>

      <div className="glass rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/40 border-b border-border">
              <Th>ID</Th>
              <Th>Title</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Assignee</Th>
              <Th>End</Th>
              <Th>Sprint</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {visibleTasks.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No tasks here yet.
                </td>
              </tr>
            ) : (
              visibleTasks.map((task, i) => (
                <BacklogRow
                  key={task.id}
                  task={task}
                  index={i}
                  sprints={sprints}
                  onAfterMove={() => {
                    mutate(tasksKey);
                    mutate(sprintsKey);
                  }}
                />
              ))
            )}
          </tbody>
        </table>
      </div>

      {showNewSprint && (
        <NewSprintModal
          projectId={projectId}
          onClose={() => setShowNewSprint(false)}
          onCreated={(s) => {
            setShowNewSprint(false);
            setActiveTab(s.id);
            mutate(sprintsKey);
          }}
        />
      )}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-6 py-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
      {children}
    </th>
  );
}

const STATUS_LABEL: Record<string, { text: string; cls: string }> = {
  TODO: { text: 'Todo', cls: 'bg-slate-500/15 text-slate-700' },
  IN_PROGRESS: { text: 'In Progress', cls: 'bg-sky-500/15 text-sky-700' },
  DONE: { text: 'Done', cls: 'bg-green-500/15 text-green-700' },
};

const PRIORITY_LABEL: Record<string, { text: string; cls: string }> = {
  LOW: { text: 'Low', cls: 'bg-slate-500/15 text-slate-700' },
  MEDIUM: { text: 'Medium', cls: 'bg-amber-500/15 text-amber-700' },
  HIGH: { text: 'High', cls: 'bg-orange-500/15 text-orange-700' },
  URGENT: { text: 'Critical', cls: 'bg-red-500/15 text-red-700' },
};

function BacklogRow({
  task,
  index,
  sprints,
  onAfterMove,
}: {
  task: BacklogTask;
  index: number;
  sprints: SprintWithCount[];
  onAfterMove: () => void;
}) {
  const [moveOpen, setMoveOpen] = useState(false);
  const status = STATUS_LABEL[task.status];
  const priority = PRIORITY_LABEL[task.priority];

  const assigneeName =
    task.assignee?.name || task.assignee?.email?.split('@')[0] || '—';
  const assigneeInitial = (task.assignee?.name || task.assignee?.email || '?').charAt(0).toUpperCase();

  return (
    <tr className="hover:bg-white/40 transition-colors">
      <td className="px-6 py-3 text-xs font-mono text-muted-foreground">
        #{index + 1}
      </td>
      <td className="px-6 py-3">
        {task.list && (
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60" />
            <span className="text-[11px] text-muted-foreground">{task.list.name}</span>
          </div>
        )}
        <span className="text-sm font-medium text-foreground">{task.title}</span>
      </td>
      <td className="px-6 py-3">
        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${status.cls}`}>
          {status.text}
        </span>
      </td>
      <td className="px-6 py-3">
        <span className={`px-2 py-1 rounded-full text-[10px] font-semibold ${priority.cls}`}>
          {priority.text}
        </span>
      </td>
      <td className="px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-bold text-primary">
            {assigneeInitial}
          </span>
          <span className="text-xs text-foreground">{assigneeName}</span>
        </div>
      </td>
      <td className="px-6 py-3 text-xs text-muted-foreground">
        {task.endDate ? new Date(task.endDate).toLocaleDateString() : '—'}
      </td>
      <td className="px-6 py-3 relative">
        <button
          type="button"
          onClick={() => setMoveOpen((v) => !v)}
          className="flex items-center gap-1 text-xs text-primary hover:underline"
        >
          <ArrowRight className="w-3 h-3" />
          Move
        </button>
        {moveOpen && (
          <div
            className="absolute right-2 top-full mt-1 w-48 bg-white/95 backdrop-blur-md rounded-xl border border-border shadow-xl shadow-sky-dark/20 z-dropdown p-1"
            onMouseLeave={() => setMoveOpen(false)}
          >
            <button
              type="button"
              onClick={async () => {
                setMoveOpen(false);
                await moveTaskToSprint(task.id, null);
                onAfterMove();
              }}
              className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-foreground hover:bg-primary/10"
            >
              Backlog
            </button>
            {sprints.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={async () => {
                  setMoveOpen(false);
                  await moveTaskToSprint(task.id, s.id);
                  onAfterMove();
                }}
                className="w-full text-left px-3 py-1.5 rounded-lg text-sm text-foreground hover:bg-primary/10"
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </td>
    </tr>
  );
}

function NewSprintModal({
  projectId,
  onClose,
  onCreated,
}: {
  projectId: string;
  onClose: () => void;
  onCreated: (sprint: SprintWithCount) => void;
}) {
  const [name, setName] = useState('');
  const [start, setStart] = useState(() => new Date().toISOString().slice(0, 10));
  const [end, setEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().slice(0, 10);
  });
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const sprint = await createSprint(
        projectId,
        name || 'Sprint',
        new Date(start),
        new Date(end),
      );
      onCreated({ ...sprint, _count: { tasks: 0 } } as SprintWithCount);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
      <form
        onSubmit={submit}
        className="glass-dark w-full max-w-md rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">New sprint</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>
        <label className="block text-xs font-semibold text-muted-foreground mb-1">Name</label>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Sprint 1"
          className="w-full mb-4 bg-white/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">Start</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full bg-white/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted-foreground mb-1">End</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full bg-white/60 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
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
            disabled={submitting}
            className="px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-sky-dark disabled:opacity-50"
          >
            {submitting ? 'Creating…' : 'Create sprint'}
          </button>
        </div>
      </form>
    </div>
  );
}
