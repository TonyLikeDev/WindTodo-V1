"use client";

import React, { useState, useCallback, memo, useEffect } from "react";
import { 
  DragDropContext, 
  DropResult 
} from "@hello-pangea/dnd";
import { PlusCircle } from "lucide-react";
import TaskColumn from "./TaskColumn";
import { ColumnData, Task } from "./types";
import { AnimatePresence } from "framer-motion";
import TaskModal from "./TaskModal";
import { moveTask, createTask, updateTask } from "@/app/actions/taskActions";
import { useRealtimeBoard } from "@/lib/useRealtimeBoard";

interface KanbanBoardProps {
  initialData: ColumnData[];
  projectId: string;
}

const KanbanBoard = memo(({ initialData, projectId }: KanbanBoardProps) => {
  const [columns, setColumns] = useState<ColumnData[]>(initialData);
  const [selectedTask, setSelectedTask] = useState<{ colId: string, task: Task } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setColumns(initialData);
  }, [initialData]);

  // --- Realtime Sync ---
  useRealtimeBoard(projectId);

  // --- DnD Handler ---
  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic Update
    const prevColumns = [...columns];
    setColumns(prev => {
      const newCols = [...prev];
      const sCol = newCols.find(c => c.id === source.droppableId);
      const dCol = newCols.find(c => c.id === destination.droppableId);
      if (!sCol || !dCol) return prev;
      
      const sCards = [...sCol.cards];
      const [removed] = sCards.splice(source.index, 1);
      
      if (!removed) return prev;
      
      if (source.droppableId === destination.droppableId) {
        sCards.splice(destination.index, 0, removed);
        sCol.cards = sCards;
      } else {
        const dCards = [...dCol.cards];
        dCards.splice(destination.index, 0, removed);
        sCol.cards = sCards;
        dCol.cards = dCards;
      }
      return [...newCols];
    });

    if (projectId === "demo-project") return;

    try {
      await moveTask(draggableId, destination.droppableId, destination.index);
    } catch (err) {
      console.error("Sync error:", err);
      setColumns(prevColumns);
    }
  }, [columns, projectId]);

  // --- Operations ---
  const handleUpdate = useCallback(async (t: Task) => {
    setColumns(prev => prev.map(c => ({
      ...c,
      cards: c.cards.map(card => card.id === t.id ? t : card)
    })));
    setSelectedTask(prev => prev ? { ...prev, task: t } : null);

    if (projectId === "demo-project") return;
    try {
      await updateTask(t.id, {
        title: t.title,
        description: t.description,
        isCompleted: t.isCompleted,
        contentJson: t.notion_content,
        dueDate: t.dueDate ? new Date(t.dueDate) : null,
        labels: { text: t.label, priority: t.priority }
      });
    } catch (err) { console.error(err); }
  }, [projectId]);

  const handleToggle = useCallback(async (colId: string, cardId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setColumns(prev => prev.map(c => c.id === colId ? {
      ...c,
      cards: c.cards.map(card => {
        if (card.id === cardId) {
          const next = !card.isCompleted;
          if (projectId !== "demo-project") {
            updateTask(cardId, { isCompleted: next, status: next ? 'DONE' : 'TODO' });
          }
          return { ...card, isCompleted: next };
        }
        return card;
      })
    } : c));
  }, [projectId]);

  const handleAdd = useCallback(async (colId: string) => {
    const title = window.prompt("Tên nhiệm vụ:");
    if (!title) return;
    
    if (projectId === "demo-project") {
      const nt: Task = {
        id: `d-${Date.now()}`, title, label: "General", priority: 'low',
        dueDate: null, isCompleted: false, notion_content: null,
        userId: "d", creator: { id: "d", email: "d@d.com", name: "User" },
        assignees: []
      };

      setColumns(prev => prev.map(c => c.id === colId ? { ...c, cards: [...c.cards, nt] } : c));
      return;
    }

    try {
      const dbT = await createTask(title, colId);
      setColumns(prev => prev.map(c => c.id === colId ? {
        ...c,
        cards: [...c.cards, {
          id: dbT.id, title: dbT.title, description: dbT.description,
          label: "General", priority: 'low', dueDate: null, isCompleted: false,
          notion_content: dbT.contentJson, userId: dbT.userId,
          creator: dbT.creator, assignees: dbT.assignees || []
        }]
      } : c));
    } catch (err) { console.error(err); }

  }, [projectId]);

  if (!isMounted) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 overflow-x-auto pb-10 custom-scrollbar">
          <div className="flex gap-8 h-full items-start px-2 min-w-max">
            {columns.map(col => (
              <TaskColumn 
                key={col.id} 
                column={col} 
                onTaskClick={(t) => setSelectedTask({ colId: col.id, task: t })} 
                onToggleComplete={handleToggle}
                onAddTask={() => handleAdd(col.id)} 
              />
            ))}
            
            <button className="w-80 h-32 flex-shrink-0 glass rounded-[2.5rem] border-2 border-dashed border-white/40 flex flex-col items-center justify-center gap-3 text-muted-foreground/60 hover:bg-white/60 hover:text-primary transition-all shadow-sm hover:shadow-xl group">
               <div className="p-3 bg-white/40 rounded-2xl group-hover:rotate-90 transition-transform duration-500">
                 <PlusCircle size={24} />
               </div>
               <span className="text-[10px] font-black uppercase tracking-[0.2em]">Thêm danh sách</span>
            </button>
          </div>
        </div>
      </DragDropContext>

      <AnimatePresence mode="wait">
        {selectedTask && (
          <TaskModal 
            task={selectedTask.task} 
            colTitle={columns.find(c => c.id === selectedTask.colId)?.title || ""}
            onClose={() => setSelectedTask(null)} 
            onUpdate={handleUpdate} 
          />
        )}
      </AnimatePresence>
    </div>
  );
});

KanbanBoard.displayName = "KanbanBoard";

export default KanbanBoard;
