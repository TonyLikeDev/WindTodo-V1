"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Layout, 
  Activity, 
  FileText, 
  BarChart3, 
  Maximize2, 
  Minimize2,
  Trash2,
  Sparkles,
  Save,
  CheckCircle2,
  Circle
} from "lucide-react";
import { useTaskStore } from "@/store/taskStore";
import useSWR from "swr";
import { getCardById, updateTask } from "@/app/actions/taskActions";
import OverviewTab from "./Tabs/OverviewTab";
import ActivityTab from "./Tabs/ActivityTab";
import FilesTab from "./Tabs/FilesTab";
import AnalyticsTab from "./Tabs/AnalyticsTab";

export default function TaskModal() {
  const { selectedTaskId, isModalOpen, closeTask } = useTaskStore();
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'files' | 'analytics'>('overview');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const { data: task, mutate: mutateTask, isLoading } = useSWR(
    selectedTaskId ? `task:${selectedTaskId}` : null,
    () => getCardById(selectedTaskId!)
  );

  const [localTask, setLocalTask] = useState<any>(null);

  useEffect(() => {
    if (task) setLocalTask(task);
  }, [task]);

  const handleUpdate = async (updates: any) => {
    if (!selectedTaskId) return;
    setIsSaving(true);
    try {
      const updated = await updateTask(selectedTaskId, updates);
      setLocalTask(updated);
      mutateTask();
    } catch (err) {
      console.error("Failed to update task:", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isModalOpen || !selectedTaskId) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-sky-dark/30 backdrop-blur-xl pointer-events-auto"
          onClick={closeTask}
        />
        
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.9, y: 40 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 40 }}
          className={`glass-dark relative flex flex-col bg-white/80 rounded-[3rem] shadow-2xl border border-white/60 overflow-hidden z-[101] pointer-events-auto transition-all duration-500 ease-in-out ${
            isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-full max-h-[90vh]'
          }`}
        >
          {/* Header */}
          <header className="p-6 md:p-8 border-b border-white/40 flex items-center justify-between bg-white/20 backdrop-blur-md">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-2xl">
                  <Sparkles size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-lg font-black text-foreground tracking-tight">
                    {localTask?.title || "Loading Task..."}
                  </h1>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    ID: {selectedTaskId.slice(0, 8)}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <nav className="hidden lg:flex items-center bg-white/40 p-1 rounded-2xl border border-white/60 ml-8">
                <TabButton 
                  active={activeTab === 'overview'} 
                  onClick={() => setActiveTab('overview')} 
                  icon={<Layout size={16} />} 
                  label="Overview" 
                />
                <TabButton 
                  active={activeTab === 'activity'} 
                  onClick={() => setActiveTab('activity')} 
                  icon={<Activity size={16} />} 
                  label="Activity" 
                />
                <TabButton 
                  active={activeTab === 'files'} 
                  onClick={() => setActiveTab('files')} 
                  icon={<FileText size={16} />} 
                  label="Files" 
                />
                <TabButton 
                  active={activeTab === 'analytics'} 
                  onClick={() => setActiveTab('analytics')} 
                  icon={<BarChart3 size={16} />} 
                  label="Analytics" 
                />
              </nav>
            </div>

            <div className="flex items-center gap-2">
              {isSaving && (
                <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-xl text-[9px] font-black text-primary uppercase tracking-widest animate-pulse mr-4">
                  <Save size={12} /> Saving...
                </div>
              )}
              <button 
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-3 hover:bg-white/60 rounded-2xl transition-all text-muted-foreground hover:text-primary"
              >
                {isFullscreen ? <Minimize2 size={20} /> : <Maximize2 size={20} />}
              </button>
              <button 
                onClick={closeTask}
                className="p-3 hover:bg-white/60 rounded-2xl transition-all group"
              >
                <X size={24} className="text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />
              </button>
            </div>
          </header>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
            {/* Sidebar (Controls) */}
            <aside className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-white/40 p-8 flex flex-col bg-white/10 custom-scrollbar overflow-y-auto">
               <div className="space-y-10">
                  <div>
                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Task Status</p>
                    <button 
                      onClick={() => handleUpdate({ status: localTask.status === 'DONE' ? 'TODO' : 'DONE' })}
                      className={`w-full p-5 rounded-[1.5rem] border-2 flex items-center justify-center gap-4 transition-all font-black uppercase tracking-widest text-[11px] ${
                        localTask?.status === 'DONE' 
                          ? 'bg-green-500 border-green-500 text-white shadow-xl shadow-green-200' 
                          : 'bg-white/40 border-white/60 text-muted-foreground hover:border-primary hover:bg-white/60'
                      }`}
                    >
                      {localTask?.status === 'DONE' ? <><CheckCircle2 size={18} /> Completed</> : <><Circle size={18} /> Mark as Done</>}
                    </button>
                  </div>

                  <div className="lg:hidden">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">View</p>
                     <select 
                      value={activeTab} 
                      onChange={(e) => setActiveTab(e.target.value as any)}
                      className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none"
                     >
                        <option value="overview">Overview</option>
                        <option value="activity">Activity</option>
                        <option value="files">Files</option>
                        <option value="analytics">Analytics</option>
                     </select>
                  </div>

                  {/* Properties would go here */}
                  <div className="space-y-6">
                     <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Properties</p>
                     <PropertyItem label="Assignees" icon={<X size={14} />} value={localTask?.assignees?.length || 0} />
                     <PropertyItem label="Priority" icon={<X size={14} />} value={localTask?.priority || 'MEDIUM'} />
                     <PropertyItem label="Estimated" icon={<X size={14} />} value={`${localTask?.estimatedTime || 0}m`} />
                  </div>
               </div>

               <div className="mt-auto pt-8">
                  <button className="flex items-center gap-3 w-full p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-xs uppercase tracking-widest">
                    <Trash2 size={18} />
                    Archive Task
                  </button>
               </div>
            </aside>

            {/* Tab Content */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12">
               {activeTab === 'overview' && <OverviewTab task={localTask} onUpdate={handleUpdate} />}
               {activeTab === 'activity' && <ActivityTab taskId={selectedTaskId} />}
               {activeTab === 'files' && <FilesTab task={localTask} />}
               {activeTab === 'analytics' && <AnalyticsTab task={localTask} />}
            </main>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all text-xs font-black uppercase tracking-widest ${
        active 
          ? 'bg-white text-primary shadow-sm' 
          : 'text-muted-foreground hover:text-foreground hover:bg-white/40'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}

function PropertyItem({ label, icon, value }: { label: string, icon: React.ReactNode, value: any }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60">
       <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</span>
       <span className="text-xs font-bold text-foreground">{value}</span>
    </div>
  );
}
