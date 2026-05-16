"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MoreVertical, 
  Plus, 
  ChevronDown, 
  ChevronRight,
  Target,
  Circle
} from "lucide-react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import TaskCard from "../tasks/TaskCard";
import { useTaskStore } from "@/store/taskStore";

interface TaskListProps {
  list: any;
  index: number;
}

export default function TaskList({ list, index }: TaskListProps) {
  const { collapsedLists, toggleListCollapse } = useTaskStore();
  const isCollapsed = collapsedLists.includes(list.id);
  
  const tasks = list.tasks || [];
  const completedTasks = tasks.filter((t: any) => t.status === 'DONE').length;
  const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <Draggable draggableId={list.id} index={index}>
      {(provided) => (
        <div
          {...provided.draggableProps}
          ref={provided.innerRef}
          className={`flex-shrink-0 w-80 h-full flex flex-col transition-all duration-500 ${isCollapsed ? 'w-16' : 'w-80'}`}
        >
          {/* Header */}
          <div 
            {...provided.dragHandleProps}
            className={`glass p-4 rounded-[2rem] border-white/40 mb-4 bg-white/40 shadow-sm relative overflow-hidden group ${isCollapsed ? 'h-full flex-col' : ''}`}
          >
            {/* Background Color Accent */}
            <div 
              className="absolute top-0 left-0 w-full h-1 opacity-40" 
              style={{ backgroundColor: list.color || '#0ea5e9' }} 
            />

            <div className={`flex items-center justify-between ${isCollapsed ? 'flex-col gap-8' : ''}`}>
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => toggleListCollapse(list.id)}
                  className="p-1.5 hover:bg-white/60 rounded-xl transition-all text-primary"
                >
                  {isCollapsed ? <ChevronRight size={18} /> : <ChevronDown size={18} />}
                </button>
                {!isCollapsed && (
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                       <span className="text-sm font-black text-foreground tracking-tight">{list.name}</span>
                       <span className="px-2 py-0.5 bg-primary/10 rounded-lg text-[9px] font-black text-primary">
                         {tasks.length}
                       </span>
                    </div>
                  </div>
                )}
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1">
                  <button className="p-2 hover:bg-white/60 rounded-xl transition-all text-muted-foreground hover:text-primary">
                    <Plus size={18} />
                  </button>
                  <button className="p-2 hover:bg-white/60 rounded-xl transition-all text-muted-foreground">
                    <MoreVertical size={18} />
                  </button>
                </div>
              )}

              {isCollapsed && (
                <div className="flex flex-col items-center gap-6">
                   <div className="w-10 h-10 rounded-2xl bg-white/60 flex items-center justify-center text-primary shadow-sm border border-white/40">
                      <Target size={20} />
                   </div>
                   <div className="vertical-text text-[10px] font-black text-primary tracking-widest uppercase">
                     {list.name}
                   </div>
                </div>
              )}
            </div>

            {!isCollapsed && tasks.length > 0 && (
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-white/60 rounded-full overflow-hidden border border-white/40">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     className="h-full bg-primary" 
                   />
                </div>
                <span className="text-[9px] font-black text-primary">{progress}%</span>
              </div>
            )}
          </div>

          {/* Task Area */}
          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="flex-1 min-h-0"
              >
                <Droppable droppableId={list.id} type="task">
                  {(provided) => (
                    <div
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                      className="h-full overflow-y-auto custom-scrollbar px-1"
                    >
                      {tasks.map((task: any, i: number) => (
                        <TaskCard key={task.id} task={task} index={i} />
                      ))}
                      {provided.placeholder}
                      
                      {/* Empty State */}
                      {tasks.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 opacity-30">
                           <Circle className="mb-3 text-muted-foreground" size={32} />
                           <p className="text-[10px] font-black uppercase tracking-widest">No tasks yet</p>
                        </div>
                      )}
                    </div>
                  )}
                </Droppable>
              </motion.div>
            )}
          </AnimatePresence>
          
          <style jsx>{`
            .vertical-text {
              writing-mode: vertical-rl;
              transform: rotate(180deg);
            }
          `}</style>
        </div>
      )}
    </Draggable>
  );
}
