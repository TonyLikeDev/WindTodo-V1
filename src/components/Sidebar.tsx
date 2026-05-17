"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useSWR from "swr";
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Calendar, 
  Settings, 
  Cloud,
  LogOut,
  Plus,
  Hash,
  ChevronRight,
  FolderOpen,
  ChevronDown,
  Layers,
  Users
} from "lucide-react";
import { getWorkspacesWithProjects, createWorkspace } from "@/app/actions/projectActions";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: workspaces, mutate: mutateWorkspaces } = useSWR("workspaces", getWorkspacesWithProjects);
  const [expandedWorkspaces, setExpandedWorkspaces] = useState<Record<string, boolean>>({});

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/tasks", label: "My Tasks", icon: CheckCircle2 },
    { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
    { href: "/dashboard/users", label: "Thành viên", icon: Users },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (path: string) => pathname === path;

  const toggleWorkspace = (id: string) => {
    setExpandedWorkspaces(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCreateWorkspace = async () => {
    const name = window.prompt("Workspace Name:");
    if (!name) return;
    try {
      await createWorkspace(name);
      mutateWorkspaces();
    } catch (err) {
      console.error("Failed to create workspace:", err);
    }
  };

  return (
    <aside className="h-full w-72 p-6 flex flex-col">
      <div className="glass h-full rounded-[2.5rem] flex flex-col p-6 border-white/40 shadow-xl shadow-sky-dark/10">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
            <Cloud className="text-white" size={24} />
          </div>
          <span className="text-xl font-bold text-foreground tracking-tight">SkyTodo</span>
        </div>

        {/* Main Nav */}
        <nav className="space-y-1 mb-8">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 px-4">Menu</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3 rounded-2xl transition-all group ${
                  active 
                    ? "bg-white/60 shadow-sm text-primary font-bold" 
                    : "text-muted-foreground hover:bg-white/30 hover:text-foreground"
                }`}
              >
                <Icon size={18} className={active ? "text-primary" : "text-muted-foreground group-hover:text-foreground"} />
                <span className="text-sm font-medium">{item.label}</span>
                {active && <ChevronRight size={14} className="ml-auto opacity-50" />}
              </Link>
            );
          })}
        </nav>

        {/* Workspaces Section */}
        <div className="flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2">
          <div className="flex items-center justify-between px-4 mb-4">
             <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Workspaces</p>
             <button 
              onClick={handleCreateWorkspace}
              className="text-primary hover:bg-primary/10 p-1 rounded-lg transition-all"
             >
                <Plus size={14} />
             </button>
          </div>
          
          <div className="space-y-4">
             {workspaces?.map((workspace) => (
               <div key={workspace.id} className="space-y-1">
                  <div className="w-full flex items-center gap-3 px-4 py-2 hover:bg-white/20 rounded-xl transition-all group relative">
                    <button 
                      onClick={() => toggleWorkspace(workspace.id)}
                      className="flex items-center gap-3 flex-1 text-left"
                    >
                      <div className="w-6 h-6 rounded-lg bg-white/40 flex items-center justify-center text-primary shadow-sm border border-white/60">
                         <Layers size={14} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-foreground truncate">{workspace.name}</span>
                        {(() => {
                          const role = workspace.memberships?.[0]?.role || (workspace.ownerId === workspace.memberships?.[0]?.userId ? 'ADMIN' : 'MEMBER');
                          return (
                            <span className={`text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md w-fit mt-0.5 ${
                              role === 'ADMIN' ? 'bg-primary/10 text-primary' : 
                              role === 'MEMBER' ? 'bg-green-500/10 text-green-500' : 
                              'bg-muted-foreground/10 text-muted-foreground'
                            }`}>
                              {role}
                            </span>
                          );
                        })()}
                      </div>
                    </button>
                    <div className="flex items-center gap-1">
                      {workspace.memberships?.[0]?.role === 'ADMIN' && (
                        <button 
                          className="p-1.5 hover:bg-white/40 rounded-lg text-muted-foreground hover:text-primary transition-all opacity-0 group-hover:opacity-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = '/dashboard/users';
                          }}
                        >
                          <Settings size={12} />
                        </button>
                      )}
                      <button 
                        onClick={() => toggleWorkspace(workspace.id)}
                        className="p-1.5 hover:bg-white/40 rounded-lg text-muted-foreground transition-all"
                      >
                        <ChevronDown size={14} className={`transition-transform ${expandedWorkspaces[workspace.id] ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {(expandedWorkspaces[workspace.id] || !expandedWorkspaces.hasOwnProperty(workspace.id)) && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="space-y-1 ml-4 border-l border-white/20 pl-2 overflow-hidden"
                      >
                        {workspace.projects.map((project: any) => (
                          <Link
                            key={project.id}
                            href={`/dashboard/projects/${project.id}`}
                            className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all group ${
                              isActive(`/dashboard/projects/${project.id}`)
                                ? "bg-white/60 shadow-sm text-foreground font-bold"
                                : "text-muted-foreground hover:bg-white/30 hover:text-foreground"
                            }`}
                          >
                            <div 
                              className="w-2 h-2 rounded-full shadow-sm" 
                              style={{ backgroundColor: project.color }} 
                            />
                            <span className="text-xs font-medium truncate">{project.name}</span>
                          </Link>
                        ))}
                        {workspace.projects.length === 0 && (
                          <p className="text-[10px] text-muted-foreground italic px-4 py-2">No projects</p>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
               </div>
             ))}
             
             {(!workspaces || workspaces.length === 0) && (
               <div className="px-4 py-8 text-center glass rounded-[2rem] border-dashed border-white/40">
                  <FolderOpen size={24} className="mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No Workspaces</p>
               </div>
             )}
          </div>
        </div>

        {/* Footer Area */}
        <div className="mt-8 pt-8 border-t border-white/20">
          <button className="flex items-center gap-4 px-4 py-3.5 w-full rounded-2xl text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all group">
            <LogOut size={18} className="group-hover:translate-x-0.5 transition-transform" />
            <span className="text-sm font-bold">Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
