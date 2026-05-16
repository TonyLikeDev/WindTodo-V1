"use client";

import React from "react";
import { Plus, CheckCircle2, Circle, MoreHorizontal } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

interface TaskListProps {
  title: string;
  tasks: Task[];
  onTaskClick?: (id: string) => void;
}

export default function TaskList({ title, tasks, onTaskClick }: TaskListProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-lg font-bold text-foreground/80 flex items-center gap-2">
          {title}
          <span className="text-xs font-medium bg-white/40 px-2 py-0.5 rounded-full text-muted-foreground">
            {tasks.length}
          </span>
        </h3>
        <button className="text-muted-foreground hover:text-foreground transition-colors">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id} 
            onClick={() => onTaskClick?.(task.id)}
            className="group glass p-4 rounded-3xl border-white/40 flex items-center gap-4 hover:bg-white/50 hover:translate-y-[-2px] transition-all cursor-pointer"
          >
            <button className="text-primary hover:scale-110 transition-transform">
              {task.completed ? (
                <CheckCircle2 size={24} className="fill-primary text-white" />
              ) : (
                <Circle size={24} className="text-primary/40 group-hover:text-primary transition-colors" />
              )}
            </button>
            <span className={`text-sm font-medium flex-grow ${task.completed ? "text-muted-foreground line-through decoration-2" : "text-foreground"}`}>
              {task.title}
            </span>
            {task.priority === 'high' && (
              <span className="w-2 h-2 rounded-full bg-red-400 shadow-sm" title="High Priority" />
            )}
          </div>
        ))}

        <button className="w-full py-4 rounded-3xl border-2 border-dashed border-white/40 text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-white/20 transition-all flex items-center justify-center gap-2 text-sm font-bold">
          <Plus size={18} />
          Add Task
        </button>
      </div>
    </div>
  );
}
