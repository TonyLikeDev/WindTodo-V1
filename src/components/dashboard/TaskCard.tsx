"use client";

import React, { memo } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { motion } from "framer-motion";
import { 
  GripVertical, 
  Clock, 
  CheckCircle2, 
  Circle,
  Layout,
  ExternalLink
} from "lucide-react";
import { Task } from "./types";

interface TaskCardProps {
  task: Task;
  index: number;
  onClick: () => void;
  onToggleComplete: (e: React.MouseEvent) => void;
}

const TaskCard = memo(({ task, index, onClick, onToggleComplete }: TaskCardProps) => {
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="mb-4 outline-none focus:ring-0"
          onClick={onClick}
        >
          <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`group relative bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[2rem] shadow-sm hover:shadow-xl transition-all ${
              snapshot.isDragging ? 'rotate-2 scale-105 shadow-2xl ring-2 ring-primary/20 z-[100]' : ''
            }`}
          >
            {/* Top Bar: Priority & Drag Handle */}
            <div className="flex items-start justify-between mb-4 pointer-events-none">
              <div className="flex items-center gap-2">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg ${
                  task.priority === 'high' ? 'bg-red-500/10 text-red-500' :
                  task.priority === 'medium' ? 'bg-amber-500/10 text-amber-600' : 'bg-green-500/10 text-green-600'
                }`}>
                  {task.label}
                </span>
                {task.priority === 'high' && (
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <GripVertical size={14} className="text-muted-foreground/20 opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Content Area */}
            <div className="mb-5">
              <h4 className={`text-sm font-bold text-foreground leading-snug transition-all ${
                task.isCompleted ? 'line-through text-muted-foreground/50 italic' : ''
              }`}>
                {task.title}
              </h4>
            </div>

            {/* Bottom Bar: Meta & Actions */}
            <div className="flex items-center justify-between border-t border-black/5 pt-4">
              <div className="flex items-center gap-3">
                {/* Clickable Toggle - Important: e.stopPropagation handles click vs drag */}
                <button 
                  onClick={onToggleComplete}
                  className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all z-20 pointer-events-auto shadow-sm ${
                    task.isCompleted 
                      ? 'bg-green-500 border-green-500 text-white shadow-green-200' 
                      : 'bg-white/80 border-white/80 text-muted-foreground/40 hover:border-primary hover:text-primary'
                  }`}
                >
                  {task.isCompleted ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                </button>
                
                <div className="flex items-center gap-1.5 text-[9px] font-black text-muted-foreground/60 uppercase tracking-widest">
                  <Clock size={10} />
                  {task.dueDate || "No deadline"}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {task.notion_content && (
                  <div className="p-1.5 bg-primary/10 rounded-lg text-primary opacity-60">
                    <Layout size={10} />
                  </div>
                )}
                
                <div className="flex -space-x-2.5 hover:space-x-0.5 transition-all duration-300">
                  {task.assignees && task.assignees.length > 0 ? (
                    task.assignees.slice(0, 3).map((u, i) => (
                      <div 
                        key={u.id}
                        className="w-7 h-7 rounded-xl bg-white flex items-center justify-center border-2 border-white shadow-sm overflow-hidden ring-1 ring-black/5 z-[5]"
                        style={{ zIndex: 10 - i }}
                      >
                         {u.avatarUrl ? (
                           <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                         ) : (
                           <span className="text-[8px] font-black text-primary uppercase">{u.name?.charAt(0)}</span>
                         )}
                      </div>
                    ))
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-black/5 flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                       <span className="text-[8px] font-black text-muted-foreground/40 uppercase">?</span>
                    </div>
                  )}
                  {task.assignees && task.assignees.length > 3 && (
                    <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center border-2 border-white shadow-sm text-[7px] font-black z-0">
                      +{task.assignees.length - 3}
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Hover Indicator */}
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
               <ExternalLink size={12} className="text-primary/40" />
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
});

TaskCard.displayName = "TaskCard";

export default TaskCard;
