'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { Trash2 } from 'lucide-react';
import AddProjectModal from './AddProjectModal';
import { createProject, getProjects, deleteProject } from '@/app/actions/projectActions';

type Project = {
  id: string;
  name: string;
  color: string;
  userId: string;
  createdAt: Date;
};

export default function ProjectsSection() {
  const { data: projects = [], mutate, isLoading } = useSWR<Project[]>(
    'projects',
    getProjects,
    {
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );
  const [open, setOpen] = useState(false);

  const handleCreate = async (name: string, color: string) => {
    setOpen(false);
    const optimistic: Project = {
      id: `temp-${Date.now()}`,
      name,
      color,
      userId: 'temp',
      createdAt: new Date(),
    };
    mutate([...projects, optimistic], false);
    await createProject(name, color);
    mutate();
  };

  const handleDelete = async (e: React.MouseEvent, projectId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm('Are you sure you want to delete this project? All lists and tasks will be permanently removed.')) {
      mutate(projects.filter(p => p.id !== projectId), false);
      await deleteProject(projectId);
      mutate();
    }
  };

  return (
    <>
      {isLoading && (
        <>
          <div className="glass rounded-2xl min-h-[180px] animate-pulse" />
          <div className="glass rounded-2xl min-h-[180px] animate-pulse" />
        </>
      )}

      {!isLoading &&
        projects.map((p) => (
          <Link
            key={p.id}
            href={p.id.startsWith('temp-') ? '#' : `/projects/${p.id}`}
            className={`glass rounded-2xl p-6 flex flex-col min-h-[180px] hover:bg-white/5 transition-colors group relative ${
              p.id.startsWith('temp-') ? 'opacity-50 pointer-events-none' : ''
            }`}
            style={{ background: p.color }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-bold text-slate-950 truncate pr-8">{p.name}</h3>
              <svg className="w-4 h-4 text-slate-800/90 group-hover:text-slate-950 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            
            <button
              onClick={(e) => handleDelete(e, p.id)}
              className="absolute top-6 right-12 p-2 text-slate-800/90 hover:text-red-700 hover:bg-red-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
              title="Delete Project"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <p className="text-xs text-slate-800/90 font-semibold mb-auto">Open board</p>
            <div className="mt-4 text-[11px] text-slate-900/80 font-extrabold uppercase tracking-wider">Project</div>
          </Link>
        ))}

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[180px] hover:bg-white/10 transition-colors group cursor-pointer"
      >
        <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mb-3 border border-white/20 group-hover:bg-white/20 transition-colors">
          <svg className="w-7 h-7 text-muted-foreground group-hover:text-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">Add Project</h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          New board with custom-colored lists.
        </p>
      </button>

      <AddProjectModal open={open} onClose={() => setOpen(false)} onCreate={handleCreate} />
    </>
  );
}
