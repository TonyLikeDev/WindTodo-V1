"use client";

import React, { memo } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { Plus, LayoutPanelTop } from "lucide-react";
import TaskCard from "./TaskCard";
import { ColumnData, Task } from "./types";

interface TaskColumnProps {
  column: ColumnData;
  onTaskClick: (task: Task) => void;
  onToggleComplete: (colId: string, cardId: string, e: React.MouseEvent) => void;
  onAddTask: (title: string) => void;
}

const TaskColumn = memo(({ column, onTaskClick, onToggleComplete, onAddTask }: TaskColumnProps) => {
  const [isAdding, setIsAdding] = React.useState(false);
  const [title, setTitle] = React.useState("");

  const handleSave = () => {
    if (!title.trim()) return;
    onAddTask(title.trim());
    setTitle("");
    setIsAdding(false);
  };
  return (
    <div className="w-80 lg:w-96 flex-shrink-0 flex flex-col h-full min-h-[600px]">
      <div className="flex flex-col h-full bg-white/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-xl shadow-sky-dark/5 overflow-hidden ring-1 ring-white/20">
        {/* Column Header */}
        <div className="p-7 pb-5 flex items-center justify-between bg-white/40 border-b border-white/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <LayoutPanelTop size={14} className="text-primary" />
            </div>
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-foreground/80">{column.title}</h3>
            <div className="min-w-[20px] h-5 flex items-center justify-center bg-white/80 px-1.5 rounded-lg text-[9px] font-black text-primary shadow-sm">
              {column.cards.length}
            </div>
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2 hover:bg-primary/10 hover:text-primary rounded-xl transition-all text-muted-foreground/60"
          >
            <Plus size={18} />
          </button>
        </div>

        {/* Scrollable Task List */}
        <Droppable droppableId={column.id}>
          {(provided, snapshot) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className={`flex-1 overflow-y-auto px-5 py-6 custom-scrollbar transition-colors duration-300 ${
                snapshot.isDraggingOver ? 'bg-primary/5' : ''
              }`}
            >
              {column.cards.map((task, index) => {
                if (!task) return null;
                return (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    index={index} 
                    onClick={() => onTaskClick(task)}
                    onToggleComplete={(e) => onToggleComplete(column.id, task.id, e)}
                  />
                );
              })}

              {isAdding && (
                <div className="mb-4 bg-white/60 backdrop-blur-md border border-white/60 p-5 rounded-[2rem] shadow-sm animate-in slide-in-from-bottom-2 duration-300">
                  <textarea
                    autoFocus
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Tiêu đề nhiệm vụ..."
                    className="w-full bg-transparent border-none text-xs font-bold text-foreground placeholder-muted-foreground/30 outline-none resize-none mb-3"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSave(); }
                      if (e.key === "Escape") setIsAdding(false);
                    }}
                  />
                  <div className="flex items-center justify-between">
                    <button 
                      onClick={handleSave} 
                      className="px-4 py-2 bg-primary text-white text-[9px] font-black uppercase tracking-widest rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                      Thêm
                    </button>
                    <button 
                      onClick={() => setIsAdding(false)} 
                      className="px-4 py-2 bg-black/5 hover:bg-black/10 rounded-xl text-muted-foreground/60 transition-all text-[9px] font-black uppercase tracking-widest"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
              {provided.placeholder}
            </div>
          )}
        </Droppable>

        {/* Quick Add Footer */}
        <div className="p-5 bg-white/20">
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full py-4 rounded-2xl border border-dashed border-white/60 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 hover:bg-white/60 hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-2 group"
          >
            <Plus size={14} className="group-hover:rotate-90 transition-transform duration-300" />
            Tạo thẻ mới
          </button>
        </div>
      </div>
    </div>
  );
});

TaskColumn.displayName = "TaskColumn";

export default TaskColumn;
