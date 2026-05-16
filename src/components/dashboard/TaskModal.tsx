"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  X, 
  Hash, 
  Calendar, 
  Tag, 
  ChevronRight, 
  Code,
  CheckCircle2,
  Circle
} from "lucide-react";
import NotionEditor from "../NotionEditor";
import { Task } from "./types";

interface TaskModalProps {
  task: Task;
  colTitle: string;
  onClose: () => void;
  onUpdate: (task: Task) => void;
}

export default function TaskModal({ task, colTitle, onClose, onUpdate }: TaskModalProps) {
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10 pointer-events-auto">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-sky-dark/30 backdrop-blur-xl" 
        onClick={onClose} 
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 40 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 40 }}
        className="glass-dark relative w-full max-w-6xl h-full max-h-[90vh] bg-white/80 rounded-[3.5rem] shadow-2xl border border-white/60 overflow-hidden flex flex-col md:flex-row z-[201]"
      >
        {/* Sidebar Info */}
        <aside className="w-full md:w-80 border-b md:border-b-0 md:border-r border-white/40 p-8 flex flex-col bg-white/30 backdrop-blur-md">
          <div className="flex items-center gap-3 mb-12 text-primary">
             <Hash size={28} className="drop-shadow-lg" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60">Chi tiết nhiệm vụ</span>
          </div>

          <div className="space-y-10 flex-1">
             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Trạng thái hoàn thành</p>
                <button 
                  onClick={() => onUpdate({ ...task, isCompleted: !task.isCompleted })}
                  className={`w-full p-5 rounded-[1.5rem] border-2 flex items-center justify-center gap-4 transition-all font-black uppercase tracking-widest text-[11px] ${
                    task.isCompleted 
                      ? 'bg-green-500 border-green-500 text-white shadow-xl shadow-green-200' 
                      : 'bg-white/40 border-white/60 text-muted-foreground hover:border-primary hover:bg-white/60'
                  }`}
                >
                  {task.isCompleted ? <><CheckCircle2 size={18} /> Đã hoàn tất</> : <><Circle size={18} /> Đánh dấu xong</>}
                </button>
             </div>

             <div>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Tiêu đề nhiệm vụ</p>
                <textarea 
                  value={task.title}
                  onChange={(e) => onUpdate({ ...task, title: e.target.value })}
                  rows={2}
                  className={`text-2xl font-black bg-white/40 border border-white/60 rounded-3xl px-6 py-5 w-full outline-none focus:ring-4 focus:ring-primary/20 transition-all resize-none shadow-inner ${
                    task.isCompleted ? 'line-through text-muted-foreground opacity-60' : 'text-foreground'
                  }`}
                />
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Thuộc tính</p>
                <InfoItem icon={<Calendar size={14} />} label="Hạn chót" value={task.dueDate} isDate onUpdate={(v) => onUpdate({ ...task, dueDate: v })} />
                <InfoItem icon={<Tag size={14} />} label="Phân loại" value={task.label} onUpdate={(v) => onUpdate({ ...task, label: v })} />
                <InfoItem icon={<ChevronRight size={14} />} label="Danh sách" value={colTitle} disabled />
             </div>
          </div>

          <button onClick={onClose} className="mt-8 btn-primary w-full !py-5 text-xs font-black uppercase tracking-[0.2em] shadow-2xl hover:scale-105 active:scale-95 transition-all">Đóng & Lưu lại</button>
        </aside>

        {/* Content Editor */}
        <main className="flex-1 flex flex-col p-8 md:p-12 bg-white/10 relative overflow-hidden">
          <div className="flex items-center justify-between mb-8">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Code size={24} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-widest text-foreground">Tài liệu dự án</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.1em]">Soạn thảo theo khối (Notion Style)</p>
                </div>
             </div>
             <button onClick={onClose} className="p-4 hover:bg-white/60 rounded-[1.5rem] transition-all group">
               <X size={28} className="text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />
             </button>
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 min-h-0">
             <NotionEditor 
               content={task.notion_content} 
               onChange={(json) => onUpdate({ ...task, notion_content: json })} 
             />
          </div>
        </main>
      </motion.div>
    </div>
  );
}

function InfoItem({ icon, label, value, disabled, isDate, onUpdate }: { icon: React.ReactNode, label: string, value: string, disabled?: boolean, isDate?: boolean, onUpdate?: (v: string) => void }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm hover:bg-white/60 transition-all">
      <div className="flex items-center gap-3 text-[11px] font-bold text-muted-foreground/80">
        {icon} <span className="uppercase tracking-widest">{label}</span>
      </div>
      {disabled ? (
        <span className="text-[10px] font-black text-foreground uppercase">{value}</span>
      ) : isDate ? (
        <input 
          type="date" 
          value={value}
          onChange={(e) => onUpdate?.(e.target.value)}
          className="bg-transparent border-none text-[10px] font-black text-foreground outline-none text-right cursor-pointer"
        />
      ) : (
        <input 
          type="text" 
          value={value}
          onChange={(e) => onUpdate?.(e.target.value)}
          className="bg-transparent border-none text-[10px] font-black text-foreground outline-none text-right placeholder-muted-foreground/30"
        />
      )}
    </div>
  );
}
