'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { Map, Columns3, List, LayoutGrid } from 'lucide-react';
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
    <div className="pointer-events-none absolute bottom-6 left-0 right-0 flex justify-center z-30">
      <div className="pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full border border-border shadow-xl shadow-sky-dark/20 p-1">
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
        className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-white/90 backdrop-blur-md border shadow-xl shadow-sky-dark/20 transition-colors ${
          open
            ? 'border-primary text-primary'
            : 'border-border text-foreground hover:text-primary'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        <span>Switch boards</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 right-0 w-64 max-h-80 overflow-y-auto custom-scrollbar bg-white/95 backdrop-blur-md rounded-2xl border border-border shadow-2xl shadow-sky-dark/30 p-2 z-40">
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
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-foreground hover:bg-primary/10 transition-colors text-left"
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

