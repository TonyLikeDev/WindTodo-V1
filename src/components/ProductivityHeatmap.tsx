"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

interface HeatmapProps {
  completedTasks: Array<{ createdAt: Date | string }>;
}

function getDayIndex(date: Date): number {
  return Math.floor(date.getTime() / (1000 * 60 * 60 * 24));
}

export default function ProductivityHeatmap({ completedTasks }: HeatmapProps) {
  const today = new Date();
  const todayIndex = getDayIndex(today);

  // Build 12 weeks (84 days) grid
  const weeks = 12;
  const totalDays = weeks * 7;

  const activityMap = useMemo(() => {
    const map: Record<string, number> = {};
    completedTasks.forEach(t => {
      const d = new Date(t.createdAt);
      const key = d.toDateString();
      map[key] = (map[key] || 0) + 1;
    });
    return map;
  }, [completedTasks]);

  const days = useMemo(() => {
    const result: Array<{ date: Date; count: number; isToday: boolean }> = [];
    for (let i = totalDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const count = activityMap[d.toDateString()] || 0;
      result.push({ date: d, count, isToday: i === 0 });
    }
    return result;
  }, [activityMap, totalDays]);

  const getColor = (count: number, isToday: boolean) => {
    if (isToday && count === 0) return "bg-primary/20 border-primary/30";
    if (count === 0) return "bg-white/30 border-white/20";
    if (count === 1) return "bg-primary/25 border-primary/30";
    if (count === 2) return "bg-primary/45 border-primary/50";
    if (count === 3) return "bg-primary/65 border-primary/70";
    return "bg-primary border-primary/80";
  };

  const maxCount = Math.max(...days.map(d => d.count), 1);
  const totalActivity = days.reduce((sum, d) => sum + d.count, 0);
  const activeDays = days.filter(d => d.count > 0).length;

  const MONTH_LABELS: string[] = [];
  for (let w = 0; w < weeks; w++) {
    const d = new Date();
    d.setDate(d.getDate() - (weeks - w - 1) * 7);
    const month = d.toLocaleString("default", { month: "short" });
    MONTH_LABELS.push(w === 0 || d.getDate() <= 7 ? month : "");
  }

  // Split into columns (weeks)
  const columns: typeof days[] = [];
  for (let w = 0; w < weeks; w++) {
    columns.push(days.slice(w * 7, w * 7 + 7));
  }

  return (
    <div className="glass rounded-[2.5rem] p-6 border-white/40">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
            <span className="text-base">📊</span>
          </div>
          <div>
            <h3 className="text-sm font-black text-foreground">Activity Heatmap</h3>
            <p className="text-[10px] text-muted-foreground font-medium">Last {weeks} weeks of productivity</p>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center">
            <p className="text-lg font-black text-primary">{totalActivity}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">tasks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-black text-foreground">{activeDays}</p>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">active days</p>
          </div>
        </div>
      </div>

      {/* Month Labels */}
      <div className="flex gap-1 mb-1 pl-5">
        {MONTH_LABELS.map((label, i) => (
          <div key={i} className="flex-1 text-[8px] font-black text-muted-foreground">
            {label}
          </div>
        ))}
      </div>

      {/* Heatmap Grid */}
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-1">
          {["S","M","T","W","T","F","S"].map((d, i) => (
            <div key={i} className="w-4 h-4 text-[8px] font-bold text-muted-foreground flex items-center justify-center">
              {i % 2 === 1 ? d : ""}
            </div>
          ))}
        </div>
        {/* Columns */}
        {columns.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1 flex-1">
            {week.map((day, di) => (
              <motion.div
                key={di}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: (wi * 7 + di) * 0.002 }}
                className={`w-full aspect-square rounded-[4px] border transition-all hover:scale-125 cursor-default ${getColor(day.count, day.isToday)}`}
                title={`${day.date.toDateString()}: ${day.count} tasks`}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-[9px] font-bold text-muted-foreground">Less</span>
        {[0, 1, 2, 3, 4].map(level => (
          <div
            key={level}
            className={`w-3 h-3 rounded-[3px] border ${getColor(level, false)}`}
          />
        ))}
        <span className="text-[9px] font-bold text-muted-foreground">More</span>
      </div>
    </div>
  );
}
