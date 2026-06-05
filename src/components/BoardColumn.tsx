'use client';

import { memo, useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { createTask, deleteTask, getTasks, updateTask } from '@/app/actions/taskActions';
import { useBoardDrag } from './BoardDragContext';
import { User, Trash2, MoreHorizontal, Plus, ChevronDown, ChevronRight, CheckSquare, Square } from 'lucide-react';
import TaskDetailModal, { TaskPatch } from './TaskDetailModal';
import { playCelestialChime } from './EffectsCanvas';
import { useConfirm } from './ConfirmDialog';
import { parseSubtasks, subtaskProgress, toggleSubtask } from '@/lib/subtasks';

type UserProfile = {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
};

type Task = {
  id: string;
  title: string;
  description: string | null;
  listId: string;
  userId: string;
  position: number;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  type: 'TASK' | 'STORY' | 'BUG';
  startDate: Date | null;
  endDate: Date | null;
  assigneeId: string | null;
  assignee?: UserProfile | null;
  creator?: UserProfile | null;
  createdAt: Date;
};

const DRAG_THRESHOLD_PX = 6;

export const LIST_COLORS = [
  { name: 'Default',    value: 'rgba(255, 255, 255, 0.05)' },
  { name: 'Purple',     value: 'rgba(139, 92, 246, 0.18)'  },
  { name: 'Blue',       value: 'rgba(59, 130, 246, 0.18)'  },
  { name: 'Teal',       value: 'rgba(20, 184, 166, 0.18)'  },
  { name: 'Green',      value: 'rgba(34, 197, 94, 0.18)'   },
  { name: 'Yellow',     value: 'rgba(234, 179, 8, 0.18)'   },
  { name: 'Orange',     value: 'rgba(249, 115, 22, 0.18)'  },
  { name: 'Red',        value: 'rgba(239, 68, 68, 0.18)'   },
  { name: 'Pink',       value: 'rgba(236, 72, 153, 0.18)'  },
];
export const DEFAULT_LIST_COLOR = LIST_COLORS[0].value;

const PRIORITY_COLOR: Record<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT', string> = {
  LOW:    '#22c55e',
  MEDIUM: '#3b82f6',
  HIGH:   '#eab308',
  URGENT: '#ef4444',
};

// Returns theme colours/label based on column name for workflow columns
function getColumnTheme(name: string) {
  const n = name.toLowerCase().trim();
  if (n === 'to do' || n === 'todo')
    return { dot: 'bg-slate-400', badge: 'bg-slate-500/20 text-slate-400 border-slate-500/30', label: 'To Do' };
  if (n === 'in progress')
    return { dot: 'bg-blue-400', badge: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'In Progress' };
  if (n === 'done' || n === 'completed')
    return { dot: 'bg-green-400', badge: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Done' };
  return null;
}

const BoardColumn = memo(function BoardColumn({
  listId,
  title,
  color,
  members = [],
  onRemoveList,
  onRename,
  onChangeColor,
  onHeaderPointerDown,
  isDragging = false,
  isDraft = false,
  onDraftCommit,
  onDraftCancel,
  className = 'w-72 flex-shrink-0 max-h-[calc(100vh-220px)]',
}: {
  listId: string;
  title: string;
  color: string;
  members?: UserProfile[];
  onRemoveList?: () => void;
  onRename?: (newName: string) => void;
  onChangeColor?: (color: string) => void;
  onHeaderPointerDown?: (e: React.PointerEvent<HTMLDivElement>) => void;
  isDragging?: boolean;
  isDraft?: boolean;
  onDraftCommit?: (name: string) => void;
  onDraftCancel?: () => void;
  className?: string;
}) {
  const { data: tasks = [], mutate, isLoading } = useSWR<Task[]>(
    isDraft ? null : listId,
    () => getTasks(listId) as unknown as Promise<Task[]>,
    {
      revalidateOnFocus: false,
      dedupingInterval: 5000,
    }
  );
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [openTaskId, setOpenTaskId] = useState<string | null>(null);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Set<string>>(new Set());
  const { confirm, confirmDialog } = useConfirm();
  const [renaming, setRenaming] = useState(isDraft);
  const [renameValue, setRenameValue] = useState(isDraft ? '' : title);
  const renameInputRef = useRef<HTMLInputElement>(null);
  const columnRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const { registerDropTarget, startDrag, draggingTaskId, hoveredSlot } = useBoardDrag();

  useEffect(() => {
    if (adding) inputRef.current?.focus();
  }, [adding]);

  useEffect(() => {
    if (renaming) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renaming]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('pointerdown', onPointerDown);
    return () => document.removeEventListener('pointerdown', onPointerDown);
  }, [menuOpen]);

  const commitRename = () => {
    const trimmed = renameValue.trim();
    if (isDraft) {
      if (trimmed) onDraftCommit?.(trimmed);
      else onDraftCancel?.();
      return;
    }
    if (trimmed && trimmed !== title && onRename) onRename(trimmed);
    else setRenameValue(title);
    setRenaming(false);
  };

  useEffect(() => {
    const el = columnRef.current;
    if (!el || isDraft) return;
    registerDropTarget(listId, {
      el,
      getDropSlot: (_x: number, y: number) => {
        const visible = tasks.filter((t) => t.id !== draggingTaskId);
        for (let i = 0; i < visible.length; i++) {
          const node = cardRefs.current.get(visible[i].id);
          if (!node) continue;
          const r = node.getBoundingClientRect();
          const mid = r.top + r.height / 2;
          if (y < mid) return { listId, index: i };
        }
        return { listId, index: visible.length };
      },
    });
    return () => registerDropTarget(listId, null);
  }, [listId, registerDropTarget, draggingTaskId, tasks, isDraft]);

  const submit = async () => {
    const trimmed = value.trim();
    if (!trimmed) {
      setAdding(false);
      setValue('');
      return;
    }
    const optimistic: Task = {
      id: `temp-${Date.now()}`,
      title: trimmed,
      description: null,
      listId,
      userId: 'temp',
      position: tasks.length,
      status: 'TODO',
      priority: 'MEDIUM',
      type: 'TASK',
      startDate: null,
      endDate: null,
      assigneeId: null,
      createdAt: new Date(),
    };
    mutate([...tasks, optimistic], false);
    setValue('');
    await createTask(trimmed, listId);
    mutate();
  };

  const updateStatus = async (taskId: string, newStatus: 'TODO' | 'IN_PROGRESS' | 'DONE') => {
    const originalTask = tasks.find(t => t.id === taskId);
    if (newStatus === 'DONE' && originalTask && originalTask.status !== 'DONE') {
      playCelestialChime();
      const cardEl = cardRefs.current.get(taskId);
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        window.dispatchEvent(new CustomEvent('star-confetti', { detail: { x, y } }));
      } else {
        window.dispatchEvent(new CustomEvent('star-confetti', { detail: { x: window.innerWidth / 2, y: window.innerHeight / 3 } }));
      }
    }
    mutate(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t), false);
    await updateTask(taskId, { status: newStatus });
    mutate();
  };

  const assignTask = async (taskId: string, assigneeId: string | null) => {
    const assignee = members.find(m => m.id === assigneeId) || null;
    mutate(tasks.map(t => t.id === taskId ? { ...t, assigneeId, assignee } : t), false);
    await updateTask(taskId, { assigneeId });
    mutate();
  };

  const remove = async (id: string) => {
    mutate(tasks.filter((t) => t.id !== id), false);
    await deleteTask(id);
    mutate();
  };

  const requestRemoveTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    const ok = await confirm({
      title: 'Delete task?',
      message: target
        ? `"${target.title}" will be permanently removed. This can't be undone.`
        : "This task will be permanently removed. This can't be undone.",
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) remove(id);
  };

  const requestRemoveList = async () => {
    const ok = await confirm({
      title: 'Delete list?',
      message: `"${title}" and all of its tasks will be permanently removed. This can't be undone.`,
      confirmLabel: 'Delete list',
      danger: true,
    });
    if (ok) onRemoveList?.();
  };

  const toggleSubtaskExpanded = (taskId: string) => {
    setExpandedSubtasks((prev) => {
      const next = new Set(prev);
      if (next.has(taskId)) next.delete(taskId);
      else next.add(taskId);
      return next;
    });
  };

  const toggleCardSubtask = async (taskId: string, lineIndex: number, checked: boolean) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target?.description) return;
    const nextDesc = toggleSubtask(target.description, lineIndex, checked);
    mutate(tasks.map((t) => (t.id === taskId ? { ...t, description: nextDesc } : t)), false);
    await updateTask(taskId, { description: nextDesc });
    mutate();
  };

  const patchTask = async (id: string, patch: TaskPatch) => {
    const originalTask = tasks.find(t => t.id === id);
    if (patch.status === 'DONE' && originalTask && originalTask.status !== 'DONE') {
      playCelestialChime();
      const cardEl = cardRefs.current.get(id);
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        window.dispatchEvent(new CustomEvent('star-confetti', { detail: { x, y } }));
      } else {
        window.dispatchEvent(new CustomEvent('star-confetti', { detail: { x: window.innerWidth / 2, y: window.innerHeight / 3 } }));
      }
    }
    const next = tasks.map((t) => {
      if (t.id !== id) return t;
      const merged: Task = { ...t, ...patch } as Task;
      if (patch.assigneeId !== undefined) {
        merged.assignee = patch.assigneeId
          ? members.find((m) => m.id === patch.assigneeId) ?? null
          : null;
      }
      return merged;
    });
    mutate(next, false);
    await updateTask(id, patch);
    mutate();
  };

  const isHoveredHere = !isDraft && hoveredSlot?.listId === listId;
  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.id !== draggingTaskId),
    [tasks, draggingTaskId],
  );

  const showRenameInput = renaming && (isDraft || onRename);
  const colTheme = getColumnTheme(title);
  const openTask = openTaskId ? tasks.find((t) => t.id === openTaskId) ?? null : null;

  return (
    <>
    <div
      ref={columnRef}
      className={`glass rounded-2xl border flex flex-col transition-all duration-300 ${className} ${
        isHoveredHere && draggingTaskId
          ? 'border-primary ring-2 ring-primary/20'
          : 'border-white/20 dark:border-white/5'
      } ${isDragging ? 'opacity-40' : ''}`}
      style={{ backgroundColor: color !== DEFAULT_LIST_COLOR ? color : undefined }}
    >
      {/* Column Header */}
      <div
        onPointerDown={(e) => {
          if (!onHeaderPointerDown || showRenameInput || isDraft) return;
          if (e.button !== 0) return;
          if ((e.target as HTMLElement).closest('button, input, select, [data-no-drag]')) return;
          onHeaderPointerDown(e);
        }}
        className={`flex items-center justify-between px-4 pt-4 pb-3 ${
          onHeaderPointerDown && !showRenameInput && !isDraft ? 'cursor-grab active:cursor-grabbing' : ''
        }`}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {/* Workflow colour dot */}
          {colTheme && !showRenameInput && (
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${colTheme.dot}`} />
          )}
          {showRenameInput ? (
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onBlur={commitRename}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitRename();
                } else if (e.key === 'Escape') {
                  if (isDraft) onDraftCancel?.();
                  else {
                    setRenameValue(title);
                    setRenaming(false);
                  }
                }
              }}
              placeholder={isDraft ? 'Enter list title…' : undefined}
              className="text-sm font-semibold text-foreground bg-white/30 dark:bg-slate-900/60 border border-white/30 dark:border-white/5 rounded px-2 py-0.5 min-w-0 flex-1 focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder-muted-foreground"
            />
          ) : (
            <h3
              onDoubleClick={() => {
                if (!onRename) return;
                setRenameValue(title);
                setRenaming(true);
              }}
              className={`text-sm font-semibold text-foreground truncate ${onRename ? 'cursor-text' : ''}`}
            >
              {title}
            </h3>
          )}
          {!isDraft && (
            isLoading ? (
              <span
                aria-label="Loading task count"
                className="h-5 w-7 rounded-full bg-white/30 dark:bg-black/25 border border-white/20 dark:border-white/5 shadow-sm flex-shrink-0 animate-pulse"
              />
            ) : (
              <span className="text-xs bg-white/30 dark:bg-black/25 text-foreground px-2 py-0.5 rounded-full flex-shrink-0 font-bold border border-white/20 dark:border-white/5 shadow-sm">
                {tasks.length}
              </span>
            )
          )}
        </div>
        {!isDraft && (onRemoveList || onChangeColor) && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="text-muted-foreground hover:text-foreground p-1 rounded hover:bg-white/30 dark:hover:bg-black/20 transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-full mt-1 z-20 bg-white/95 dark:bg-slate-950/95 border border-white/30 dark:border-white/5 rounded-lg shadow-2xl dark:shadow-black/55 overflow-hidden min-w-[200px] backdrop-blur-lg animate-in zoom-in-95 duration-200">
                {onChangeColor && (
                  <div className="p-3">
                    <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 px-1">
                      Background Color
                    </div>
                    <div className="grid grid-cols-5 gap-2">
                      {LIST_COLORS.map((c) => {
                        const selected = c.value === color;
                        return (
                          <button
                            key={c.value}
                            type="button"
                            title={c.name}
                            onClick={() => {
                              onChangeColor(c.value);
                              setMenuOpen(false);
                            }}
                            style={{ background: c.value }}
                            className={`h-7 rounded-md border transition-all ${
                              selected
                                ? 'border-foreground ring-2 ring-foreground/20'
                                : 'border-white/20 dark:border-white/10 hover:border-white/40'
                            }`}
                          />
                        );
                      })}
                    </div>
                  </div>
                )}
                {onRemoveList && (
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      requestRemoveList();
                    }}
                    className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/20 dark:border-white/5"
                  >
                    <Trash2 className="w-3 h-3" />
                    Delete list
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2 custom-scrollbar">
        {!isDraft && isLoading && (
          <div className="space-y-3 py-2">
            <div className="h-16 bg-white/20 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 rounded-xl animate-pulse" />
            <div className="h-16 bg-white/20 dark:bg-slate-900/40 border border-white/20 dark:border-white/5 rounded-xl animate-pulse" />
          </div>
        )}
        {!isDraft && !isLoading && (
          <div className="flex flex-col py-1">
            {visibleTasks.map((t, i) => {
              const isTemp = t.id.startsWith('temp-');
              const showLineAbove = isHoveredHere && hoveredSlot?.index === i;
              return (
                <div key={t.id} className="relative group/card">
                  <DropLine show={!!showLineAbove} />
                  <div
                    ref={(el) => {
                      if (el) cardRefs.current.set(t.id, el);
                      else cardRefs.current.delete(t.id);
                    }}
                    onPointerDown={(e) => {
                      if (isTemp) return;
                      if (e.button !== 0) return;
                      if ((e.target as HTMLElement).closest('button, select, input')) return;
                      const element = e.currentTarget as HTMLElement;
                      const startX = e.clientX;
                      const startY = e.clientY;
                      let started = false;

                      const onMove = (ev: PointerEvent) => {
                        if (started) return;
                        const dx = ev.clientX - startX;
                        const dy = ev.clientY - startY;
                        if (dx * dx + dy * dy >= DRAG_THRESHOLD_PX * DRAG_THRESHOLD_PX) {
                          started = true;
                          cleanup();
                          startDrag(t, listId, {
                            clientX: ev.clientX,
                            clientY: ev.clientY,
                            element,
                          });
                        }
                      };
                      const onUp = () => {
                        cleanup();
                        if (!started) setOpenTaskId(t.id);
                      };
                      const onCancel = () => cleanup();
                      const cleanup = () => {
                        window.removeEventListener('pointermove', onMove);
                        window.removeEventListener('pointerup', onUp);
                        window.removeEventListener('pointercancel', onCancel);
                      };

                      window.addEventListener('pointermove', onMove);
                      window.addEventListener('pointerup', onUp);
                      window.addEventListener('pointercancel', onCancel);
                    }}
                    className={`bg-white/60 dark:bg-slate-900/40 backdrop-blur-md border border-white/20 dark:border-white/5 px-3 py-3 my-1 rounded-xl text-sm text-foreground flex flex-col gap-2.5 group transition-all duration-200 hover:bg-white/70 dark:hover:bg-slate-800/50 hover:border-white/30 dark:hover:border-white/10 hover:shadow-lg dark:hover:shadow-black/20 ${
                      isTemp ? 'opacity-50 cursor-default' : 'cursor-grab active:cursor-grabbing'
                    } ${t.status === 'DONE' ? 'opacity-60' : ''}`}
                  >
                    {/* Task title row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1 min-w-0">
                        <span
                          aria-label={`${t.priority.toLowerCase()} priority`}
                          title={`${t.priority.charAt(0) + t.priority.slice(1).toLowerCase()} priority`}
                          className="inline-block w-6 h-2.5 rounded-full border flex-shrink-0 mt-1.5"
                          style={{
                            background: `${PRIORITY_COLOR[t.priority]}26`,
                            borderColor: `${PRIORITY_COLOR[t.priority]}99`,
                          }}
                        />
                        <span className={`break-words flex-1 leading-snug transition-all text-sm ${
                          t.status === 'DONE' ? 'line-through text-foreground/60 dark:text-white/60' : 'text-foreground dark:text-white'
                        }`}>
                          {t.title}
                        </span>
                      </div>
                      <button
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={() => requestRemoveTask(t.id)}
                        className="opacity-0 group-hover/card:opacity-100 text-muted-foreground/70 hover:text-red-400 transition-all flex-shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Subtasks: dropdown arrow + checklist parsed from the description */}
                    {(() => {
                      const { done, total } = subtaskProgress(t.description);
                      if (total === 0) return null;
                      const expanded = expandedSubtasks.has(t.id);
                      const allDone = done === total;
                      return (
                        <div className="-mt-0.5">
                          <button
                            type="button"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={() => toggleSubtaskExpanded(t.id)}
                            className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground transition-colors"
                            aria-expanded={expanded}
                            title={expanded ? 'Hide subtasks' : 'Show subtasks'}
                          >
                            <ChevronRight
                              className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-90' : ''}`}
                            />
                            <CheckSquare className="w-3 h-3" />
                            <span className={allDone ? 'text-green-500' : ''}>
                              {done}/{total}
                            </span>
                          </button>
                          {expanded && (
                            <div className="mt-1 ml-1.5 space-y-0.5 border-l border-white/15 dark:border-white/10 pl-2">
                              {parseSubtasks(t.description).map((s) => (
                                <button
                                  key={s.lineIndex}
                                  type="button"
                                  onPointerDown={(e) => e.stopPropagation()}
                                  onClick={() => toggleCardSubtask(t.id, s.lineIndex, !s.checked)}
                                  className="flex items-start gap-1.5 w-full text-left py-0.5 group/sub"
                                >
                                  {s.checked ? (
                                    <CheckSquare className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-[1px]" />
                                  ) : (
                                    <Square className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-[1px] group-hover/sub:text-foreground transition-colors" />
                                  )}
                                  <span
                                    className={`text-[12px] leading-snug break-words ${
                                      s.checked
                                        ? 'line-through text-muted-foreground'
                                        : 'text-foreground/90'
                                    }`}
                                  >
                                    {s.label || 'Untitled subtask'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Footer: assignee + assign selector */}
                    <div className="flex items-center justify-between gap-2">
                      {/* Current assignee */}
                      <div className="flex items-center gap-1.5 min-w-0">
                        {t.assignee ? (
                          <div className="flex items-center gap-1.5 bg-white/30 dark:bg-black/20 rounded-full pl-0.5 pr-2 py-0.5 border border-white/20 dark:border-white/5">
                            <div className="w-5 h-5 rounded-full bg-white/50 dark:bg-slate-800/50 flex items-center justify-center text-[10px] font-bold text-foreground overflow-hidden flex-shrink-0">
                              {t.assignee.image ? (
                                <img src={t.assignee.image} alt={t.assignee.name || ''} className="w-full h-full object-cover" />
                              ) : (
                                (t.assignee.name || t.assignee.email).charAt(0).toUpperCase()
                              )}
                            </div>
                            <span className="text-[10px] text-muted-foreground font-medium truncate max-w-[80px]">
                              {t.assignee.name || 'User'}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-foreground/60 dark:text-white/60">
                            <User className="w-3 h-3" />
                            <span className="text-[10px]">Unassigned</span>
                          </div>
                        )}
                      </div>

                      {/* Assign-to selector (visible on hover) */}
                      {members.length > 0 && (
                        <div className="relative flex-shrink-0">
                          <select
                            onPointerDown={(e) => e.stopPropagation()}
                            value={t.assigneeId || ''}
                            onChange={(e) => assignTask(t.id, e.target.value || null)}
                            className="opacity-0 group-hover/card:opacity-100 text-[9px] bg-white/60 dark:bg-slate-800/60 border border-white/40 dark:border-white/10 rounded-md py-0.5 pl-1.5 pr-5 text-foreground focus:outline-none hover:border-white/60 dark:hover:border-white/20 transition-all cursor-pointer appearance-none"
                          >
                            <option value="">Assign…</option>
                            {members.map(m => (
                              <option key={m.id} value={m.id}>{m.name || m.email}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-2.5 h-2.5 text-muted-foreground pointer-events-none opacity-0 group-hover/card:opacity-100 transition-opacity" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <DropLine
              show={
                !!isHoveredHere &&
                hoveredSlot?.index === visibleTasks.length
              }
            />
          </div>
        )}
      </div>

      {!isDraft && (
        <div className="p-3 pt-0">
          {adding ? (
            <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
              <textarea
                ref={inputRef}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    submit();
                    setAdding(true);
                  } else if (e.key === 'Escape') {
                    setAdding(false);
                    setValue('');
                  }
                }}
                placeholder="What needs to be done?"
                rows={2}
                className="w-full bg-white/30 dark:bg-slate-900/60 border border-white/20 dark:border-white/5 rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none transition-all shadow-inner"
              />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    submit();
                    setAdding(true);
                  }}
                  className="px-4 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20 active:scale-95"
                >
                  Add card
                </button>
                <button
                  onClick={() => {
                    setAdding(false);
                    setValue('');
                  }}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Plus className="w-5 h-5 rotate-45" />
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setAdding(true)}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-foreground/70 dark:text-white/70 hover:bg-white/30 dark:hover:bg-black/20 hover:text-foreground dark:hover:text-white rounded-xl transition-all border border-transparent hover:border-white/20 dark:hover:border-white/5 group"
            >
              <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-medium">Add a card</span>
            </button>
          )}
        </div>
      )}
    </div>
    {openTask && (
      <TaskDetailModal
        task={openTask}
        members={members}
        onClose={() => setOpenTaskId(null)}
        onChange={(patch) => patchTask(openTask.id, patch)}
        onDelete={() => {
          remove(openTask.id);
          setOpenTaskId(null);
        }}
      />
    )}
    {confirmDialog}
    </>
  );
});

export default BoardColumn;

function DropLine({ show }: { show: boolean }) {
  return (
    <div
      aria-hidden
      className={`h-0.5 rounded-full bg-primary/50 transition-all duration-300 ${
        show ? 'opacity-100 my-2' : 'opacity-0 h-0 my-0'
      }`}
    />
  );
}

