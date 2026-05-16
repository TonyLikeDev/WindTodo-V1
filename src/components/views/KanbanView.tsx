"use client";

import React, { useState } from "react";
import { DragDropContext, Droppable } from "@hello-pangea/dnd";
import TaskList from "../tasklists/TaskList";
import { Plus } from "lucide-react";
import { moveTask, updateTask } from "@/app/actions/taskActions";
import { createBoardList } from "@/app/actions/projectActions";

interface KanbanViewProps {
  projectId: string;
  lists: any[];
  members: any[];
  mutateLists: () => void;
}

export default function KanbanView({ projectId, lists, members, mutateLists }: KanbanViewProps) {
  const onDragEnd = async (result: any) => {
    const { destination, source, draggableId, type } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    if (type === "task") {
      await moveTask(draggableId, destination.droppableId, destination.index);
      
      // Update status if moved to a different list (optional logic)
      const targetList = lists.find(l => l.id === destination.droppableId);
      if (targetList && source.droppableId !== destination.droppableId) {
         const newStatus = getStatusFromListName(targetList.name);
         if (newStatus) await updateTask(draggableId, { status: newStatus });
      }
    }

    mutateLists();
  };

  const getStatusFromListName = (listName: string): any => {
    const n = listName.toLowerCase().trim();
    if (n.includes('todo') || n.includes('cần làm')) return 'TODO';
    if (n.includes('progress') || n.includes('đang làm')) return 'IN_PROGRESS';
    if (n.includes('done') || n.includes('đã xong')) return 'DONE';
    return null;
  };

  const handleAddList = async () => {
    const name = prompt("Enter list name:");
    if (!name) return;
    await createBoardList(projectId, name, "#0ea5e9", lists.length);
    mutateLists();
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="h-full overflow-x-auto custom-scrollbar p-8">
        <Droppable droppableId="all-lists" direction="horizontal" type="list">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="flex gap-8 items-start min-h-full"
            >
              {lists.map((list, index) => (
                <TaskList key={list.id} list={list} index={index} />
              ))}
              {provided.placeholder}

              <button
                onClick={handleAddList}
                className="w-80 flex-shrink-0 rounded-[2rem] border-2 border-dashed border-white/40 bg-white/10 hover:bg-white/30 hover:border-white/60 transition-all p-6 flex flex-col items-center justify-center gap-4 text-primary font-black uppercase tracking-widest group"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <Plus size={24} />
                </div>
                <span>New Column</span>
              </button>
            </div>
          )}
        </Droppable>
      </div>
    </DragDropContext>
  );
}
