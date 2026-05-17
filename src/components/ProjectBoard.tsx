"use client";

import React, { useState, useMemo } from 'react';
import useSWR from 'swr';
import { 
  getBoardLists, 
  getProjects 
} from '@/app/actions/projectActions';
import { getAllUsers, addMemberToProject, removeMemberFromProject } from '@/app/actions/userActions';
import { 
  Users, 
  Plus, 
  ChevronLeft, 
  Layout, 
  Table as TableIcon, 
  Calendar as CalendarIcon, 
  FileText,
  Settings,
  Sparkles,
  X as XIcon,
  Loader2,
  WifiOff
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import KanbanView from './views/KanbanView';
import TableView from './views/TableView';
import CalendarView from './views/CalendarView';
import DocumentView from './views/DocumentView';
import TaskModal from './tasks/TaskModal/TaskModal';
import { useTaskStore } from '@/store/taskStore';
import { useBoardStore } from '@/store/boardStore';
import { useRealtimeBoard } from '@/lib/useRealtimeBoard';

export default function ProjectBoard({ projectId }: { projectId: string }) {
  const { currentView, setView } = useBoardStore();
  const { selectedTaskId, isModalOpen, closeTask } = useTaskStore();
  
  // Realtime subscription for tasks in this project
  useRealtimeBoard(projectId);
  
  const { data: projects = [] as any[], mutate: mutateProjects, isLoading: projectsLoading, error: projectsError } = useSWR<any[]>(
    'projects',
    getProjects,
    { shouldRetryOnError: false }
  );
  
  const { data: allUsers = [] } = useSWR('users', getAllUsers);
  
  const { data: lists = [], mutate: mutateLists, isLoading: listsLoading, error: listsError } = useSWR(
    projectId ? `board:${projectId}` : null,
    () => getBoardLists(projectId),
    { shouldRetryOnError: false }
  );

  const isDemoMode = projectsError || listsError || !projects.find((p: any) => p.id === projectId);

  const [showMemberModal, setShowMemberModal] = useState(false);

  const project = useMemo(
    () => projects.find((p: any) => p.id === projectId) ?? null,
    [projects, projectId]
  );

  const handleAddMember = async (userId: string) => {
    try {
      await addMemberToProject(projectId, userId);
      mutateProjects();
    } catch (err) {
      console.error('Failed to add member:', err);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    try {
      await removeMemberFromProject(projectId, userId);
      mutateProjects();
    } catch (err) {
      console.error('Failed to remove member:', err);
    }
  };

  if (projectsLoading && !isDemoMode) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">Entering Workspace...</p>
      </div>
    );
  }

  const effectiveProject = project || {
    id: projectId,
    name: "Dự án Offline (Demo)",
    color: "#5D9CEC",
    userId: "system",
    members: project?.members || []
  };

  const effectiveLists = lists.length > 0 ? lists : (isDemoMode ? [
    { id: 'demo-1', name: '🎯 Cần làm', color: '#5D9CEC', tasks: [] },
    { id: 'demo-2', name: '⚡ Đang làm', color: '#4FC3F7', tasks: [] },
    { id: 'demo-3', name: '✅ Đã xong', color: '#81D4FA', tasks: [] }
  ] : []);


  const renderView = () => {
    switch (currentView) {
      case 'table':
        return <TableView projectId={projectId} />;
      case 'calendar':
        return <CalendarView projectId={projectId} />;
      case 'document':
        return <DocumentView projectId={projectId} lists={effectiveLists} />;
      default:
        return (
          <KanbanView 
            projectId={projectId} 
            lists={effectiveLists} 
            members={effectiveProject.members} 
            mutateLists={mutateLists} 
          />
        );
    }
  };


  return (
    <div className="h-full flex flex-col overflow-hidden relative">
      {/* Project Header */}
      <header className="px-8 py-6 flex flex-wrap items-center justify-between gap-6 relative z-10 border-b border-white/20 bg-white/10 backdrop-blur-md">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="p-3 hover:bg-white/60 rounded-2xl transition-all border border-transparent hover:border-white/60 shadow-sm text-muted-foreground hover:text-primary">
            <ChevronLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-foreground tracking-tight">{effectiveProject.name}</h1>
              <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: effectiveProject.color }} />
              {isDemoMode && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-[9px] font-black text-amber-600 uppercase tracking-widest animate-pulse ml-2">
                  <WifiOff size={10} /> Offline
                </div>
              )}
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1 opacity-50 flex items-center gap-2">
              <Sparkles size={10} className="text-primary" />
              Collaborative Space
            </p>
          </div>

        </div>

        {/* View Switcher */}
        <div className="glass p-1.5 rounded-[2rem] flex items-center gap-1 border-white/40 shadow-inner relative">
           <ViewTab active={currentView === 'kanban'} onClick={() => setView('kanban')} icon={<Layout size={16} />} label="Board" />
           <ViewTab active={currentView === 'table'} onClick={() => setView('table')} icon={<TableIcon size={16} />} label="Table" />
           <ViewTab active={currentView === 'calendar'} onClick={() => setView('calendar')} icon={<CalendarIcon size={16} />} label="Calendar" />
           <ViewTab active={currentView === 'document'} onClick={() => setView('document')} icon={<FileText size={16} />} label="Docs" />
        </div>

        {/* Actions & Members */}
        <div className="flex items-center gap-6">
          <div className="flex -space-x-3 hover:space-x-1 transition-all">
            {effectiveProject.members.slice(0, 3).map((m: any) => (
              <div key={m.id} className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-xs font-black text-primary border-4 border-white shadow-lg overflow-hidden group">
                 {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {!isDemoMode && (
              <button 
                onClick={() => setShowMemberModal(true)}
                className="w-10 h-10 rounded-2xl bg-primary text-white flex items-center justify-center border-4 border-white shadow-lg hover:scale-110 transition-all z-10"
              >
                <Plus size={16} />
              </button>
            )}
          </div>

          
          <div className="w-px h-8 bg-white/20 mx-2" />
          
          <button className="p-3 hover:bg-white/60 rounded-2xl transition-all text-muted-foreground hover:text-foreground">
             <Settings size={20} />
          </button>
        </div>
      </header>

      {/* View Content */}
      <main className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="h-full"
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Task Modal */}
      <TaskModal />

      {/* Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
           <div className="absolute inset-0 bg-sky-dark/20 backdrop-blur-md" onClick={() => setShowMemberModal(false)} />
           <div className="glass relative w-full max-w-lg rounded-[3rem] shadow-2xl p-10 border-white animate-in zoom-in-95 duration-300">
              <div className="flex items-center justify-between mb-8">
                 <h3 className="text-2xl font-black text-foreground tracking-tight">Team Members</h3>
                 <button onClick={() => setShowMemberModal(false)} className="p-3 hover:bg-white/60 rounded-2xl transition-all">
                    <X size={24} className="text-muted-foreground" />
                 </button>
              </div>

              <div className="space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar pr-4 -mr-4">
                <div className="space-y-4">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Collaborators</p>
                   {effectiveProject.members.map((m: any) => (
                     <div key={m.id} className="flex items-center justify-between p-4 bg-white/40 rounded-[1.5rem] border border-white/60 shadow-sm group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center text-sm font-black text-primary border border-white shadow-sm overflow-hidden">
                              {m.avatarUrl ? <img src={m.avatarUrl} alt="" className="w-full h-full object-cover" /> : m.name?.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground">{m.name || 'User'}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{m.email}</p>
                           </div>
                        </div>
                        {m.id !== effectiveProject.userId && (

                          <button onClick={() => handleRemoveMember(m.id)} className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-all">
                             <Trash2 size={16} />
                          </button>
                        )}
                     </div>
                   ))}
                </div>

                <div className="space-y-4">
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Available Users</p>
                   {allUsers.filter((u: any) => !effectiveProject.members.some((m: any) => m.id === u.id)).map((u: any) => (
                     <div key={u.id} className="flex items-center justify-between p-4 hover:bg-white/20 rounded-[1.5rem] transition-all group">
                        <div className="flex items-center gap-4">
                           <div className="w-10 h-10 rounded-2xl bg-white/40 flex items-center justify-center text-sm font-black text-muted-foreground border border-white/60 overflow-hidden">
                              {u.avatarUrl ? <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" /> : u.name?.charAt(0).toUpperCase()}
                           </div>
                           <div>
                              <p className="text-sm font-bold text-foreground">{u.name || 'User'}</p>
                              <p className="text-[10px] text-muted-foreground font-medium">{u.email}</p>
                           </div>
                        </div>
                        <button 
                          onClick={() => handleAddMember(u.id)}
                          className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                           Invite
                        </button>
                     </div>
                   ))}
                </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}

function ViewTab({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`relative flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all z-10 ${
        active 
          ? 'text-primary' 
          : 'text-muted-foreground hover:text-foreground'
      }`}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-white rounded-2xl shadow-lg shadow-sky-dark/5 border border-white z-[-1]"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      {icon}
      <span>{label}</span>
    </button>
  );
}

function X({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

function Trash2({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );
}
