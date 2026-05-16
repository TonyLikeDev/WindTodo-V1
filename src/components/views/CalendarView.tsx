"use client";

import { useState } from 'react';
import useSWR from 'swr';
import { getProjectTasks } from '@/app/actions/taskActions';
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
  isToday 
} from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Loader2, 
  Sparkles,
  Calendar as CalendarIcon,
  Search
} from 'lucide-react';

import { useTaskStore } from '@/store/taskStore';

export default function CalendarView({ projectId }: { projectId: string }) {
  const { openTask } = useTaskStore();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const { data: tasks = [], isLoading } = useSWR(
    projectId ? `project-tasks:${projectId}` : null,
    () => getProjectTasks(projectId)
  );

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToToday = () => setCurrentMonth(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const dateFormat = "d";
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
         <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex flex-wrap items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-6">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary shadow-sm border border-primary/10">
             <CalendarIcon size={24} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-foreground tracking-tight">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1 opacity-50">Timeline Overview</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={goToToday} 
            className="px-6 py-2 bg-white/60 hover:bg-white border border-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest text-primary shadow-sm transition-all"
          >
            Today
          </button>
          <div className="flex items-center gap-2 bg-white/40 p-1.5 rounded-2xl border border-white/40 shadow-inner">
            <button onClick={prevMonth} className="p-2 hover:bg-white/60 rounded-xl transition-all text-muted-foreground hover:text-primary">
              <ChevronLeft size={20} />
            </button>
            <div className="w-px h-6 bg-white/40 mx-1" />
            <button onClick={nextMonth} className="p-2 hover:bg-white/60 rounded-xl transition-all text-muted-foreground hover:text-primary">
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 glass rounded-[3rem] border-white/40 overflow-hidden flex flex-col shadow-2xl shadow-sky-dark/5 relative z-10">
        {/* Days of week */}
        <div className="grid grid-cols-7 border-b border-white/40 bg-white/40 backdrop-blur-md">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
            <div key={day} className="py-5 text-center text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
              {day.slice(0, 3)}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 grid grid-cols-7 auto-rows-fr bg-white/10 gap-px backdrop-blur-sm">
          {days.map(day => {
            const dayTasks = tasks.filter((t: any) => t.dueDate && isSameDay(new Date(t.dueDate), day));
            const isCurrMonth = isSameMonth(day, monthStart);
            const isTdy = isToday(day);

            return (
              <div 
                key={day.toString()} 
                className={`p-3 flex flex-col gap-2 transition-all hover:bg-white/40 relative group/day ${!isCurrMonth ? 'opacity-20 grayscale pointer-events-none' : ''}`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-[11px] font-black w-8 h-8 flex items-center justify-center rounded-xl shadow-sm transition-all ${
                    isTdy 
                      ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-110' 
                      : 'text-muted-foreground bg-white/40 border border-white/60 group-hover/day:bg-white group-hover/day:text-primary'
                  }`}>
                    {format(day, dateFormat)}
                  </span>
                  {dayTasks.length > 0 && <Sparkles size={12} className="text-primary/30 animate-pulse" />}
                </div>
                
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col gap-2 pr-1 pt-1">
                  {dayTasks.map((task: any) => (
                    <div 
                      key={task.id}
                      onClick={() => openTask(task.id)}
                      className={`text-[9px] font-black px-3 py-2 rounded-xl truncate cursor-pointer transition-all border shadow-sm flex items-center gap-2 group/task hover:scale-[1.05] hover:shadow-md ${task.status === 'DONE' ? 'opacity-40 grayscale' : ''}`}
                      style={{ 
                        backgroundColor: `${task.list?.color || '#ccc'}20`,
                        color: task.list?.color || '#333',
                        borderColor: `${task.list?.color || '#ccc'}40`
                      }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: task.list?.color || '#ccc' }} />
                      <span className="truncate">{task.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
