"use client";

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { getProjectTasks, createTask, updateTask } from '@/app/actions/taskActions';
import { useTaskStore } from '@/store/taskStore';
import AdvancedCalendar, { CalendarTask, CalendarPriority } from '@/components/calendar/AdvancedCalendar';
import { Loader2 } from 'lucide-react';
import { getBoardLists } from '@/app/actions/projectActions';
import { getDemoColumns, saveDemoColumns } from '@/utils/demoHelper';
import TaskModal from '@/components/dashboard/TaskModal';
import { AnimatePresence } from 'framer-motion';

export default function CalendarPage() {
  const { openTask } = useTaskStore();
  const [demoTasks, setDemoTasks] = useState<any[]>([]);
  const [selectedTask, setSelectedTask] = useState<any | null>(null);
  
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

  useEffect(() => {
    const cols = getDemoColumns();
    setDemoTasks(cols.flatMap(c => c.cards));
  }, []);

  const effectiveDbTasks = dbTasks.length > 0 ? dbTasks : demoTasks;

  // Map DB tasks to CalendarTask format
  const tasks: CalendarTask[] = effectiveDbTasks.map(t => ({
    id: t.id,
    title: t.title,
    start_date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "",
    end_date: t.dueDate ? new Date(t.dueDate).toISOString().split('T')[0] : "", // For now, start and end are same for single tasks
    priority: ((t.priority as any)?.toLowerCase() || 'low') as CalendarPriority,
    is_completed: t.status === 'DONE',
    is_all_day: true
  })).filter(t => t.start_date !== "");

  const handleCreateTask = async (data: { title: string, startDate: Date, endDate: Date, priority: CalendarPriority }) => {
    if (dbTasks.length === 0) {
      // LocalStorage update for demo mode!
      const nt = {
        id: `d-${Date.now()}`,
        title: data.title,
        label: "General",
        dueDate: data.startDate.toISOString().split('T')[0],
        priority: data.priority.toLowerCase() as any,
        isCompleted: false,
        status: 'TODO' as const,
        notion_content: null,
        userId: "d",
        creator: { id: "d", email: "d@d.com", name: "User" },
        assignees: []
      };
      
      const cols = getDemoColumns();
      if (cols[0]) {
        cols[0].cards.push(nt);
        saveDemoColumns(cols);
        setDemoTasks(cols.flatMap(c => c.cards));
      }
      return;
    }

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
    if (dbTasks.length === 0) {
      const cols = getDemoColumns();
      const updatedCols = cols.map(col => ({
        ...col,
        cards: col.cards.map(card => 
          card.id === taskId ? { ...card, isCompleted: completed, status: completed ? 'DONE' as const : 'TODO' as const } : card
        )
      }));
      saveDemoColumns(updatedCols);
      setDemoTasks(updatedCols.flatMap(c => c.cards));
      return;
    }

    try {
      await updateTask(taskId, {
        status: completed ? 'DONE' : 'TODO'
      });
      mutate();
    } catch (err) {
      console.error("Failed to toggle task from calendar:", err);
    }
  };

  const handleOpenTaskModal = (taskId: string) => {
    const foundTask = effectiveDbTasks.find(t => t.id === taskId);
    if (foundTask) {
      setSelectedTask(foundTask);
    }
  };

  const handleCalendarTaskUpdate = async (updatedTask: any) => {
    // 1. Update local state / LocalStorage in offline demo mode
    if (dbTasks.length === 0) {
      const cols = getDemoColumns();
      const updatedCols = cols.map(col => ({
        ...col,
        cards: col.cards.map(card => 
          card.id === updatedTask.id ? {
            ...card,
            title: updatedTask.title,
            label: updatedTask.label,
            priority: updatedTask.priority,
            dueDate: updatedTask.dueDate,
            isCompleted: updatedTask.isCompleted,
            status: updatedTask.isCompleted ? 'DONE' as const : 'TODO' as const,
            notion_content: updatedTask.notion_content
          } : card
        )
      }));
      saveDemoColumns(updatedCols);
      setDemoTasks(updatedCols.flatMap(c => c.cards));
      
      // Update selectedTask local state to keep modal input synced
      const syncedTask = updatedCols.flatMap(c => c.cards).find(t => t.id === updatedTask.id);
      setSelectedTask(syncedTask || updatedTask);
      return;
    }

    // 2. Real DB mode update
    try {
      await updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description,
        isCompleted: updatedTask.isCompleted,
        status: updatedTask.isCompleted ? 'DONE' : 'TODO',
        contentJson: updatedTask.notion_content,
        dueDate: updatedTask.dueDate ? new Date(updatedTask.dueDate) : null,
        labels: { text: updatedTask.label, priority: updatedTask.priority }
      });
      
      mutate();
      const freshTasks = await getProjectTasks(projectId);
      const syncedTask = freshTasks.find(t => t.id === updatedTask.id);
      setSelectedTask(syncedTask || updatedTask);
    } catch (err) {
      console.error("Failed to update task from calendar modal:", err);
    }
  };

  return (
    <div className="min-h-[80vh] rounded-[40px] bg-white/20 p-8 relative overflow-hidden flex flex-col">
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
          onOpenTaskModal={handleOpenTaskModal}
          onToggleTask={handleToggleTask}
        />
      )}

      {/* Notion-style Document Customization Modal */}
      <AnimatePresence mode="wait">
        {selectedTask && (
          <TaskModal 
            task={{
              id: selectedTask.id,
              title: selectedTask.title,
              description: selectedTask.description,
              label: selectedTask.label || "General",
              priority: selectedTask.priority || 'low',
              dueDate: selectedTask.dueDate ? (typeof selectedTask.dueDate === 'string' ? selectedTask.dueDate : new Date(selectedTask.dueDate).toISOString().split('T')[0]) : null,
              isCompleted: selectedTask.isCompleted,
              notion_content: selectedTask.notion_content || selectedTask.contentJson,
              userId: selectedTask.userId,
              creator: selectedTask.creator,
              assignees: selectedTask.assignees || []
            }} 
            colTitle={lists.find((l: any) => l.id === selectedTask.listId)?.name || "Danh sách"}
            onClose={() => setSelectedTask(null)} 
            onUpdate={handleCalendarTaskUpdate} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
