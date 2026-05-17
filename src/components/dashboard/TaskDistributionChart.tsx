"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, AlertCircle, CheckCircle2, Award } from "lucide-react";
import useSWR from "swr";
import { getTaskDistributionData } from "@/app/actions/taskActions";

interface WorkloadData {
  id: string;
  name: string;
  avatar: string | null;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

const COLORS = [
  "#8B5CF6", // Purple/Indigo
  "#3B82F6", // Sky Blue
  "#10B981", // Emerald Green
  "#F59E0B", // Orange/Amber
  "#EC4899"  // Elegant Pink
];

export default function TaskDistributionChart({ projectId }: { projectId: string }) {
  const [isMounted, setIsMounted] = useState(false);
  const { data: distribution = [], isLoading } = useSWR(
    projectId ? `distribution:${projectId}` : null,
    () => getTaskDistributionData(projectId),
    { refreshInterval: 5000 } // Realtime-ish
  );

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const pieData = useMemo(() => {
    return distribution.map(d => ({
      name: d.name,
      value: d.total,
      completed: d.completed,
      inProgress: d.inProgress,
      todo: d.todo,
      overdue: d.overdue
    })).filter(d => d.value > 0);
  }, [distribution]);

  const totalTasks = useMemo(() => {
    return pieData.reduce((sum, d) => sum + d.value, 0);
  }, [pieData]);

  if (!isMounted || isLoading) {
    return <div className="h-[400px] w-full bg-white/20 rounded-[2.5rem] animate-pulse glass" />;
  }

  if (distribution.length === 0 || totalTasks === 0) {
    return (
      <div className="h-[400px] w-full glass rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 border-white/40 shadow-xl">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20 shadow-md">
          <Users size={32} />
        </div>
        <h3 className="text-lg font-black text-foreground uppercase tracking-wider">Chưa có dữ liệu phân bổ</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-60">
          Hãy assign task cho thành viên để xem biểu đồ phân tích
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* 1. Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {distribution.filter(u => u.total > 0).map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-5 rounded-[2rem] border-white/40 shadow-md flex flex-col gap-3 relative overflow-hidden group hover:scale-[1.03] transition-all duration-300"
          >
            {/* Soft decorative glow */}
            <div 
              className="absolute -right-10 -bottom-10 w-24 h-24 rounded-full opacity-10 blur-xl group-hover:scale-150 transition-transform duration-500" 
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />

            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black text-white shadow-sm overflow-hidden border border-white/40"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              >
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Tỷ trọng: {Math.round((user.total / totalTasks) * 100)}%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-lg font-black text-foreground">{user.total}</span>
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Nhiệm vụ giao</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center border border-green-500/10" title="Completed">
                  <CheckCircle2 size={13} />
                </div>
                {user.overdue > 0 && (
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10" title="Overdue">
                    <AlertCircle size={13} />
                  </div>
                )}
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-2 bg-black/5 rounded-full mt-2 overflow-hidden p-0.5 border border-white/40">
              <div 
                className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: `${(user.completed / user.total) * 100}%`,
                  backgroundColor: COLORS[i % COLORS.length]
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* 2. Main Donut Pie Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl relative overflow-hidden min-h-[420px] flex flex-col justify-between"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Biểu đồ phân bổ tròn</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50 flex items-center gap-2">
              <TrendingUp size={12} className="text-primary animate-pulse" />
              Tổng quan chỉ tiêu thành viên
            </p>
          </div>
        </div>

        {/* Recharts Container with Centered Absolute Box */}
        <div className="relative h-[280px] w-full flex items-center justify-center">
          {/* Centered Total Counter */}
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-10">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-60">Tổng nhiệm vụ</span>
            <span className="text-4xl font-black text-foreground tracking-tighter mt-1">{totalTasks}</span>
            <span className="text-[8px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-widest mt-1">Tasks</span>
          </div>

          {/* Pie Chart */}
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={78}
                outerRadius={108}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={COLORS[index % COLORS.length]} 
                    style={{ outline: 'none' }}
                  />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="glass bg-white/95 p-4 rounded-2xl shadow-xl border border-white/60 text-[10px] font-bold space-y-1.5 min-w-[170px] z-50">
                        <p className="text-foreground font-black text-xs border-b border-black/5 pb-1 mb-1.5 uppercase tracking-wide">{data.name}</p>
                        <p className="text-primary flex justify-between"><span>Đầu việc được giao:</span> <span>{data.value} tasks</span></p>
                        <p className="text-green-600 flex justify-between"><span>Đã hoàn thành:</span> <span>{data.completed}</span></p>
                        <p className="text-blue-500 flex justify-between"><span>Đang tiến hành:</span> <span>{data.inProgress}</span></p>
                        <p className="text-gray-500 flex justify-between"><span>Chưa bắt đầu:</span> <span>{data.todo}</span></p>
                        {data.overdue > 0 && <p className="text-red-500 flex justify-between"><span>Bị trễ hạn:</span> <span className="font-black text-red-600 animate-pulse">{data.overdue} ⚠️</span></p>}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={30} 
                iconType="circle" 
                wrapperStyle={{ 
                  fontSize: '9px', 
                  fontWeight: 900, 
                  textTransform: 'uppercase', 
                  letterSpacing: '0.15em',
                  paddingTop: '10px'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
