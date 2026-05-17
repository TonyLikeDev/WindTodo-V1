"use client";

import React, { useMemo, useState, useEffect } from "react";
import TaskList from "@/components/TaskList";
import { Sparkles, Filter, Search, CheckCircle2, Loader2, Calendar, Target } from "lucide-react";
import useSWR from "swr";
import { getAllUserTasks } from "@/app/actions/taskActions";
import { motion } from "framer-motion";
import { getDemoColumns } from "@/utils/demoHelper";

export default function TasksPage() {
  const { data: tasks = [], isLoading } = useSWR("all-tasks", getAllUserTasks);
  const [search, setSearch] = useState("");
  const [demoTasks, setDemoTasks] = useState<any[]>([]);

  useEffect(() => {
    const cols = getDemoColumns();
    const flattened = cols.flatMap((col: any) => col.cards.map((card: any) => ({
      ...card,
      list: { project: { name: "SkyTodo Workspace" } }
    })));
    setDemoTasks(flattened);
  }, []);

  const effectiveTasks = useMemo(() => {
    return tasks.length > 0 ? tasks : demoTasks;
  }, [tasks, demoTasks]);

  const filteredTasks = useMemo(() => {
    return effectiveTasks.filter((t: any) => 
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.list?.project?.name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [effectiveTasks, search]);

  const stats = useMemo(() => {
    const total = effectiveTasks.length;
    const completed = effectiveTasks.filter((t: any) => t.status === 'DONE').length;
    const active = total - completed;
    return { total, completed, active };
  }, [effectiveTasks]);

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-6">
        <div className="relative">
           <Loader2 className="animate-spin text-primary" size={64} />
           <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-4 h-4 bg-primary rounded-full animate-ping" />
           </div>
        </div>
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Syncing your productivity...</p>
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-primary/10 rounded-xl text-primary shadow-inner">
               <Sparkles size={18} />
            </div>
            <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">My Ecosystem</span>
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tighter">Tất cả nhiệm vụ</h1>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2 opacity-60">
            Tổng hợp {stats.total} nhiệm vụ từ tất cả các dự án của bạn
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text" 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or project..." 
              className="bg-white/40 border-white/60 border-2 rounded-[1.5rem] py-4 pl-14 pr-6 text-sm font-bold focus:outline-none focus:ring-4 focus:ring-primary/10 transition-all w-80 shadow-sm"
            />
          </div>
          <button className="glass p-4 rounded-[1.5rem] text-primary hover:bg-white transition-all shadow-sm">
            <Filter size={20} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
        <div className="xl:col-span-8">
           <div className="glass p-10 rounded-[3.5rem] border-white/40 shadow-xl shadow-sky-dark/5 bg-white/20">
              <TaskList 
                title="Dòng thời gian nhiệm vụ" 
                tasks={filteredTasks.map((t: any) => ({
                  id: t.id,
                  title: t.title,
                  completed: t.status === 'DONE',
                  priority: (t.labels as any)?.priority || 'medium'
                }))}
              />
           </div>
        </div>
        
        <div className="xl:col-span-4 space-y-8">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass p-10 rounded-[3.5rem] border-white/40 flex flex-col items-center justify-center text-center bg-gradient-to-br from-primary/5 to-accent-lavender/5 shadow-xl"
          >
              <div className="w-20 h-20 bg-white rounded-[2rem] shadow-lg flex items-center justify-center mb-8 border border-white/60">
                <CheckCircle2 size={40} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black text-foreground mb-3 tracking-tight">Thành tích tuần này</h3>
              <p className="text-xs font-bold text-muted-foreground max-w-xs leading-relaxed uppercase tracking-tight opacity-70">
                  Bạn đã hoàn thành <span className="text-primary font-black">{stats.completed}</span> nhiệm vụ. Một tiến độ tuyệt vời để duy trì sự cân bằng!
              </p>
              
              <div className="grid grid-cols-2 gap-4 w-full mt-10">
                 <div className="p-5 bg-white/60 rounded-[2rem] border border-white shadow-inner">
                    <div className="flex items-center gap-2 text-primary mb-2">
                       <Target size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Active</span>
                    </div>
                    <span className="text-2xl font-black text-foreground">{stats.active}</span>
                 </div>
                 <div className="p-5 bg-white/60 rounded-[2rem] border border-white shadow-inner">
                    <div className="flex items-center gap-2 text-green-500 mb-2">
                       <CheckCircle2 size={14} />
                       <span className="text-[9px] font-black uppercase tracking-widest">Done</span>
                    </div>
                    <span className="text-2xl font-black text-foreground">{stats.completed}</span>
                 </div>
              </div>

              <button className="mt-10 btn-primary w-full !py-5 text-[10px] font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 active:scale-95 transition-all">
                Xem chi tiết thống kê
              </button>
          </motion.div>

          <div className="glass p-8 rounded-[3rem] border-white/40 bg-white/10">
             <div className="flex items-center gap-3 mb-6 px-2">
                <Calendar size={18} className="text-primary" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Upcoming Deadlines</span>
             </div>
             <div className="space-y-4">
                {tasks.filter((t: any) => t.dueDate && t.status !== 'DONE').slice(0, 3).map((t: any) => (
                  <div key={t.id} className="p-4 bg-white/40 rounded-2xl border border-white/60 flex items-center justify-between group cursor-pointer hover:bg-white transition-all shadow-sm">
                     <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{t.title}</p>
                        <p className="text-[9px] font-black text-primary uppercase mt-0.5">{t.list?.project?.name}</p>
                     </div>
                     <span className="text-[9px] font-black text-muted-foreground/60">{new Date(t.dueDate).toLocaleDateString()}</span>
                  </div>
                ))}
                {tasks.filter((t: any) => t.dueDate && t.status !== 'DONE').length === 0 && (
                  <p className="text-[10px] font-bold text-muted-foreground/40 italic px-2">No upcoming deadlines.</p>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
