"use client";

import React, { useState, useEffect } from "react";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from "recharts";
import { motion } from "framer-motion";

interface ChartsSectionProps {
  data: any[];
}

export default function ChartsSection({ data }: ChartsSectionProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const validData = data.filter(Boolean);

  const barData = [
    { name: 'Cần làm', value: validData.filter(t => t.status === 'TODO').length, color: '#5D9CEC' },
    { name: 'Đang làm', value: validData.filter(t => t.status === 'IN_PROGRESS').length, color: '#4FC3F7' },
    { name: 'Đã xong', value: validData.filter(t => t.status === 'DONE').length, color: '#81D4FA' },
  ];

  const pieData = [
    { name: 'Hoàn thành', value: validData.filter(t => t.isCompleted).length },
    { name: 'Chưa xong', value: validData.filter(t => !t.isCompleted).length },
  ];

  const COLORS = ['#5D9CEC', '#E0F2F1'];

  if (!isMounted) {
    return <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[180px] bg-white/20 rounded-[2rem] animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
      {/* Bar Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-4 rounded-[2rem] flex flex-col border-0 ring-1 ring-white/30 bg-white/40 shadow-sm"
      >
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-4 px-2">Trạng thái</p>
        <div className="flex-1 min-h-0 w-full h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 0, right: 0, left: -25, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 8, fontWeight: 800, fill: '#546E7A' }} 
              />
              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 8, fill: '#546E7A' }} />
              <Tooltip 
                cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '9px', fontWeight: 'bold' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={24}>
                {barData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Pie Chart */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass p-4 rounded-[2rem] flex flex-col border-0 ring-1 ring-white/30 bg-white/40 shadow-sm"
      >
        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground opacity-60 mb-4 px-2">Tiến độ</p>
        <div className="flex-1 min-h-0 w-full h-[120px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                innerRadius={35}
                outerRadius={50}
                paddingAngle={6}
                dataKey="value"
                stroke="none"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontSize: '9px', fontWeight: 'bold' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
}

