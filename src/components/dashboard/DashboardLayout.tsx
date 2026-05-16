"use client";

import React, { useMemo } from "react";
import StatsSection from "./StatsSection";
import ChartsSection from "./ChartsSection";
import KanbanBoard from "./KanbanBoard";
import TaskDistributionChart from "./TaskDistributionChart";
import { ColumnData } from "./types";

import { AlertCircle, Wifi, WifiOff, LayoutDashboard, BarChart3 } from "lucide-react";

interface DashboardLayoutProps {
  initialData: ColumnData[];
  projectId: string;
  projectName: string;
  isDemoMode?: boolean;
}

export default function DashboardLayout({ initialData, projectId, projectName, isDemoMode }: DashboardLayoutProps) {
  // --- Derived Statistics ---
  const stats = useMemo(() => {
    const allCards = initialData.flatMap(col => col.cards).filter(Boolean);
    const total = allCards.length;
    const completed = allCards.filter(c => c.isCompleted).length;
    const pending = total - completed;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { total, completed, pending, completionRate };
  }, [initialData]);

  return (
    <div className="flex flex-col w-full gap-8">
      {/* 1. Header Section - More Compact */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-primary/10 rounded-xl text-primary">
               <LayoutDashboard size={18} />
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tighter">
              {projectName}
            </h1>
            {isDemoMode ? (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest animate-pulse">
                <WifiOff size={10} /> Offline
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-[9px] font-black text-green-600 uppercase tracking-widest">
                <Wifi size={10} /> Live
              </div>
            )}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] opacity-50 ml-11">
            Hiệu suất nhóm • Premium Analytics
          </p>
        </div>

        {isDemoMode && (
          <div className="p-3 bg-white/40 backdrop-blur-md border border-amber-500/10 rounded-2xl flex items-center gap-3 text-amber-700/80 shadow-sm max-w-sm">
            <AlertCircle size={16} className="flex-shrink-0 text-amber-500" />
            <p className="text-[9px] font-bold uppercase tracking-tight leading-tight">
              Chế độ xem thử do lỗi kết nối Database.
            </p>
          </div>
        )}
      </header>

      {/* 2. Stats & Charts Grid - More Compact */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-4">
           <StatsSection 
             total={stats.total} 
             completed={stats.completed} 
             pending={stats.pending} 
             completionRate={stats.completionRate} 
           />
        </div>
        
        <div className="xl:col-span-8">
           <ChartsSection data={initialData.flatMap(c => c.cards)} />
        </div>
      </div>

      {/* 3. Task Distribution Analysis */}
      <section className="space-y-4">
        <div className="flex items-center gap-3 px-2">
           <BarChart3 size={18} className="text-primary" />
           <h2 className="text-sm font-black text-foreground uppercase tracking-[0.2em]">Phân bổ công việc</h2>
           <div className="h-px flex-1 bg-black/5" />
        </div>
        <TaskDistributionChart projectId={projectId} />
      </section>

      {/* 4. Kanban Board Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
           <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Tiến trình công việc</h2>
           </div>
           <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Kéo thả để sắp xếp</p>
        </div>
        
        <div className="bg-white/10 rounded-[3rem] p-2 border border-white/20">
          <KanbanBoard initialData={initialData} projectId={projectId} />
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-12 py-8 border-t border-white/20 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[0.4em] text-muted-foreground">
          SkyTodo Engineering • v2.0 Premium
        </p>
      </footer>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
          height: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
}
