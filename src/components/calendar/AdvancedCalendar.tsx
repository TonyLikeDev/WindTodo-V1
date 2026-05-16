"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  addWeeks,
  subWeeks,
  startOfYear,
  endOfYear,
  eachMonthOfInterval,
  addYears,
  subYears,
  parseISO,
  isWithinInterval,
  differenceInDays,
  eachWeekOfInterval,
  isBefore,
  isAfter,
  startOfDay,
  endOfDay
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  LayoutGrid, 
  Columns, 
  CalendarDays,
  Plus,
  Sparkles,
  Search,
  Filter,
  MoreHorizontal,
  X,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
export type CalendarPriority = 'high' | 'medium' | 'low';

export interface CalendarTask {
  id: string;
  title: string;
  start_date: string; // YYYY-MM-DD
  end_date: string;   // YYYY-MM-DD
  priority: CalendarPriority;
  is_all_day?: boolean;
  is_completed?: boolean;
}

interface AdvancedCalendarProps {
  tasks: CalendarTask[];
  onCreateTask: (data: { title: string, startDate: Date, endDate: Date, priority: CalendarPriority }) => void;
  onOpenTaskModal: (taskId: string) => void;
  onToggleTask: (taskId: string, completed: boolean) => void;
}

type ViewMode = 'month' | 'week' | 'year';

// --- Helper Components ---

const QuickCreatePopover = ({ date, onSave, onCancel }: { date: Date, onSave: (title: string, priority: CalendarPriority) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<CalendarPriority>('medium');

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: 10 }}
      className="absolute top-full left-0 mt-2 z-[100] glass p-4 rounded-3xl shadow-2xl border-white/60 min-w-[240px]"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-[10px] font-black text-primary uppercase tracking-widest">New Event • {format(date, 'MMM d')}</span>
        <button onClick={onCancel} className="text-muted-foreground hover:text-foreground"><X size={14} /></button>
      </div>
      <input 
        autoFocus
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Event title..."
        className="w-full bg-white/40 border border-white/60 rounded-xl px-4 py-2.5 text-sm font-bold outline-none mb-4 focus:ring-2 ring-primary/20"
        onKeyDown={(e) => e.key === 'Enter' && title.trim() && onSave(title, priority)}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1.5">
          {(['low', 'medium', 'high'] as const).map(p => (
            <button 
              key={p} 
              onClick={() => setPriority(p)}
              className={`w-6 h-6 rounded-lg border transition-all ${priority === p ? 'ring-2 ring-primary ring-offset-2 scale-110' : 'opacity-40'}`}
              style={{ backgroundColor: p === 'high' ? '#ef4444' : p === 'medium' ? '#f59e0b' : '#3b82f6' }}
            />
          ))}
        </div>
        <button 
          disabled={!title.trim()}
          onClick={() => onSave(title, priority)}
          className="bg-primary text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 disabled:opacity-30"
        >
          Create
        </button>
      </div>
    </motion.div>
  );
};

// --- Main Component ---

export default function AdvancedCalendar({ tasks, onCreateTask, onOpenTaskModal, onToggleTask }: AdvancedCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null);

  // --- Navigation ---
  const next = () => {
    if (viewMode === 'month') setCurrentDate(addMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(addWeeks(currentDate, 1));
    else setCurrentDate(addYears(currentDate, 1));
  };

  const prev = () => {
    if (viewMode === 'month') setCurrentDate(subMonths(currentDate, 1));
    else if (viewMode === 'week') setCurrentDate(subWeeks(currentDate, 1));
    else setCurrentDate(subYears(currentDate, 1));
  };

  const today = () => setCurrentDate(new Date());

  // --- Multi-day Bar Logic ---
  const getWeekTasks = (weekStart: Date, weekEnd: Date) => {
    const overlapping = tasks.filter(task => {
      const start = parseISO(task.start_date);
      const end = parseISO(task.end_date);
      return isBefore(start, weekEnd) && isAfter(end, weekStart) || isSameDay(start, weekStart) || isSameDay(end, weekEnd);
    });

    // Assign lanes
    const sorted = overlapping.sort((a, b) => {
      const startA = parseISO(a.start_date);
      const startB = parseISO(b.start_date);
      if (isSameDay(startA, startB)) {
        return differenceInDays(parseISO(b.end_date), parseISO(b.start_date)) - 
               differenceInDays(parseISO(a.end_date), parseISO(a.start_date));
      }
      return startA.getTime() - startB.getTime();
    });

    const lanes: (CalendarTask | null)[][] = [];
    sorted.forEach(task => {
      let laneIndex = 0;
      while (true) {
        if (!lanes[laneIndex]) lanes[laneIndex] = [];
        const isFree = !lanes[laneIndex].some(t => {
          if (!t) return false;
          const s1 = parseISO(task.start_date);
          const e1 = parseISO(task.end_date);
          const s2 = parseISO(t.start_date);
          const e2 = parseISO(t.end_date);
          return (isBefore(s1, e2) && isAfter(e1, s2)) || isSameDay(s1, e2) || isSameDay(e1, s2);
        });
        if (isFree) {
          lanes[laneIndex].push(task);
          break;
        }
        laneIndex++;
      }
    });

    return lanes;
  };

  // --- Render Month View ---
  const renderMonthView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });
    const weeks = eachWeekOfInterval({ start: startDate, end: endDate }, { weekStartsOn: 1 });

    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <div className="flex flex-col h-full animate-in fade-in duration-500 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/20 bg-white/5 backdrop-blur-md sticky top-0 z-20">
          {weekDays.map(day => (
            <div key={day} className="py-4 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              {day}
            </div>
          ))}
        </div>
        <div className="flex-1 flex flex-col bg-white/5 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          {weeks.map((week, weekIndex) => {
            const weekStart = week;
            const weekEnd = endOfWeek(week, { weekStartsOn: 1 });
            const days = eachDayOfInterval({ start: weekStart, end: weekEnd });
            const lanes = getWeekTasks(weekStart, weekEnd);

            return (
              <div key={weekIndex} className="min-h-[140px] flex flex-col border-b border-white/10 relative">
                {/* Day Grid Background */}
                <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
                  {days.map((day, i) => (
                    <div key={i} className="border-r border-white/5 last:border-0" />
                  ))}
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 relative z-10 p-2">
                  {days.map((day, i) => {
                    const isCurrMonth = isSameMonth(day, monthStart);
                    const isTdy = isToday(day);
                    return (
                      <div key={i} className={`flex flex-col items-center gap-1 group/day relative ${!isCurrMonth ? 'opacity-20' : ''}`}>
                         <span className={`text-[11px] font-black w-7 h-7 flex items-center justify-center rounded-xl transition-all ${
                          isTdy 
                            ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-110' 
                            : 'text-muted-foreground group-hover/day:text-primary group-hover/day:bg-white/60'
                        }`}>
                          {format(day, 'd')}
                        </span>
                        
                        {/* Quick Create Button */}
                        <button 
                          onClick={(e) => { e.stopPropagation(); setQuickCreateDate(day); }}
                          className="opacity-0 group-hover/day:opacity-100 p-1.5 bg-white/60 rounded-lg text-primary shadow-sm hover:bg-white transition-all pointer-events-auto"
                        >
                          <Plus size={10} />
                        </button>

                        {quickCreateDate && isSameDay(quickCreateDate, day) && (
                          <QuickCreatePopover 
                            date={day} 
                            onCancel={() => setQuickCreateDate(null)}
                            onSave={(title, priority) => {
                              onCreateTask({ title, startDate: day, endDate: day, priority });
                              setQuickCreateDate(null);
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Multi-day Event Bars */}
                <div className="flex-1 px-1 pb-2 space-y-1 relative z-10 pointer-events-none">
                  {lanes.map((lane, laneIdx) => (
                    <div key={laneIdx} className="h-6 relative">
                      {lane.map(task => {
                        if (!task) return null;
                        const taskStart = parseISO(task.start_date);
                        const taskEnd = parseISO(task.end_date);
                        
                        const start = isBefore(taskStart, weekStart) ? weekStart : taskStart;
                        const end = isAfter(taskEnd, weekEnd) ? weekEnd : taskEnd;
                        
                        const colStart = differenceInDays(start, weekStart) + 1;
                        const span = differenceInDays(end, start) + 1;
                        
                        const isStart = isSameDay(taskStart, start);
                        const isEnd = isSameDay(taskEnd, end);

                        const priorityColors = {
                          high: 'bg-red-500/80 border-red-400',
                          medium: 'bg-amber-500/80 border-amber-400',
                          low: 'bg-green-500/80 border-green-400'
                        };

                        return (
                          <div 
                            key={task.id}
                            onClick={(e) => { e.stopPropagation(); onOpenTaskModal(task.id); }}
                            className={`absolute h-full flex items-center px-2 border-y pointer-events-auto cursor-pointer transition-all hover:brightness-110 shadow-sm ${priorityColors[task.priority]} ${isStart ? 'rounded-l-lg border-l ml-1' : ''} ${isEnd ? 'rounded-r-lg border-r mr-1' : ''}`}
                            style={{ 
                              gridColumnStart: colStart,
                              width: `${(span / 7) * 100}%`,
                              left: `${((colStart - 1) / 7) * 100}%`
                            }}
                          >
                            <button 
                              onClick={(e) => { e.stopPropagation(); onToggleTask(task.id, !task.is_completed); }}
                              className={`w-3.5 h-3.5 rounded-full border border-white/60 flex items-center justify-center mr-2 transition-all ${task.is_completed ? 'bg-white text-green-600' : 'bg-transparent'}`}
                            >
                              {task.is_completed && <Check size={8} strokeWidth={4} />}
                            </button>
                            <span className={`text-[9px] font-black text-white truncate ${task.is_completed ? 'line-through opacity-50' : ''}`}>
                              {isStart ? task.title : ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Render Week View ---
  const renderWeekView = () => {
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    const endDate = endOfWeek(currentDate, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start: startDate, end: endDate });

    return (
      <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
        <div className="grid grid-cols-7 flex-1">
          {days.map(day => {
            const isTdy = isToday(day);
            const dayTasks = tasks.filter(t => {
              const start = startOfDay(parseISO(t.start_date));
              const end = endOfDay(parseISO(t.end_date));
              return isWithinInterval(day, { start, end });
            });
            
            return (
              <div key={day.toString()} className="border-r border-white/20 last:border-0 flex flex-col h-full bg-white/5">
                <div className={`p-6 text-center border-b border-white/20 backdrop-blur-md ${isTdy ? 'bg-primary/5' : ''}`}>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">{format(day, 'EEEE')}</p>
                  <p className={`text-2xl font-black mx-auto w-12 h-12 flex items-center justify-center rounded-2xl shadow-sm ${isTdy ? 'bg-primary text-white shadow-primary/20' : 'text-foreground bg-white/40 border border-white/60'}`}>
                    {format(day, 'd')}
                  </p>
                </div>
                <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                  {dayTasks.map(task => (
                    <div 
                      key={task.id} 
                      onClick={(e) => { e.stopPropagation(); onOpenTaskModal(task.id); }}
                      className={`glass-card p-4 rounded-[1.5rem] border-white/40 shadow-sm hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer group border-l-4 ${task.priority === 'high' ? 'border-l-red-500' : task.priority === 'medium' ? 'border-l-amber-500' : 'border-l-green-500'}`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={(e) => { e.stopPropagation(); onToggleTask(task.id, !task.is_completed); }}
                            className={`w-4 h-4 rounded-full border border-primary/20 flex items-center justify-center transition-all ${task.is_completed ? 'bg-green-500 text-white' : 'bg-white/40'}`}
                          >
                            {task.is_completed && <Check size={10} strokeWidth={4} />}
                          </button>
                          <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">{task.priority}</span>
                        </div>
                        {task.is_all_day && <span className="text-[8px] font-black text-primary/60 bg-primary/5 px-2 py-0.5 rounded-full uppercase tracking-tighter">All Day</span>}
                      </div>
                      <p className={`text-sm font-bold text-foreground group-hover:text-primary transition-colors ${task.is_completed ? 'line-through opacity-50' : ''}`}>{task.title}</p>
                    </div>
                  ))}
                  <button 
                    onClick={() => setQuickCreateDate(day)}
                    className="w-full h-20 border-2 border-dashed border-white/20 rounded-[1.5rem] flex items-center justify-center text-muted-foreground/30 hover:bg-white/20 hover:text-primary/40 transition-all cursor-pointer"
                  >
                    <Plus size={24} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- Render Year View ---
  const renderYearView = () => {
    const yearStart = startOfYear(currentDate);
    const yearEnd = endOfYear(yearStart);
    const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8 p-10 h-full overflow-y-auto custom-scrollbar bg-white/5 animate-in zoom-in-95 duration-500">
        {months.map(month => {
          const monthTasks = tasks.filter(t => isSameMonth(parseISO(t.start_date), month));
          
          return (
            <div 
              key={month.toString()} 
              onClick={() => { setCurrentDate(month); setViewMode('month'); }}
              className="glass p-6 rounded-[2.5rem] border-white/40 hover:bg-white/40 hover:shadow-2xl transition-all cursor-pointer group"
            >
              <h3 className="text-lg font-black text-foreground mb-4 group-hover:text-primary transition-colors">{format(month, 'MMMM')}</h3>
              <div className="grid grid-cols-7 gap-1 opacity-40 group-hover:opacity-100 transition-all">
                {Array.from({ length: 31 }).map((_, i) => {
                  const day = startOfDay(new Date(month.getFullYear(), month.getMonth(), i + 1));
                  const hasTask = tasks.some(t => isWithinInterval(day, { start: parseISO(t.start_date), end: parseISO(t.end_date) }));
                  return (
                    <div 
                      key={i} 
                      className={`w-1.5 h-1.5 rounded-full ${hasTask ? 'bg-primary' : 'bg-muted-foreground/20'}`} 
                    />
                  );
                })}
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                {monthTasks.length > 0 ? (
                  <div className="px-4 py-1.5 bg-primary/10 rounded-xl border border-primary/20 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-primary uppercase tracking-widest">{monthTasks.length} Tasks</span>
                  </div>
                ) : (
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-30 italic">No tasks</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-transparent overflow-hidden">
      {/* --- Toolbar --- */}
      <div className="flex flex-wrap items-center justify-between gap-6 p-8 relative z-50">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/20">
             <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight flex items-center gap-3">
              {viewMode === 'year' ? format(currentDate, 'yyyy') : format(currentDate, 'MMMM yyyy')}
              <span className="text-xs font-black text-muted-foreground bg-white/40 px-3 py-1 rounded-full uppercase tracking-widest shadow-sm border border-white/60">
                {viewMode}
              </span>
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* View Switcher */}
          <div className="glass p-1.5 rounded-2xl border-white/40 shadow-inner flex items-center">
            <button 
              onClick={() => setViewMode('month')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'month' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/60 hover:text-foreground'}`}
            >
              <CalendarDays size={14} /> Month
            </button>
            <button 
              onClick={() => setViewMode('week')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'week' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/60 hover:text-foreground'}`}
            >
              <Columns size={14} /> Week
            </button>
            <button 
              onClick={() => setViewMode('year')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'year' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-white/60 hover:text-foreground'}`}
            >
              <LayoutGrid size={14} /> Year
            </button>
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center gap-3">
             <button onClick={today} className="px-5 py-2.5 glass rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-white transition-all shadow-sm border border-white/60">
               Today
             </button>
             <div className="flex items-center bg-white/40 p-1 rounded-2xl border border-white/60 shadow-inner">
                <button onClick={prev} className="p-2.5 hover:bg-white/60 rounded-xl transition-all text-muted-foreground hover:text-primary"><ChevronLeft size={18} /></button>
                <div className="w-px h-6 bg-white/40 mx-1" />
                <button onClick={next} className="p-2.5 hover:bg-white/60 rounded-xl transition-all text-muted-foreground hover:text-primary"><ChevronRight size={18} /></button>
             </div>
          </div>

          <div className="h-10 w-px bg-white/20 mx-2" />

          <div className="flex items-center gap-2">
             <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white transition-all border border-white/60"><Search size={18} /></button>
             <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white transition-all border border-white/60"><Filter size={18} /></button>
             <button className="w-10 h-10 glass rounded-2xl flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-white transition-all border border-white/60"><MoreHorizontal size={18} /></button>
          </div>
        </div>
      </div>

      {/* --- Main Calendar Content --- */}
      <div className="flex-1 glass mx-8 mb-8 rounded-[3.5rem] border-white/40 overflow-hidden shadow-2xl shadow-sky-dark/5 relative z-10">
        <AnimatePresence mode="wait">
          {viewMode === 'month' && (
            <motion.div 
              key="month" 
              initial={{ opacity: 0, x: -20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              {renderMonthView()}
            </motion.div>
          )}
          {viewMode === 'week' && (
            <motion.div 
              key="week" 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -20 }}
              className="h-full"
            >
              {renderWeekView()}
            </motion.div>
          )}
          {viewMode === 'year' && (
            <motion.div 
              key="year" 
              initial={{ opacity: 0, scale: 1.05 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="h-full"
            >
              {renderYearView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <style jsx global>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
