"use client";

import React, { useState } from 'react';
import useSWR from 'swr';
import { getProjectTasks, createTask, updateTask } from '@/app/actions/taskActions';
import { useTaskStore } from '@/store/taskStore';
import AdvancedCalendar, { CalendarTask, CalendarPriority } from '@/components/calendar/AdvancedCalendar';
import { Loader2 } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { getBoardLists } from '@/app/actions/projectActions';

export default function CalendarPage() {
  const { openTask } = useTaskStore();
  
  // Use a default project for the calendar view
  const projectId = "demo-project"; 

  const { data: dbTasks = [], isLoading, mutate } = useSWR(
    `project-tasks:${projectId}`,
    () => getProjectTasks(projectId)
  );

  const { data: lists = [] } = useSWR(
    `project-lists:${projectId}`,
    () => getBoardLists(projectId)
  );

  // Map DB tasks to CalendarTask format
  const tasks: CalendarTask[] = dbTasks.map(t => ({
    id: t.id,
    title: t.title,
    start_date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "",
    end_date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "", // For now, start and end are same for single tasks
    priority: ((t.priority as any)?.toLowerCase() || 'low') as CalendarPriority,
    is_completed: t.status === 'DONE',
    is_all_day: true
  })).filter(t => t.start_date !== "");

  const handleCreateTask = async (data: { title: string, startDate: Date, endDate: Date, priority: CalendarPriority }) => {
    try {
      const targetListId = lists[0]?.id || "default-list";
      await createTask(data.title, targetListId, {
        dueDate: data.startDate,
        priority: data.priority.toUpperCase() as any
      });
      mutate();
    } catch (err) {
      console.error("Failed to create task from calendar:", err);
    }
  };

  const handleToggleTask = async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, {
        status: completed ? 'DONE' : 'TODO'
      });
      mutate();
    } catch (err) {
      console.error("Failed to toggle task from calendar:", err);
    }
  };

  return (
    <div className="flex h-screen bg-sky-light overflow-hidden">
      <Sidebar />
      <main className="flex-1 flex flex-col min-w-0 bg-white/20">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="animate-spin text-primary mx-auto mb-4" size={48} />
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Syncing Timeline...</p>
            </div>
          </div>
        ) : (
          <AdvancedCalendar 
            tasks={tasks} 
            onCreateTask={handleCreateTask}
            onOpenTaskModal={(id) => openTask(id)}
            onToggleTask={handleToggleTask}
          />
        )}
      </main>
    </div>
  );
}
