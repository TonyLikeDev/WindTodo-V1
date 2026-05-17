'use client';

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, CalendarDays, X, ExternalLink } from 'lucide-react';
import { getCalendarTasks } from '@/app/actions/taskActions';

type CalendarTask = Awaited<ReturnType<typeof getCalendarTasks>>[number];

const STATUS_COLORS: Record<string, string> = {
  TODO: 'bg-slate-500/80',
  IN_PROGRESS: 'bg-blue-500/80',
  DONE: 'bg-emerald-500/80',
};

const PRIORITY_LABELS: Record<string, string> = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
};

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-slate-400',
  MEDIUM: 'text-amber-400',
  HIGH: 'text-orange-400',
  URGENT: 'text-red-400',
};

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function taskSpansDay(task: CalendarTask, day: Date): boolean {
  const start = task.startDate ? new Date(task.startDate) : null;
  const end = task.endDate ? new Date(task.endDate) : null;

  if (!start && !end) return false;

  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);

  if (start && end) {
    const s = new Date(start); s.setHours(0, 0, 0, 0);
    const e = new Date(end);   e.setHours(23, 59, 59, 999);
    return s <= dayEnd && e >= dayStart;
  }
  if (start) return isSameDay(start, day);
  if (end)   return isSameDay(end!, day);
  return false;
}

function formatDateRange(task: CalendarTask) {
  const fmt = (d: Date | null) =>
    d ? new Date(d).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }) : null;
  const s = fmt(task.startDate);
  const e = fmt(task.endDate);
  if (s && e) return `${s} → ${e}`;
  if (s)      return `Start: ${s}`;
  if (e)      return `Due: ${e}`;
  return '';
}

export default function CalendarView() {
  const today = new Date();
  const [current, setCurrent] = useState({ year: today.getFullYear(), month: today.getMonth() });
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [hoveredTask, setHoveredTask] = useState<CalendarTask | null>(null);

  const { data: tasks = [], isLoading } = useSWR('calendar-tasks', getCalendarTasks, {
    revalidateOnFocus: false,
    dedupingInterval: 30000,
  });

  const { year, month } = current;

  // All days to show (including trailing/leading days from adjacent months)
  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay  = new Date(year, month + 1, 0);
    const startDow = firstDay.getDay();
    const totalCells = Math.ceil((startDow + lastDay.getDate()) / 7) * 7;

    const days: Date[] = [];
    for (let i = 0; i < totalCells; i++) {
      const d = new Date(year, month, 1 - startDow + i);
      days.push(d);
    }
    return days;
  }, [year, month]);

  // Group tasks by their day keys (a task may appear on multiple days if it spans)
  const tasksByDay = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const day of calendarDays) {
      const key = day.toDateString();
      map.set(key, tasks.filter((t) => taskSpansDay(t, day)));
    }
    return map;
  }, [calendarDays, tasks]);

  const selectedDayTasks = useMemo(() => {
    if (!selectedDay) return [];
    return tasksByDay.get(selectedDay.toDateString()) ?? [];
  }, [selectedDay, tasksByDay]);

  const prevMonth = () =>
    setCurrent(({ year, month }) =>
      month === 0 ? { year: year - 1, month: 11 } : { year, month: month - 1 },
    );

  const nextMonth = () =>
    setCurrent(({ year, month }) =>
      month === 11 ? { year: year + 1, month: 0 } : { year, month: month + 1 },
    );

  const goToday = () => {
    setCurrent({ year: today.getFullYear(), month: today.getMonth() });
    setSelectedDay(today);
  };

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-violet-500/20 border border-violet-400/30 flex items-center justify-center">
            <CalendarDays className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground tracking-tight">Calendar</h1>
            <p className="text-xs text-muted-foreground">View tasks by date</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-4 py-2 text-sm font-bold bg-white/40 hover:bg-white/60 text-foreground rounded-xl border border-white/40 transition-all"
          >
            Today
          </button>
          <div className="flex items-center gap-1 bg-white/30 rounded-xl border border-white/40 p-1">
            <button onClick={prevMonth} className="p-1.5 hover:bg-white/50 rounded-lg transition-all text-muted-foreground hover:text-foreground">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-bold text-foreground min-w-[160px] text-center">
              {MONTHS[month]} {year}
            </span>
            <button onClick={nextMonth} className="p-1.5 hover:bg-white/50 rounded-lg transition-all text-muted-foreground hover:text-foreground">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        {/* Calendar Grid */}
        <div className="flex-1 glass rounded-3xl border border-white/40 overflow-hidden flex flex-col">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-white/20">
            {DAYS.map((d) => (
              <div key={d} className="py-3 text-center text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-violet-400/40 border-t-violet-400 animate-spin" />
                <p className="text-sm text-muted-foreground">Loading...</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 grid grid-cols-7 auto-rows-fr overflow-y-auto custom-scrollbar">
              {calendarDays.map((day) => {
                const isToday = isSameDay(day, today);
                const isCurrentMonth = day.getMonth() === month;
                const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
                const dayTasks = tasksByDay.get(day.toDateString()) ?? [];

                return (
                  <div
                    key={day.toISOString()}
                    onClick={() => setSelectedDay(isSelected ? null : day)}
                    className={`
                      border-r border-b border-white/10 p-1.5 cursor-pointer transition-all group min-h-[80px]
                      ${isCurrentMonth ? 'bg-transparent' : 'bg-black/10'}
                      ${isSelected ? 'bg-violet-500/10 border-violet-400/30' : 'hover:bg-white/10'}
                    `}
                  >
                    {/* Date number */}
                    <div className="flex justify-end mb-1">
                      <span
                        className={`
                          w-7 h-7 flex items-center justify-center rounded-full text-xs font-bold transition-all
                          ${isToday
                            ? 'bg-violet-500 text-white shadow-lg shadow-violet-500/40'
                            : isCurrentMonth
                              ? 'text-foreground group-hover:bg-white/20'
                              : 'text-muted-foreground/50'}
                        `}
                      >
                        {day.getDate()}
                      </span>
                    </div>

                    {/* Task chips */}
                    <div className="flex flex-col gap-0.5">
                      {dayTasks.slice(0, 3).map((task) => (
                        <div
                          key={task.id}
                          onMouseEnter={() => setHoveredTask(task)}
                          onMouseLeave={() => setHoveredTask(null)}
                          className="relative flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold text-white truncate cursor-pointer hover:brightness-110 transition-all"
                          style={{ backgroundColor: task.list.project.color + 'cc' }}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`}
                          />
                          <span className="truncate">{task.title}</span>
                        </div>
                      ))}
                      {dayTasks.length > 3 && (
                        <div className="text-[10px] font-bold text-muted-foreground pl-1">
                          +{dayTasks.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Side panel: selected day tasks */}
        {selectedDay && (
          <div className="w-80 flex-shrink-0 glass rounded-3xl border border-white/40 flex flex-col overflow-hidden animate-in slide-in-from-right-4 duration-200">
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/20">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                  {selectedDay.toLocaleDateString('en-US', { weekday: 'long' })}
                </p>
                <h3 className="text-lg font-extrabold text-foreground">
                  {selectedDay.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
              </div>
              <button
                onClick={() => setSelectedDay(null)}
                className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-white/30 rounded-lg transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-2">
              {selectedDayTasks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-32 gap-2">
                  <CalendarDays className="w-8 h-8 text-muted-foreground/40" />
                  <p className="text-sm text-muted-foreground text-center">No tasks on this day</p>
                  <p className="text-xs text-muted-foreground/60 text-center">Set a start or due date on a task to see it here</p>
                </div>
              ) : (
                selectedDayTasks.map((task) => (
                  <div
                    key={task.id}
                    className="rounded-2xl border border-white/20 bg-white/10 hover:bg-white/20 transition-all p-3 space-y-2"
                    style={{ borderLeftColor: task.list.project.color, borderLeftWidth: 3 }}
                  >
                    {/* Project + list breadcrumb */}
                    <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      <span style={{ color: task.list.project.color }}>{task.list.project.name}</span>
                      <span>/</span>
                      <span>{task.list.name}</span>
                    </div>

                    {/* Title */}
                    <p className="text-sm font-semibold text-foreground leading-snug">{task.title}</p>

                    {/* Date range */}
                    <p className="text-[11px] text-muted-foreground">{formatDateRange(task)}</p>

                    {/* Status + Priority row */}
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white ${STATUS_COLORS[task.status]}`}
                      >
                        {task.status.replace('_', ' ')}
                      </span>
                      <span className={`text-[10px] font-bold ${PRIORITY_COLORS[task.priority]}`}>
                        {PRIORITY_LABELS[task.priority]}
                      </span>
                    </div>

                    {/* Assignee */}
                    {task.assignee && (
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-violet-500/30 border border-violet-400/40 flex items-center justify-center text-[9px] font-bold text-violet-300">
                          {(task.assignee.name || task.assignee.email).charAt(0).toUpperCase()}
                        </div>
                        <span className="text-[11px] text-muted-foreground">{task.assignee.name || task.assignee.email}</span>
                      </div>
                    )}

                    {/* Link to project board */}
                    <Link
                      href={`/projects/${task.list.project.id}`}
                      className="flex items-center gap-1 text-[11px] font-bold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Open project
                    </Link>
                  </div>
                ))
              )}
            </div>

            {/* Footer count */}
            {selectedDayTasks.length > 0 && (
              <div className="px-5 py-3 border-t border-white/20">
                <p className="text-xs text-muted-foreground">
                  <span className="font-bold text-foreground">{selectedDayTasks.length}</span> task{selectedDayTasks.length > 1 ? 's' : ''} on this day
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating task tooltip on hover */}
      {hoveredTask && !selectedDay && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div
            className="glass rounded-2xl border border-white/40 shadow-2xl px-4 py-3 flex items-center gap-3 max-w-sm"
            style={{ borderLeftColor: hoveredTask.list.project.color, borderLeftWidth: 3 }}
          >
            <div className="min-w-0">
              <p className="text-sm font-bold text-foreground truncate">{hoveredTask.title}</p>
              <p className="text-[11px] text-muted-foreground">{formatDateRange(hoveredTask)}</p>
            </div>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white flex-shrink-0 ${STATUS_COLORS[hoveredTask.status]}`}>
              {hoveredTask.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status:</span>
        {Object.entries(STATUS_COLORS).map(([status, cls]) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${cls}`} />
            <span className="text-[11px] text-muted-foreground">{status.replace('_', ' ')}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
