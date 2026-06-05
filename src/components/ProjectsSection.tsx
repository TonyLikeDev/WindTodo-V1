'use client';

import Link from 'next/link';
import { useState } from 'react';
import useSWR from 'swr';
import { LogOut, Trash2, User, LayoutGrid, Repeat, Sparkles } from 'lucide-react';
import AddProjectModal from './AddProjectModal';
import {
  createProject,
  createProjectFromTemplate,
  getProjects,
  deleteProject,
} from '@/app/actions/projectActions';
import { getAuthUser } from '@/app/actions/userActions';
import { PROJECT_TEMPLATES, type ProjectTemplate } from '@/lib/projectTemplates';
import { useConfirm } from './ConfirmDialog';

const TEMPLATE_ICON: Record<string, typeof User> = {
  personal: User,
  kanban:   LayoutGrid,
  sprint:   Repeat,
};

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
  const { data: me } = useSWR('auth-user', getAuthUser, {
    revalidateOnFocus: false,
    dedupingInterval: 60000,
  });
  const [open, setOpen] = useState(false);
  const { confirm, confirmDialog } = useConfirm();

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

  const handleTemplate = async (template: ProjectTemplate) => {
    const optimistic: Project = {
      id: `temp-${Date.now()}`,
      name: template.name,
      color: template.color,
      userId: 'temp',
      createdAt: new Date(),
    };
    mutate([...projects, optimistic], false);
    await createProjectFromTemplate(template.id);
    mutate();
  };

  const handleDelete = async (e: React.MouseEvent, project: Project) => {
    e.preventDefault();
    e.stopPropagation();

    const isOwner = me?.id === project.userId;
    const ok = await confirm(
      isOwner
        ? {
            title: 'Delete project?',
            message: `"${project.name}" and all of its lists and tasks will be permanently removed. This can't be undone.`,
            confirmLabel: 'Delete project',
            danger: true,
          }
        : {
            title: 'Leave project?',
            message: `You'll lose access to "${project.name}" until an admin invites you back.`,
            confirmLabel: 'Leave',
            danger: true,
          },
    );

    if (ok) {
      mutate(projects.filter(p => p.id !== project.id), false);
      await deleteProject(project.id);
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
        projects.map((p) => {
          const isOwner = me?.id === p.userId;
          return (
          <Link
            key={p.id}
            href={p.id.startsWith('temp-') ? '#' : `/projects/${p.id}`}
            className={`glass rounded-2xl p-6 flex flex-col min-h-[180px] transition-transform hover:-translate-y-0.5 group relative ${
              p.id.startsWith('temp-') ? 'opacity-50 pointer-events-none' : ''
            }`}
            style={{
              background: `linear-gradient(135deg, color-mix(in srgb, ${p.color} 88%, transparent) 0%, color-mix(in srgb, ${p.color} 70%, #000 18%) 100%)`,
              backdropFilter: 'blur(16px) saturate(140%)',
              WebkitBackdropFilter: 'blur(16px) saturate(140%)',
              borderColor: `color-mix(in srgb, ${p.color} 55%, transparent)`,
              boxShadow: `0 10px 28px -10px color-mix(in srgb, ${p.color} 70%, transparent)`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate pr-8">{p.name}</h3>
              <svg className="w-4 h-4 text-gray-700/70 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>

            <button
              onClick={(e) => handleDelete(e, p)}
              className="absolute top-6 right-12 p-2 text-gray-800/60 dark:text-white/50 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all z-10"
              title={isOwner ? 'Delete Project' : 'Leave Project'}
            >
              {isOwner ? <Trash2 className="w-4 h-4" /> : <LogOut className="w-4 h-4" />}
            </button>

            <p className="text-xs text-gray-800/80 dark:text-white/70 mb-auto">Open board</p>
            <div className="mt-4 text-[11px] text-gray-800/75 dark:text-white/60 uppercase tracking-wider font-semibold">Project</div>
          </Link>
          );
        })}

      {!isLoading && projects.length === 0 &&
        PROJECT_TEMPLATES.map((t) => {
          const Icon = TEMPLATE_ICON[t.id] ?? Sparkles;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTemplate(t)}
              className="glass p-5 rounded-2xl flex flex-col text-left min-h-[180px] transition-transform hover:-translate-y-0.5 group relative cursor-pointer"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${t.color} 70%, transparent) 0%, color-mix(in srgb, ${t.color} 45%, transparent) 100%)`,
                borderColor: `color-mix(in srgb, ${t.color} 50%, transparent)`,
                boxShadow: `0 8px 24px -10px color-mix(in srgb, ${t.color} 60%, transparent)`,
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: `color-mix(in srgb, ${t.color} 80%, #fff 0%)`,
                    color: '#1f2937',
                  }}
                >
                  <Icon className="w-4 h-4" strokeWidth={2} />
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-800/70 dark:text-white/70">
                  Template
                </span>
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">{t.name}</h3>
              <p className="text-xs text-gray-800/75 dark:text-white/75 mt-1 mb-3">
                {t.description}
              </p>
              <ul className="mt-auto space-y-0.5">
                {t.columns.map((col) => (
                  <li
                    key={col.name}
                    className="text-[11px] text-gray-900/85 dark:text-white/80 flex items-center gap-1.5"
                  >
                    <span className="w-1 h-1 rounded-full bg-current opacity-60" />
                    {col.name}
                  </li>
                ))}
              </ul>
            </button>
          );
        })
      }

      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glass p-6 rounded-2xl flex flex-col items-center justify-center text-center min-h-[180px] hover:-translate-y-0.5 transition-transform group cursor-pointer border border-dashed border-foreground/20 dark:border-white/10"
      >
        <div className="w-14 h-14 bg-white/40 dark:bg-white/5 rounded-full flex items-center justify-center mb-3 border border-white/40 dark:border-white/10 group-hover:bg-white/60 dark:group-hover:bg-white/10 transition-colors">
          <svg className="w-7 h-7 text-foreground/60 dark:text-gray-300 group-hover:text-foreground dark:group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">
          {projects.length === 0 ? 'Start blank' : 'Add Project'}
        </h3>
        <p className="text-xs text-muted-foreground max-w-xs">
          {projects.length === 0
            ? 'Pick your own name, color, and columns.'
            : 'New board with custom-colored lists.'}
        </p>
      </button>

      <AddProjectModal open={open} onClose={() => setOpen(false)} onCreate={handleCreate} />
      {confirmDialog}
    </>
  );
}
