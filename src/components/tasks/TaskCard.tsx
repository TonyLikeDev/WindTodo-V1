"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  Clock, 
  CheckSquare, 
  MessageSquare, 
  Paperclip, 
  MoreHorizontal,
  ChevronRight,
  AlertCircle
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import { format } from "date-fns";

interface TaskCardProps {
  task: any;
  index: number;
}

const PRIORITY_COLORS: any = {
  LOW: "bg-blue-500/10 text-blue-500",
  MEDIUM: "bg-yellow-500/10 text-yellow-600",
  HIGH: "bg-orange-500/10 text-orange-600",
  URGENT: "bg-red-500/10 text-red-600 animate-pulse",
};

export default function TaskCard({ task, index }: TaskCardProps) {
  const { openTask } = useTaskStore();

  const subtasks = task.subCards || [];
  const completedSubtasks = subtasks.filter((s: any) => s.status === 'DONE').length;
  const progress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => openTask(task.id)}
      className="group relative glass p-4 rounded-[1.5rem] border-white/40 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all cursor-pointer bg-white/40 mb-3"
    >
      {/* Priority Badge */}
      <div className="flex items-center justify-between mb-3">
        <div className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${PRIORITY_COLORS[task.priority || 'MEDIUM']}`}>
          {task.priority || 'MEDIUM'}
        </div>
        <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/60 rounded-lg transition-all">
          <MoreHorizontal size={14} className="text-muted-foreground" />
        </button>
      </div>

      {/* Title */}
      <h3 className={`text-sm font-bold mb-3 leading-snug transition-all ${task.status === 'DONE' ? 'text-muted-foreground line-through opacity-60' : 'text-foreground'}`}>
        {task.title}
      </h3>

      {/* Subtask Progress */}
      {subtasks.length > 0 && (
        <div className="space-y-1.5 mb-4">
          <div className="flex items-center justify-between text-[9px] font-black text-muted-foreground uppercase tracking-widest">
            <span>Milestones</span>
            <span>{completedSubtasks}/{subtasks.length}</span>
          </div>
          <div className="h-1.5 w-full bg-white/60 rounded-full overflow-hidden border border-white/40">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              className={`h-full transition-all duration-500 ${progress === 100 ? 'bg-green-500' : 'bg-primary'}`} 
            />
          </div>
        </div>
      )}

      {/* Footer Info */}
      <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/20">
        <div className="flex items-center gap-3">
          {task.dueDate && (
            <div className={`flex items-center gap-1.5 text-[10px] font-bold ${isOverdue ? 'text-red-500' : 'text-muted-foreground'}`}>
              {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
              <span>{format(new Date(task.dueDate), "MMM d")}</span>
            </div>
          )}
          {task.attachments?.length > 0 && (
            <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground">
              <Paperclip size={12} />
              <span>{task.attachments.length}</span>
            </div>
          )}
        </div>

        <div className="flex -space-x-2">
          {task.assignees?.slice(0, 3).map((user: any) => (
            <div 
              key={user.id} 
              className="w-6 h-6 rounded-lg bg-white border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black text-primary overflow-hidden"
              title={user.name || user.email}
            >
              {user.avatarUrl ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" /> : (user.name || user.email).charAt(0).toUpperCase()}
            </div>
          ))}
          {task.assignees?.length > 3 && (
            <div className="w-6 h-6 rounded-lg bg-primary text-white border-2 border-white shadow-sm flex items-center justify-center text-[8px] font-black">
              +{task.assignees.length - 3}
            </div>
          )}
        </div>
      </div>

      {/* Decorative Blur */}
      <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
    </motion.div>
  );
}
