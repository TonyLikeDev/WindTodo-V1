"use client";

import React from "react";
import { 
  AlignLeft, 
  CheckSquare, 
  Sparkles, 
  Plus, 
  Trash2, 
  ChevronRight,
  CheckCircle2
} from "lucide-react";
import NotionEditor from "@/components/NotionEditor";
import { motion } from "framer-motion";

interface OverviewTabProps {
  task: any;
  onUpdate: (updates: any) => void;
}

export default function OverviewTab({ task, onUpdate }: OverviewTabProps) {
  const subtasks = task?.subCards || [];
  const completedSubtasks = subtasks.filter((s: any) => s.status === 'DONE').length;
  const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  return (
    <div className="space-y-12">
      {/* Title & Description section */}
      <section className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
            <AlignLeft size={18} />
          </div>
          <h3 className="text-xl font-black text-foreground tracking-tight">Project Wiki</h3>
        </div>
        <div className="min-h-[400px]">
          <NotionEditor 
            content={task?.contentJson || { type: 'doc', content: [] }} 
            onChange={(json) => onUpdate({ contentJson: json })} 
          />
        </div>
      </section>

      {/* Subtasks Section */}
      <section className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
              <CheckSquare size={18} />
            </div>
            <h3 className="text-xl font-black text-foreground tracking-tight">Milestones</h3>
          </div>
          {subtasks.length > 0 && (
            <div className="flex items-center gap-4 bg-white/40 px-4 py-2 rounded-2xl border border-white/60">
              <div className="w-32 h-2 bg-white/60 rounded-full overflow-hidden border border-white/40">
                <div 
                  className={`h-full transition-all duration-1000 ease-out ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
                  style={{ width: `${progress}%` }} 
                />
              </div>
              <span className="text-xs font-black text-primary">{progress}%</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {subtasks.map((sub: any) => (
            <motion.div 
              key={sub.id} 
              layout
              className="group p-4 rounded-2xl bg-white/40 border border-white/40 hover:bg-white/60 hover:shadow-lg transition-all flex items-center gap-4 cursor-pointer"
            >
              <button 
                onClick={(e) => { e.stopPropagation(); /* toggle logic */ }}
                className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                  sub.status === 'DONE' ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-white/60'
                }`}
              >
                {sub.status === 'DONE' && <CheckCircle2 size={14} />}
              </button>
              <span className={`flex-1 text-sm font-bold ${sub.status === 'DONE' ? 'text-muted-foreground line-through opacity-50' : 'text-foreground'}`}>
                {sub.title}
              </span>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-2">
                <button className="p-2 text-muted-foreground hover:text-red-500 transition-all">
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={18} className="text-primary/40" />
              </div>
            </motion.div>
          ))}
          
          <button className="w-full flex items-center justify-center gap-3 p-4 bg-white/30 hover:bg-white/60 border-2 border-dashed border-white/60 rounded-2xl text-xs font-black text-muted-foreground uppercase tracking-widest transition-all">
            <Plus size={18} /> New Milestone
          </button>
        </div>
      </section>

      {/* AI Suggestions / Summaries placeholder */}
      <section className="p-8 bg-gradient-to-br from-primary/5 to-accent-lavender/10 rounded-[2.5rem] border border-primary/10 relative overflow-hidden">
        <Sparkles className="absolute -top-4 -right-4 text-primary/10" size={120} />
        <div className="relative z-10 space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <Sparkles size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.3em]">AI Productivity Insights</span>
          </div>
          <p className="text-sm font-medium text-foreground/80 leading-relaxed">
            Dựa trên nội dung công việc, AI gợi ý bạn nên ưu tiên phần "Thiết kế giao diện" vì đây là bước quan trọng nhất để team frontend bắt đầu.
          </p>
        </div>
      </section>
    </div>
  );
}
