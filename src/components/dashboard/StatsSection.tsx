"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  CheckCircle2, 
  Clock, 
  Layers, 
  TrendingUp 
} from "lucide-react";

interface StatsSectionProps {
  total: number;
  completed: number;
  pending: number;
  completionRate: number;
}

export default function StatsSection({ total, completed, pending, completionRate }: StatsSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const stats = [
    { label: "Tổng số", value: total, icon: <Layers size={14} />, color: "text-primary", bg: "bg-primary/10" },
    { label: "Hoàn tất", value: completed, icon: <CheckCircle2 size={14} />, color: "text-green-500", bg: "bg-green-500/10" },
    { label: "Đang chờ", value: pending, icon: <Clock size={14} />, color: "text-amber-500", bg: "bg-amber-500/10" },
    { label: "Hiệu suất", value: `${completionRate}%`, icon: <TrendingUp size={14} />, color: "text-indigo-500", bg: "bg-indigo-500/10" },
  ];

  if (!isMounted) {
    return <div className="grid grid-cols-2 gap-4 h-[220px] bg-white/10 rounded-[1.5rem] animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, i) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: i * 0.05 }}
          className="glass p-5 rounded-[1.5rem] border-0 ring-1 ring-white/30 bg-white/40 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110`}>
              {stat.icon}
            </div>
            <span className="text-xl font-black text-foreground tracking-tighter">{stat.value}</span>
          </div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
