"use client";

import React from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { Target, Clock, Zap, TrendingUp } from "lucide-react";

export default function AnalyticsTab({ task }: { task: any }) {
  // Mock data for task productivity
  const data = [
    { name: 'Mon', xp: 20 },
    { name: 'Tue', xp: 45 },
    { name: 'Wed', xp: 30 },
    { name: 'Thu', xp: 80 },
    { name: 'Fri', xp: 60 },
    { name: 'Sat', xp: 10 },
    { name: 'Sun', xp: 0 },
  ];

  const subtasks = task?.subCards || [];
  const completed = subtasks.filter((s: any) => s.status === 'DONE').length;
  const total = subtasks.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="space-y-10">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          icon={<Target className="text-primary" />} 
          label="Completion" 
          value={`${Math.round(progress)}%`} 
          subValue={`${completed}/${total} Subtasks`}
        />
        <StatCard 
          icon={<Clock className="text-blue-500" />} 
          label="Estimated" 
          value={`${task?.estimatedTime || 0}m`} 
          subValue="Time allocation"
        />
        <StatCard 
          icon={<Zap className="text-yellow-500" />} 
          label="XP Earned" 
          value="150" 
          subValue="+25 Bonus"
        />
      </div>

      {/* Productivity Chart */}
      <div className="glass p-8 rounded-[2.5rem] border-white/60 bg-white/40 shadow-inner">
        <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-3">
              <TrendingUp size={20} className="text-primary" />
              <h3 className="text-sm font-black uppercase tracking-widest text-foreground">Activity Intensity</h3>
           </div>
           <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Last 7 Days</span>
        </div>
        
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 10, fontWeight: 'bold', fill: '#64748b' }} 
              />
              <YAxis hide />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="glass p-3 rounded-xl border-white shadow-xl">
                        <p className="text-[10px] font-black text-primary uppercase">{payload[0].value} XP</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="xp" radius={[8, 8, 8, 8]} barSize={24}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.xp > 50 ? '#0ea5e9' : '#94a3b8'} fillOpacity={0.6} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue: string }) {
  return (
    <div className="glass p-6 rounded-[2rem] border-white/60 bg-white/60 shadow-sm flex flex-col gap-4">
       <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-sm">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">{label}</p>
          <p className="text-2xl font-black text-foreground">{value}</p>
          <p className="text-[9px] font-bold text-muted-foreground mt-1">{subValue}</p>
       </div>
    </div>
  );
}
