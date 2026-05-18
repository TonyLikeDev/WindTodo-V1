/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, X, User as UserIcon, Flag, Layers, CircleDot, Calendar } from 'lucide-react';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'TASK' | 'STORY' | 'BUG';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type ModalUserProfile = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string;
};

export type ModalTask = {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  type: TaskType;
  startDate: Date | null;
  endDate: Date | null;
  assigneeId: string | null;
  assignee?: ModalUserProfile | null;
  createdAt: Date;
  creator?: ModalUserProfile | null;
};

export type TaskPatch = {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  type?: TaskType;
  startDate?: Date | null;
  endDate?: Date | null;
  assigneeId?: string | null;
};

const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: 'bg-muted/20 text-muted-foreground border-muted/30',
  MEDIUM: 'bg-primary/20 text-primary border-primary/30',
  HIGH: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  URGENT: 'bg-red-500/25 text-red-300 border-red-500/40',
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: 'bg-muted/20 text-muted-foreground border-muted/30',
  IN_PROGRESS: 'bg-primary/20 text-primary border-primary/30',
  DONE: 'bg-accent-green/20 text-accent-green border-accent-green/30',
};

const TYPE_STYLES: Record<TaskType, string> = {
  TASK: 'bg-gray-200/80 text-gray-700 border-gray-300',
  STORY: 'bg-green-100/80 text-green-700 border-green-300',
  BUG: 'bg-rose-100/80 text-rose-700 border-rose-300',
};

function toDateInput(d: Date | null): string {
  if (!d) return '';
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function fromDateInput(v: string): Date | null {
  if (!v) return null;
  const d = new Date(v + 'T00:00:00');
  return isNaN(d.getTime()) ? null : d;
}

export default function TaskDetailModal({
  task,
  members,
  onClose,
  onChange,
  onDelete,
}: {
  task: ModalTask;
  members: ModalUserProfile[];
  onClose: () => void;
  onChange: (patch: TaskPatch) => void;
  onDelete: () => void;
}) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? '');
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
  }, [task.id, task.title, task.description]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [description]);

  const commitTitle = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === task.title) {
      setTitle(task.title);
      return;
    }
    onChange({ title: trimmed });
  };

  const commitDescription = () => {
    const next = description.trim() ? description : null;
    if ((next ?? '') === (task.description ?? '')) return;
    onChange({ description: next });
  };

  return (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-bubble-fade"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-4xl my-12 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-bubble-pop">
        {/* Header */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-border/50">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${TYPE_STYLES[task.type]}`}>
                {task.type}
              </span>
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_STYLES[task.status]}`}>
                {task.status.replace('_', ' ')}
              </span>
            </div>
            <input
              ref={titleRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={commitTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  (e.target as HTMLInputElement).blur();
                }
              }}
              className="w-full text-2xl font-bold text-foreground bg-transparent border-0 focus:outline-none focus:ring-1 focus:ring-ring/20 rounded px-2 py-1 -mx-2"
            />
          </div>
          <div className="flex items-center gap-1 ml-4 flex-shrink-0">
            <button
              onClick={onDelete}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-2 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 px-6 py-6">
          {/* Left: description */}
          <div>
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
              Description
            </div>
            <textarea
              ref={descRef}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={commitDescription}
              placeholder="Add a description…"
              className="w-full min-h-[120px] bg-white/[0.04] border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/20 resize-none transition-all"
            />
          </div>

          {/* Right: properties */}
          <div className="space-y-3">
            <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
              Properties
            </div>

            <PropRow icon={<CircleDot className="w-3.5 h-3.5" />} label="Status">
              <select
                value={task.status}
                onChange={(e) => onChange({ status: e.target.value as TaskStatus })}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none focus:ring-1 focus:ring-ring/30 cursor-pointer ${STATUS_STYLES[task.status]}`}
              >
                <option value="TODO" className="bg-background">To Do</option>
                <option value="IN_PROGRESS" className="bg-background">In Progress</option>
                <option value="DONE" className="bg-background">Done</option>
              </select>
            </PropRow>

            <PropRow icon={<Flag className="w-3.5 h-3.5" />} label="Priority">
              <select
                value={task.priority}
                onChange={(e) => onChange({ priority: e.target.value as TaskPriority })}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none focus:ring-1 focus:ring-ring/30 cursor-pointer ${PRIORITY_STYLES[task.priority]}`}
              >
                <option value="LOW" className="bg-background">Low</option>
                <option value="MEDIUM" className="bg-background">Medium</option>
                <option value="HIGH" className="bg-background">High</option>
                <option value="URGENT" className="bg-background">Urgent</option>
              </select>
            </PropRow>

            <PropRow icon={<Layers className="w-3.5 h-3.5" />} label="Type">
              <select
                value={task.type}
                onChange={(e) => onChange({ type: e.target.value as TaskType })}
                className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none focus:ring-1 focus:ring-ring/30 cursor-pointer ${TYPE_STYLES[task.type]}`}
              >
                <option value="TASK" className="bg-background">Task</option>
                <option value="STORY" className="bg-background">Story</option>
                <option value="BUG" className="bg-background">Bug</option>
              </select>
            </PropRow>

            <PropRow icon={<UserIcon className="w-3.5 h-3.5" />} label="Assignee">
              <select
                value={task.assigneeId ?? ''}
                onChange={(e) => onChange({ assigneeId: e.target.value || null })}
                className="text-xs px-2.5 py-1 rounded-md border bg-white/5 border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 cursor-pointer min-w-[140px]"
              >
                <option value="" className="bg-background">Unassigned</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id} className="bg-background">
                    {m.name || m.email}
                  </option>
                ))}
              </select>
            </PropRow>

            <PropRow icon={<Calendar className="w-3.5 h-3.5" />} label="Start date">
              <input
                type="date"
                value={toDateInput(task.startDate)}
                onChange={(e) => onChange({ startDate: fromDateInput(e.target.value) })}
                className="text-xs px-2 py-1 rounded-md border bg-white/5 border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 cursor-pointer"
              />
            </PropRow>

            <PropRow icon={<Calendar className="w-3.5 h-3.5" />} label="End date">
              <input
                type="date"
                value={toDateInput(task.endDate)}
                onChange={(e) => onChange({ endDate: fromDateInput(e.target.value) })}
                className="text-xs px-2 py-1 rounded-md border bg-white/5 border-border text-foreground focus:outline-none focus:ring-1 focus:ring-ring/30 cursor-pointer"
              />
            </PropRow>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border/50 text-[11px] text-muted-foreground">
          Created {new Date(task.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
          {task.creator && (
            <> · by <span className="text-foreground/70">{task.creator.name || task.creator.email}</span></>
          )}
        </div>
      </div>
    </div>
  );
}

function PropRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-1">
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span className="text-muted-foreground/70">{icon}</span>
        <span>{label}</span>
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );
}
