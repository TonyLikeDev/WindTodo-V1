'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Map, Columns3, List, LayoutGrid, X } from 'lucide-react';
import ProjectBoard from './ProjectBoard';
import ProjectTipsBubble from './ProjectTipsBubble';
import RoadmapView from './RoadmapView';
import BacklogView from './BacklogView';
import { getProjects } from '@/app/actions/projectActions';

type ViewMode = 'roadmap' | 'kanban' | 'backlog';

const VIEW_OPTIONS: { id: ViewMode; label: string; Icon: typeof Map }[] = [
  { id: 'roadmap', label: 'Roadmap', Icon: Map },
  { id: 'kanban',  label: 'Kanban',  Icon: Columns3 },
  { id: 'backlog', label: 'Backlog', Icon: List },
];

export default function ProjectViewSwitcher({ projectId }: { projectId: string }) {
  const [view, setView] = useState<ViewMode>('kanban');

  return (
    <div className="relative h-full w-full">
      {view === 'kanban' && <ProjectBoard projectId={projectId} />}
      {view === 'roadmap' && <RoadmapView projectId={projectId} />}
      {view === 'backlog' && <BacklogView projectId={projectId} />}

      <BottomPillBar view={view} onChangeView={setView} projectId={projectId} />
      <MobileFloatingMenu view={view} onChangeView={setView} projectId={projectId} />
      <ProjectTipsBubble />
    </div>
  );
}

function BottomPillBar({
  view,
  onChangeView,
  projectId,
}: {
  view: ViewMode;
  onChangeView: (v: ViewMode) => void;
  projectId: string;
}) {
  return (
    <div className="pointer-events-none absolute bottom-6 left-0 right-0 hidden md:flex justify-center z-30">
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/90 dark:bg-slate-950/80 backdrop-blur-md rounded-full border border-white/20 dark:border-white/5 shadow-xl dark:shadow-black/50 p-1">
          {VIEW_OPTIONS.map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => onChangeView(id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  active
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
                {active && (
                  <span className="absolute left-1/2 -translate-x-1/2 bottom-1 w-6 h-[2px] rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>
        <SwitchBoardsPill currentProjectId={projectId} />
      </div>
    </div>
  );
}

function MobileFloatingMenu({
  view,
  onChangeView,
  projectId,
}: {
  view: ViewMode;
  onChangeView: (v: ViewMode) => void;
  projectId: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [boardsOpen, setBoardsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { data: projects = [] } = useSWR(boardsOpen ? 'projects' : null, getProjects, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  useEffect(() => {
    if (!open && !boardsOpen) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setBoardsOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        setBoardsOpen(false);
      }
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, boardsOpen]);

  const others = projects.filter((p) => p.id !== projectId);
  const ActiveIcon = VIEW_OPTIONS.find((o) => o.id === view)?.Icon ?? LayoutGrid;

  return (
    <div
      ref={wrapperRef}
      className="md:hidden fixed right-6 bottom-20 z-40 flex flex-col items-end pointer-events-none"
    >
      {open && boardsOpen && (
        <div className="mb-2 w-60 max-h-72 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl dark:shadow-black/55 p-2 pointer-events-auto">
          {others.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No other projects yet.
            </div>
          ) : (
            others.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setBoardsOpen(false);
                  setOpen(false);
                  router.push(`/projects/${p.id}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-left"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            ))
          )}
        </div>
      )}

      {open && !boardsOpen && (
        <div className="mb-2 flex flex-col items-end gap-2 pointer-events-auto">
          {VIEW_OPTIONS.map(({ id, label, Icon }) => {
            const active = view === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onChangeView(id);
                  setOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border shadow-xl dark:shadow-black/50 transition-colors ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-white/20 dark:border-white/5 text-foreground hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => setBoardsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border border-white/20 dark:border-white/5 shadow-xl dark:shadow-black/50 text-foreground hover:text-primary transition-colors"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Switch boards</span>
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={() => {
          if (open) {
            setOpen(false);
            setBoardsOpen(false);
          } else {
            setOpen(true);
          }
        }}
        aria-label={open ? 'Close view menu' : 'Open view menu'}
        className={`w-11 h-11 rounded-full bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border shadow-xl dark:shadow-black/50 flex items-center justify-center transition-colors pointer-events-auto ${
          open
            ? 'border-primary text-primary'
            : 'border-white/20 dark:border-white/5 text-foreground hover:text-primary'
        }`}
      >
        {open ? <X className="w-5 h-5" /> : <ActiveIcon className="w-5 h-5" />}
      </button>
    </div>
  );
}

function SwitchBoardsPill({ currentProjectId }: { currentProjectId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const { data: projects = [] } = useSWR(open ? 'projects' : null, getProjects, {
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const others = projects.filter((p) => p.id !== currentProjectId);

  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/90 dark:bg-slate-950/80 backdrop-blur-md border shadow-xl dark:shadow-black/50 transition-colors ${
          open
            ? 'border-primary text-primary'
            : 'border-white/20 dark:border-white/5 text-foreground hover:text-primary'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Switch boards</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-64 max-h-80 overflow-y-auto custom-scrollbar bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/5 shadow-2xl dark:shadow-black/55 p-2 z-40">
          {others.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground text-center">
              No other projects yet.
            </div>
          ) : (
            others.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setOpen(false);
                  router.push(`/projects/${p.id}`);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 dark:hover:bg-primary/20 transition-colors text-left"
              >
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: p.color }}
                />
                <span className="truncate">{p.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

