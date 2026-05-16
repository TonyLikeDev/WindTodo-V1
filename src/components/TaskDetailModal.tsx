"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  X, 
  AlignLeft, 
  CheckSquare, 
  Calendar, 
  Tag, 
  User as UserIcon, 
  Clock, 
  Plus, 
  Trash2,
  Sparkles,
  ArrowLeft,
  Loader2,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import useSWR from 'swr';
import { getCardById, updateCard, createSubCard, deleteCard } from '@/app/actions/taskActions';
import RichTextEditor from './RichTextEditor';
import { useBoardStore } from '@/store/boardStore';
import { motion, AnimatePresence } from 'framer-motion';

import { Prisma } from '@prisma/client';

type UserProfile = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  email: string;
};

type Label = {
  name: string;
  color: string;
};

type Card = {
  id: string;
  title: string;
  description: string | null;
  contentJson: any | null;
  dueDate: Date | null;
  labels: Prisma.JsonValue | Label[] | null;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  assignees: UserProfile[];
  listId: string;
  subCards?: Card[] | null; 
};

export const PRESET_COLORS = [
  '#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', 
  '#ef4444', '#64748b', '#065f46', '#14532d', '#334155'
];

export default function TaskDetailModal({
  taskId: cardId,
  members,
  onClose,
  onUpdate,
}: {
  taskId: string;
  members: UserProfile[];
  onClose: () => void;
  onUpdate: () => void;
}) {
  const { openTask, taskStack, goBackTask } = useBoardStore();
  const { data: card, mutate: mutateCard, isLoading } = useSWR(
    `card:${cardId}`,
    () => getCardById(cardId)
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contentJson, setContentJson] = useState<any>(null);
  const [dueDate, setDueDate] = useState<string>('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [assigneeIds, setAssigneeIds] = useState<string[]>([]);
  const [taskType, setTaskType] = useState<'TASK' | 'NOTE' | 'DOC' | 'HEADING'>('TASK');
  const [cardColor, setCardColor] = useState<string | null>(null);

  const [showAssigneePicker, setShowAssigneePicker] = useState(false);

  useEffect(() => {
    if (card) {
      setTitle(card.title);
      setDescription(card.description || '');
      setContentJson((card as any).contentJson || null);
      setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().slice(0, 16) : '');
      setLabels(card.labels as Label[] || []);
      setAssigneeIds(card.assignees?.map(u => u.id) || []);
      setTaskType((card as any).type || 'TASK');
      setCardColor((card as any).color || null);
    }
  }, [card?.id]); 
  
  const [isSaving, setIsSaving] = useState(false);
  const [showLabelPicker, setShowLabelPicker] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(PRESET_COLORS[0]);

  const modalRef = useRef<HTMLDivElement>(null);

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-sky-dark/20 backdrop-blur-xl">
        <div className="glass w-full max-w-lg p-16 rounded-[3rem] text-center border-white/40 shadow-2xl">
          <Loader2 className="animate-spin text-primary mx-auto mb-6" size={48} />
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Gathering Clarity...</p>
        </div>
      </div>
    );
  }

  if (!card) return null;

  const handleUpdate = async (updates: any) => {
    setIsSaving(true);
    try {
      await updateCard(card.id, updates);
      onUpdate();
      mutateCard();
    } catch (err) {
      console.error('Failed to update card:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleAssignee = (userId: string) => {
    const nextIds = assigneeIds.includes(userId)
      ? assigneeIds.filter(id => id !== userId)
      : [...assigneeIds, userId];
    
    setAssigneeIds(nextIds);
    handleUpdate({ assigneeIds: nextIds });
  };

  const addLabel = () => {
    if (!newLabelName.trim()) return;
    const next = [...labels, { name: newLabelName, color: newLabelColor }];
    setLabels(next);
    handleUpdate({ labels: next });
    setNewLabelName('');
    setShowLabelPicker(false);
  };

  const removeLabel = (index: number) => {
    const next = labels.filter((_, i) => i !== index);
    setLabels(next);
    handleUpdate({ labels: next });
  };

  const handleAddSubtask = async (text: string) => {
    setIsSaving(true);
    try {
      await createSubCard(text, card.id, card.listId);
      onUpdate();
      mutateCard();
    } catch (err) {
      console.error('Failed to create subcard:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSubtask = async (sub: Card) => {
    const newStatus = sub.status === 'DONE' ? 'TODO' : 'DONE';
    await updateCard(sub.id, { status: newStatus });
    onUpdate();
    mutateCard();
  };

  const removeSubtask = async (id: string) => {
    await deleteCard(id);
    onUpdate();
    mutateCard();
  };

  const subCards = card.subCards || [];
  const completedSubtasks = subCards.filter(s => s.status === 'DONE').length;
  const progress = subCards.length > 0 ? Math.round((completedSubtasks / subCards.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-sky-dark/30 backdrop-blur-md animate-in fade-in duration-500">
      <div 
        ref={modalRef}
        className="glass w-full max-w-5xl max-h-full rounded-[3.5rem] shadow-[0_32px_64px_-12px_rgba(15,23,42,0.2)] overflow-hidden flex flex-col border-white/60 animate-in zoom-in-95 duration-500 relative"
      >
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-accent-lavender/30 rounded-full blur-[100px] pointer-events-none" />

        <header className="p-10 pb-6 flex items-start justify-between relative z-10">
          <div className="flex gap-6 flex-1">
            <div className="flex flex-col gap-4">
              {taskStack.length > 0 && (
                <button onClick={goBackTask} className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:opacity-70 transition-opacity">
                  <ArrowLeft size={14} /> Back to Parent
                </button>
              )}
              <div className="flex gap-6 items-start">
                <div className="mt-2 p-3 bg-primary/10 rounded-2xl text-primary shadow-inner">
                  <Sparkles size={24} />
                </div>
                <div className="flex-1">
                  <input 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={() => title !== card.title && handleUpdate({ title })}
                    className="text-3xl font-black text-foreground bg-transparent border-none focus:ring-0 w-full p-0 outline-none tracking-tight placeholder-muted-foreground/30"
                    placeholder="Task Title..."
                  />
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Priority Focus</span>
                    <div className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{card.status?.replace('_', ' ')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-3 hover:bg-white/60 rounded-[1.5rem] transition-all group border border-transparent hover:border-white/60 shadow-sm">
            <X size={24} className="text-muted-foreground group-hover:text-foreground group-hover:rotate-90 transition-all duration-300" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-10 pt-4 relative z-10">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-12">
            
            <div className="xl:col-span-3 space-y-12">
              <div className="flex flex-wrap gap-10">
                {labels.length > 0 && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Labels</h4>
                    <div className="flex flex-wrap gap-2.5">
                      {labels.map((l, i) => (
                        <div key={i} className="px-4 py-2 rounded-2xl text-[10px] font-black text-white shadow-lg flex items-center gap-3" style={{ backgroundColor: l.color }}>
                          {l.name}
                          <button onClick={() => removeLabel(i)}><X size={12} /></button>
                        </div>
                      ))}
                      <button onClick={() => setShowLabelPicker(true)} className="w-10 h-9 glass rounded-2xl flex items-center justify-center text-primary shadow-sm hover:bg-white">
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Assignees</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-3 hover:space-x-1 transition-all">
                      {card.assignees?.map((u) => (
                        <div key={u.id} className="w-10 h-10 rounded-[1.25rem] bg-white flex items-center justify-center text-sm font-black text-primary overflow-hidden shadow-md border-2 border-white ring-1 ring-black/5">
                           {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0).toUpperCase()}
                        </div>
                      ))}
                      <button 
                        onClick={() => setShowAssigneePicker(!showAssigneePicker)}
                        className="w-10 h-10 rounded-[1.25rem] bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white hover:scale-110 transition-all relative z-10"
                      >
                         <Plus size={18} />
                      </button>
                    </div>
                    
                    {/* Assignee Picker Dropdown */}
                    <AnimatePresence>
                      {showAssigneePicker && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: 10 }}
                          className="absolute mt-12 glass p-4 rounded-[2rem] shadow-2xl border-white w-64 z-[100]"
                        >
                          <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-4 px-2">Assign Team Members</p>
                          <div className="space-y-1 max-h-60 overflow-y-auto custom-scrollbar">
                             {members.map(m => {
                               const isAssigned = assigneeIds.includes(m.id);
                               return (
                                 <button 
                                   key={m.id}
                                   onClick={() => toggleAssignee(m.id)}
                                   className={`w-full flex items-center justify-between p-3 rounded-2xl transition-all ${isAssigned ? 'bg-primary/10 text-primary' : 'hover:bg-black/5 text-foreground'}`}
                                 >
                                   <div className="flex items-center gap-3">
                                      <div className="w-7 h-7 rounded-lg bg-white flex items-center justify-center text-[10px] font-black border border-black/5 overflow-hidden">
                                        {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.name?.charAt(0)}
                                      </div>
                                      <span className="text-xs font-bold truncate max-w-[100px]">{m.name || m.email}</span>
                                   </div>
                                   {isAssigned && <UserCheck size={14} />}
                                 </button>
                               );
                             })}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">Timeline</h4>
                  <div className="flex items-center gap-4 px-5 py-2.5 bg-primary/10 text-primary rounded-[1.5rem] border border-primary/10 shadow-sm relative">
                     <Calendar size={18} />
                     <span className="text-xs font-black">{dueDate ? new Date(dueDate).toLocaleDateString() : 'Set Deadline'}</span>
                     <input 
                        type="datetime-local" 
                        value={dueDate}
                        onChange={(e) => {
                          setDueDate(e.target.value);
                          handleUpdate({ dueDate: e.target.value ? new Date(e.target.value) : null });
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer"
                      />
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/40 rounded-xl flex items-center justify-center text-primary shadow-sm border border-white/60">
                    <AlignLeft size={18} />
                  </div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Project Wiki</h3>
                </div>
                <div className="glass rounded-[2.5rem] p-6 border-white/60 shadow-inner bg-white/20">
                  <RichTextEditor 
                  content={contentJson || description}
                  onChange={(json, html) => {
                    setContentJson(json);
                    setDescription(html);
                    handleUpdate({ contentJson: json, description: html });
                  }}
                  placeholder="Capture your thoughts, requirements, and inspiration here..."
                />
                </div>
              </div>

              <div className="space-y-8 pb-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-white/40 rounded-xl flex items-center justify-center text-primary shadow-sm border border-white/60">
                      <CheckSquare size={18} />
                    </div>
                    <h3 className="text-lg font-black text-foreground tracking-tight">Milestones</h3>
                  </div>
                  <div className="flex items-center gap-4 bg-white/40 px-4 py-2 rounded-2xl border border-white/60">
                    <div className="w-32 h-2 bg-white/60 rounded-full overflow-hidden border border-white/40">
                      <div className={`h-full transition-all duration-1000 ease-out shadow-lg shadow-primary/20 ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} style={{ width: `${progress}%` }} />
                    </div>
                    <span className="text-xs font-black text-primary">{progress}%</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {subCards.map(sub => (
                    <div key={sub.id} onClick={() => openTask(sub.id)} className="group/sub p-6 rounded-[2rem] bg-white/40 border border-white/40 hover:bg-white/60 hover:shadow-xl hover:shadow-sky-dark/5 transition-all flex items-center gap-6 cursor-pointer">
                      <button onClick={(e) => { e.stopPropagation(); toggleSubtask(sub); }} className={`w-7 h-7 rounded-xl border-2 shadow-sm ${sub.status === 'DONE' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-white/60'}`}>
                        {sub.status === 'DONE' && <CheckCircle2 size={16} />}
                      </button>
                      <div className="flex-1">
                        <span className={`text-base font-bold ${sub.status === 'DONE' ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}>{sub.title}</span>
                      </div>
                      <div className="opacity-0 group-hover/sub:opacity-100 flex items-center gap-2 transition-all">
                        <button onClick={(e) => { e.stopPropagation(); removeSubtask(sub.id); }} className="p-3 text-muted-foreground hover:text-red-500 transition-all hover:bg-red-50 rounded-2xl"><Trash2 size={18} /></button>
                        <ChevronRight size={20} className="text-primary/40" />
                      </div>
                    </div>
                  ))}
                  <div className="pt-2">
                    <SubtaskInput onAdd={handleAddSubtask} />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="glass p-6 rounded-[2.5rem] border-white/60 space-y-8">
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 px-2">Configuration</h4>
                  <div className="space-y-2">
                    <button onClick={() => setShowLabelPicker(true)} className="sky-sidebar-btn group">
                       <Tag size={18} className="text-primary" /> <span>Labels</span>
                    </button>
                    <button onClick={() => setShowAssigneePicker(!showAssigneePicker)} className="sky-sidebar-btn group">
                        <UserIcon size={18} className="text-primary" /> <span>Multi-Assign</span>
                    </button>
                    
                    <div className="space-y-3 pt-4">
                       <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest px-2">Card Tone</p>
                       <div className="grid grid-cols-5 gap-2 px-2">
                          {PRESET_COLORS.map(c => (
                            <button key={c} onClick={() => { setCardColor(c); handleUpdate({ color: c } as any); }} className={`h-6 rounded-lg transition-all ${cardColor === c ? 'ring-2 ring-primary ring-offset-2 scale-110 shadow-md' : 'opacity-60 hover:opacity-100'}`} style={{ backgroundColor: c }} />
                          ))}
                       </div>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-4 px-2">Dangerous</h4>
                  <button onClick={() => removeSubtask(card.id)} className="sky-sidebar-btn !text-red-500 hover:!bg-red-50 group">
                    <Trash2 size={18} /> <span>Archive Task</span>
                  </button>
                </div>
                {isSaving && (
                  <div className="flex items-center justify-center gap-3 py-2 text-[9px] font-black text-primary uppercase tracking-[0.3em] animate-pulse">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full animate-ping" /> Syncing...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {showLabelPicker && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
             <div className="absolute inset-0 bg-sky-dark/20 backdrop-blur-sm" onClick={() => setShowLabelPicker(false)} />
             <div className="glass relative w-96 rounded-[2.5rem] shadow-2xl p-10 animate-in zoom-in-95 duration-300 border-white">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-black text-foreground tracking-tight">Create Label</h3>
                  <button onClick={() => setShowLabelPicker(false)} className="p-2 hover:bg-muted rounded-xl transition-all"><Plus className="rotate-45" size={24} /></button>
                </div>
                <div className="space-y-8">
                  <input value={newLabelName} onChange={(e) => setNewLabelName(e.target.value)} placeholder="Label Name..." className="w-full bg-white/40 border border-white/60 rounded-[1.25rem] px-5 py-3 text-sm font-bold outline-none" />
                  <div className="grid grid-cols-5 gap-3">
                    {PRESET_COLORS.map(c => (
                      <button key={c} onClick={() => setNewLabelColor(c)} className={`h-10 rounded-xl transition-all shadow-sm ${newLabelColor === c ? 'ring-4 ring-primary/20 scale-110' : 'opacity-60'}`} style={{ backgroundColor: c }} />
                    ))}
                  </div>
                  <button onClick={addLabel} className="btn-primary w-full !py-4 !text-[10px] !uppercase !tracking-widest">Generate Label</button>
                </div>
             </div>
          </div>
        )}

        <style jsx>{`
          .sky-sidebar-btn {
            display: flex;
            align-items: center;
            gap: 16px;
            width: 100%;
            padding: 12px 20px;
            background: rgba(255, 255, 255, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.6);
            border-radius: 1.25rem;
            font-size: 12px;
            font-weight: 800;
            color: #475569;
            transition: all 0.3s;
            text-align: left;
          }
          .sky-sidebar-btn:hover {
            background: white;
            color: var(--primary);
            transform: translateY(-2px);
          }
        `}</style>
      </div>
    </div>
  );
}

function SubtaskInput({ onAdd }: { onAdd: (text: string) => void }) {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState('');
  if (!adding) return (
    <button onClick={() => setAdding(true)} className="w-full flex items-center justify-center gap-4 p-6 bg-white/30 hover:bg-white/60 border-2 border-dashed border-white/60 rounded-[2.5rem] text-xs font-black text-muted-foreground uppercase tracking-[0.2em] transition-all">
      <Plus size={20} /> New Milestone
    </button>
  );
  return (
    <div className="space-y-4 glass p-6 rounded-[2.5rem] border-primary/20 bg-white/60">
      <textarea autoFocus value={text} onChange={(e) => setText(e.target.value)} placeholder="Describe the milestone..." className="w-full bg-transparent border-none text-base font-bold text-foreground outline-none resize-none" rows={2} />
      <div className="flex items-center justify-between pt-4 border-t border-white/60">
        <button onClick={() => { if (text.trim()) { onAdd(text); setText(''); setAdding(false); } }} className="btn-primary !py-2 !px-6 !text-[10px] !uppercase">Add Milestone</button>
        <button onClick={() => { setAdding(false); setText(''); }} className="p-3 text-muted-foreground"><X size={20} /></button>
      </div>
    </div>
  );
}
