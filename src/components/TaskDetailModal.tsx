/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useEffect, useRef, useState } from 'react';
import { Trash2, X, User as UserIcon, Flag, Layers, CircleDot, Calendar, Paperclip, FileText, Image as ImageIcon, FileArchive, Download, CheckSquare, Square, Plus } from 'lucide-react';
import { deleteAttachment } from '@/app/actions/attachmentActions';
import { useConfirm } from './ConfirmDialog';
import { addSubtask, parseSubtasks, toggleSubtask } from '@/lib/subtasks';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskType = 'TASK' | 'STORY' | 'BUG';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type ModalUserProfile = {
  id: string;
  name: string | null;
  image: string | null;
  email: string;
};

export type TaskAttachmentData = {
  id: string;
  url: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: Date | string;
  userId: string;
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
  attachments?: TaskAttachmentData[];
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
  LOW: 'bg-muted/30 text-muted-foreground border-muted/40 font-bold',
  MEDIUM: 'bg-primary/15 text-primary border-primary/20 font-bold',
  HIGH: 'bg-orange-500/15 text-orange-700 border-orange-500/20 font-bold',
  URGENT: 'bg-red-500/15 text-red-700 border-red-500/20 font-bold',
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  TODO: 'bg-muted/30 text-muted-foreground border-muted/40 font-bold',
  IN_PROGRESS: 'bg-primary/15 text-primary border-primary/20 font-bold',
  DONE: 'bg-green-500/15 text-green-700 border-green-500/20 font-bold',
};

const TYPE_STYLES: Record<TaskType, string> = {
  TASK: 'bg-gray-200/80 text-gray-700 border-gray-300',
  STORY: 'bg-green-100/80 text-green-700 border-green-300',
  BUG: 'bg-rose-100/80 text-rose-700 border-rose-300',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function FileIcon({ mimeType }: { mimeType: string }) {
  if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 flex-shrink-0" />;
  if (mimeType === 'application/zip' || mimeType.includes('compressed')) return <FileArchive className="w-4 h-4 flex-shrink-0" />;
  return <FileText className="w-4 h-4 flex-shrink-0" />;
}

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
  const [newSubtask, setNewSubtask] = useState('');
  const [attachments, setAttachments] = useState<TaskAttachmentData[]>(task.attachments ?? []);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const descRef = useRef<HTMLTextAreaElement>(null);
  const { confirm, confirmDialog } = useConfirm();

  const subtasks = parseSubtasks(description);
  const subtaskDone = subtasks.filter((s) => s.checked).length;

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? '');
    setAttachments(task.attachments ?? []);
  }, [task.id, task.title, task.description, task.attachments]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { commitTitle(); commitDescription(); onClose(); }
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

  const uploadFile = async (file: File) => {
    setUploadError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('taskId', task.id);
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setAttachments((prev) => [...prev, data as TaskAttachmentData]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    await uploadFile(file);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    await uploadFile(file);
  };

  const handleDeleteAttachment = async (id: string) => {
    try {
      await deleteAttachment(id);
      setAttachments((prev) => prev.filter((a) => a.id !== id));
    } catch {
      // silently ignore — user can retry
    }
  };

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

  // Subtasks live inside the description text — update local state for instant
  // feedback and persist through the same description field.
  const applyDescription = (next: string) => {
    setDescription(next);
    onChange({ description: next.trim() ? next : null });
  };

  const handleToggleSubtask = (lineIndex: number, checked: boolean) => {
    applyDescription(toggleSubtask(description, lineIndex, checked));
  };

  const handleAddSubtask = () => {
    const label = newSubtask.trim();
    if (!label) return;
    applyDescription(addSubtask(description, label));
    setNewSubtask('');
  };

  const handleDelete = async () => {
    const ok = await confirm({
      title: 'Delete task?',
      message: `"${task.title}" will be permanently removed. This can't be undone.`,
      confirmLabel: 'Delete',
      danger: true,
    });
    if (ok) onDelete();
  };

  return (
    <>
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto animate-bubble-fade"
      onPointerDown={(e) => {
        if (e.target === e.currentTarget) {
          commitTitle();
          commitDescription();
          onClose();
        }
      }}
    >
      <div className="w-full max-w-6xl my-12 bg-background border border-border rounded-2xl shadow-2xl overflow-hidden animate-bubble-pop">
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
              onClick={handleDelete}
              className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 p-2 rounded-lg transition-colors"
              title="Delete task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => { commitTitle(); commitDescription(); onClose(); }}
              className="text-muted-foreground hover:text-foreground hover:bg-white/10 p-2 rounded-lg transition-colors"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_280px] gap-6 px-6 py-6">
          {/* Left: description + attachments */}
          <div className="space-y-5">
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Description
              </div>
              <textarea
                ref={descRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={commitDescription}
                placeholder="Add a description…  Tip: type [] to start a subtask."
                className="w-full min-h-[240px] bg-white/[0.04] border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/20 resize-none transition-all"
              />
            </div>

            {/* Subtasks (checklist parsed from the description) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Subtasks {subtasks.length > 0 && (
                    <span className="normal-case font-normal">({subtaskDone}/{subtasks.length})</span>
                  )}
                </div>
              </div>

              {subtasks.length > 0 && (
                <>
                  <div className="mb-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${(subtaskDone / subtasks.length) * 100}%` }}
                    />
                  </div>
                  <div className="space-y-0.5 mb-2">
                    {subtasks.map((s) => (
                      <div
                        key={s.lineIndex}
                        className="flex items-start gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors"
                      >
                        <button
                          type="button"
                          onClick={() => handleToggleSubtask(s.lineIndex, !s.checked)}
                          className="mt-[1px] flex-shrink-0 text-muted-foreground hover:text-primary transition-colors"
                          aria-label={s.checked ? 'Mark incomplete' : 'Mark complete'}
                        >
                          {s.checked ? (
                            <CheckSquare className="w-4 h-4 text-primary" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>
                        <span
                          className={`text-sm flex-1 break-words ${
                            s.checked ? 'line-through text-muted-foreground' : 'text-foreground'
                          }`}
                        >
                          {s.label || (
                            <span className="italic text-muted-foreground/60">Untitled subtask</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="flex items-center gap-2">
                <input
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Add a subtask…"
                  className="flex-1 bg-white/[0.04] border border-border rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring/20 transition-all"
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold rounded-lg bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </div>

            {/* Attachments */}
            <div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                Attachments {attachments.length > 0 && <span className="normal-case font-normal">({attachments.length})</span>}
              </div>

              {/* Drop zone */}
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 cursor-pointer transition-colors
                  ${dragOver
                    ? 'border-primary/60 bg-primary/5'
                    : 'border-border/60 hover:border-border hover:bg-white/[0.03]'
                  }
                  ${uploading ? 'pointer-events-none opacity-60' : ''}
                `}
              >
                <Paperclip className={`w-5 h-5 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    {uploading
                      ? 'Uploading…'
                      : dragOver
                      ? 'Drop file here'
                      : 'Drag & drop a file here, or click to browse'}
                  </p>
                  <p className="text-[11px] text-muted-foreground/50 mt-0.5">Max 10 MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>

              {uploadError && (
                <p className="text-xs text-red-400 mt-2">{uploadError}</p>
              )}

              {/* File list */}
              {attachments.length > 0 && (
                <div className="space-y-1.5 mt-3">
                  {attachments.map((a) => (
                    <div
                      key={a.id}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-white/[0.04] border border-border group"
                    >
                      <span className="text-muted-foreground">
                        <FileIcon mimeType={a.mimeType} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">{a.fileName}</p>
                        <p className="text-[11px] text-muted-foreground">{formatBytes(a.fileSize)}</p>
                      </div>
                      <a
                        href={a.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground hover:text-foreground p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Download"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                      <button
                        onClick={() => handleDeleteAttachment(a.id)}
                        className="text-muted-foreground hover:text-red-400 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove attachment"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
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
    {confirmDialog}
    </>
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
