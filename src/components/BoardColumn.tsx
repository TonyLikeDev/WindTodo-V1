"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import useSWR from 'swr';
import { createTask, deleteTask, getTasks, updateTask } from '@/app/actions/taskActions';
import { useBoardDrag } from './BoardDragContext';
import { User, Trash2, MoreHorizontal, Plus, CheckCircle2 } from 'lucide-react';

export const LIST_COLORS = [
  { name: 'Default',    value: 'rgba(255, 255, 255, 0.4)' },
  { name: 'Sky',        value: 'rgba(14, 165, 233, 0.15)' },
  { name: 'Lavender',   value: 'rgba(139, 92, 246, 0.15)' },
  { name: 'Rose',       value: 'rgba(236, 72, 153, 0.15)' },
  { name: 'Leaf',       value: 'rgba(16, 185, 129, 0.15)' },
];
export const DEFAULT_LIST_COLOR = LIST_COLORS[0].value;

type UserProfile = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string;
};

type Task = {
  id: string;
  title: string;
  listId: string;
  userId: string;
  position: number;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  type: 'TASK' | 'NOTE' | 'DOC' | 'HEADING';
  color: string | null;
  assignees: UserProfile[];
  dueDate?: Date | string | null;
  labels?: any;
  subCards?: Array<{ id: string; status: string }> | null;
  createdAt: Date;
};

const PRIORITY_BADGE: Record<string, { label: string; color: string; dot: string }> = {
  high: { label: 'High', color: 'text-red-600 bg-red-50 border-red-200', dot: 'bg-red-500' },
  urgent: { label: '🚨 Urgent', color: 'text-red-700 bg-red-100 border-red-300', dot: 'bg-red-600' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', dot: 'bg-yellow-500' },
  low: { label: 'Low', color: 'text-green-600 bg-green-50 border-green-200', dot: 'bg-green-500' },
};

export default function BoardColumn({
  listId,
  title,
  color,
  members = [],
  onRemoveList,
  onRename,
  onChangeColor,
  isDraft = false,
  onDraftCommit,
  onDraftCancel,
  className = 'w-80 lg:w-96 flex-shrink-0 h-full min-h-[600px]',
  onTaskClick,
}: {
  listId: string;
  title: string;
  color: string;
  members?: UserProfile[];
  onRemoveList?: () => void;
  onRename?: (newName: string) => void;
  onChangeColor?: (color: string) => void;
  isDraft?: boolean;
  onDraftCommit?: (name: string) => void;
  onDraftCancel?: () => void;
  className?: string;
  onTaskClick?: (taskId: string) => void;
}) {

  const { data: tasks = [], mutate, isLoading } = useSWR<Task[]>(
    isDraft ? null : listId,
    () => getTasks(listId)
  );

  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
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
    const optimistic: any = {
      id: `temp-${Date.now()}`,
      title: trimmed,
      listId,
      userId: 'temp',
      position: tasks.length,
      status: 'TODO',
      assignees: [],
      createdAt: new Date(),
    };
    mutate([...tasks, optimistic], false);
    setValue('');
    await createTask(trimmed, listId);
    mutate();
  };

  const remove = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    mutate(tasks.filter((t) => t.id !== id), false);
    await deleteTask(id);
    mutate();
  };

  const isHoveredHere = !isDraft && hoveredSlot?.listId === listId;
  const visibleTasks = useMemo(
    () => tasks.filter((t) => t.id !== draggingTaskId),
    [tasks, draggingTaskId],
  );

  return (
    <div
      ref={columnRef}
      className={`flex flex-col h-full bg-white/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-sky-dark/5 overflow-hidden ring-1 ring-white/20 transition-all duration-300 relative ${className} ${
        isHoveredHere && draggingTaskId ? 'ring-4 ring-primary/30 scale-[1.01]' : ''
      }`}
    >

      {/* Header */}
      <div className="p-5 flex items-center justify-between gap-3">
         <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-2 h-6 rounded-full" style={{ backgroundColor: color }} />
            {renaming ? (
               <input 
                 ref={renameInputRef}
                 value={renameValue}
                 onChange={e => setRenameValue(e.target.value)}
                 onBlur={commitRename}
                 className="bg-white/40 border border-white/40 rounded-lg px-2 py-1 text-sm font-bold text-foreground outline-none focus:ring-2 focus:ring-primary/20 w-full"
               />
            ) : (
               <h3 
                 onDoubleClick={() => setRenaming(true)}
                 className="text-sm font-black text-foreground truncate uppercase tracking-widest cursor-text"
               >
                 {title}
               </h3>
            )}
            <span className="text-[10px] font-black text-muted-foreground bg-white/40 px-2 py-1 rounded-lg">
               {tasks.length}
            </span>
         </div>
      </div>

      {/* Task List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar">
         {visibleTasks.map((t, i) => {
           const isHoveredSlot = isHoveredHere && hoveredSlot?.index === i;
           return (
             <div key={t.id} className="relative">
                {isHoveredSlot && <div className="h-20 bg-primary/5 rounded-2xl border-2 border-dashed border-primary/20 my-2 animate-pulse" />}
                <div 
                  ref={el => { if (el) cardRefs.current.set(t.id, el); else cardRefs.current.delete(t.id); }}
                  onClick={() => onTaskClick?.(t.id)}
                  onPointerDown={(e) => {
                    if (t.id.startsWith('temp-')) return;
                    if ((e.target as HTMLElement).closest('button, select, input')) return;
                    startDrag(t as any, e as any, listId);
                  }}
                  className={`bg-white/60 backdrop-blur-md border border-white/60 p-4 rounded-2xl shadow-sm my-2 group cursor-grab active:cursor-grabbing hover:shadow-lg hover:shadow-sky-dark/5 transition-all hover:scale-[1.02] active:scale-[0.98] ${t.status === 'DONE' ? 'opacity-60' : ''}`}
                  style={{ borderLeft: t.color ? `6px solid ${t.color}` : undefined }}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                     <div className="flex items-start gap-2 flex-1">
                        <span className={`text-sm font-bold text-foreground leading-tight ${t.status === 'DONE' ? 'line-through text-muted-foreground' : ''}`}>
                          {t.title}
                        </span>
                     </div>
                     <button 
                       onClick={e => remove(t.id, e as any)}
                       className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-red-500 transition-all"
                     >
                       <Trash2 size={14} />
                     </button>
                  </div>

                   {/* Meta data display */}
                   <div className="flex items-center justify-between mt-4">
                      <div className="flex items-center gap-2">
                         <button 
                           onClick={async (e) => {
                             e.stopPropagation();
                             const newStatus = t.status === 'DONE' ? 'TODO' : 'DONE';
                             mutate(tasks.map(task => task.id === t.id ? { ...task, status: newStatus } : task), false);
                             await updateTask(t.id, { status: newStatus });
                             mutate();
                           }}
                           className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                             t.status === 'DONE' ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary hover:bg-primary/20'
                           }`}
                         >
                            <CheckCircle2 size={14} />
                         </button>
                         
                         {/* Multi-Assignee Avatar Stack */}
                         <div className="flex -space-x-1.5 ml-1">
                            {t.assignees && t.assignees.length > 0 ? (
                              t.assignees.slice(0, 3).map((u, idx) => (
                                <div key={u.id} className="w-5 h-5 rounded-md bg-white border border-white shadow-sm flex items-center justify-center text-[7px] font-black text-primary overflow-hidden ring-1 ring-black/5" style={{ zIndex: 10 - idx }}>
                                   {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0)}
                                </div>
                              ))
                            ) : (
                               <div className="w-5 h-5 rounded-md bg-black/5 flex items-center justify-center">
                                  <User size={8} className="text-muted-foreground/30" />
                               </div>
                            )}
                         </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-30 group-hover:opacity-100 transition-opacity">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                         <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{t.status}</span>
                      </div>
                   </div>
                </div>
             </div>
           );
         })}
      </div>

      {/* Footer / Add Task */}
      <div className="p-4 pt-0">
         {adding ? (
            <div className="space-y-3 bg-white/40 p-3 rounded-2xl border border-white/40">
               <textarea 
                 ref={inputRef}
                 value={value}
                 onChange={e => setValue(e.target.value)}
                 onKeyDown={e => {
                   if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
                   if (e.key === 'Escape') setAdding(false);
                 }}
                 placeholder="What needs to be done?"
                 rows={2}
                 className="w-full bg-transparent border-none text-sm font-bold text-foreground placeholder-muted-foreground/60 outline-none resize-none"
               />
               <div className="flex items-center justify-between">
                  <button onClick={submit} className="btn-primary !py-1.5 !px-4 !text-[10px]">Add Task</button>
                  <button onClick={() => setAdding(false)} className="p-1.5 hover:bg-white/40 rounded-xl"><Plus className="rotate-45" size={16} /></button>
               </div>
            </div>
         ) : (
            <button 
              onClick={() => setAdding(true)}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-dashed border-white/60 text-xs font-black text-muted-foreground uppercase tracking-widest hover:bg-white/40 hover:border-primary/20 hover:text-primary transition-all"
            >
               <Plus size={16} /> Add Task
            </button>
         )}
      </div>
    </div>
  );
}
