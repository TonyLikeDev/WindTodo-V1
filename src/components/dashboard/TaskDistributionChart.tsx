"use client";

import React, { useState, useEffect, useMemo } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  Legend
} from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { Users, TrendingUp, AlertCircle, CheckCircle2, Clock } from "lucide-react";
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

  const chartData = useMemo(() => {
    return distribution.map(d => ({
      name: d.name,
      'Hoàn tất': d.completed,
      'Đang làm': d.inProgress,
      'Chưa làm': d.todo,
      'Quá hạn': d.overdue,
      total: d.total
    }));
  }, [distribution]);

  if (!isMounted || isLoading) {
    return <div className="h-[400px] w-full bg-white/20 rounded-[2.5rem] animate-pulse glass" />;
  }

  if (distribution.length === 0) {
    return (
      <div className="h-[400px] w-full glass rounded-[2.5rem] flex flex-col items-center justify-center text-center p-8 border-white/40">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <Users size={32} />
        </div>
        <h3 className="text-lg font-black text-foreground">Chưa có dữ liệu phân bổ</h3>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-60">
          Hãy assign task cho thành viên để xem biểu đồ
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {distribution.slice(0, 4).map((user, i) => (
          <motion.div
            key={user.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-5 rounded-[2rem] border-white/40 shadow-sm flex flex-col gap-3 relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-xs font-black text-primary overflow-hidden">
                {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-foreground truncate">{user.name}</p>
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-tighter">Workload: {Math.round((user.total / distribution.reduce((acc, d) => acc + d.total, 0)) * 100)}%</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-lg font-black text-foreground">{user.total}</span>
                <span className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Tasks</span>
              </div>
              <div className="flex gap-1.5">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 text-green-600 flex items-center justify-center" title="Completed"><CheckCircle2 size={14} /></div>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center" title="Overdue"><AlertCircle size={14} /></div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full h-1.5 bg-black/5 rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-primary rounded-full" 
                style={{ width: `${(user.completed / user.total) * 100}%` }}
              />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Chart */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass p-8 rounded-[2.5rem] border-white/60 shadow-xl relative overflow-hidden min-h-[400px]"
      >
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Phân bổ công việc</h3>
            <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1 opacity-50 flex items-center gap-2">
              <TrendingUp size={12} className="text-primary" />
              Real-time Workload Analysis
            </p>
          </div>
        </div>

        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 800, fill: '#546E7A' }} 
                dy={10}
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#546E7A' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ 
                  borderRadius: '20px', 
                  border: 'none', 
                  boxShadow: '0 20px 50px rgba(0,0,0,0.1)', 
                  fontSize: '11px', 
                  fontWeight: 'bold',
                  padding: '12px 16px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(10px)'
                }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.1em' }} />
              <Bar dataKey="Hoàn tất" stackId="a" fill="#4ADE80" radius={[0, 0, 0, 0]} barSize={40} />
              <Bar dataKey="Đang làm" stackId="a" fill="#60A5FA" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Chưa làm" stackId="a" fill="#94A3B8" radius={[0, 0, 0, 0]} />
              <Bar dataKey="Quá hạn" stackId="a" fill="#F87171" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}
