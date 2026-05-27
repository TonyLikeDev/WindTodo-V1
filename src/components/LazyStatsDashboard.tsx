'use client';

import dynamic from 'next/dynamic';

// Recharts is ~150KB — lazy-load so it doesn't block the initial dashboard render
const StatsDashboard = dynamic(() => import('./StatsDashboard'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass rounded-2xl h-28 animate-pulse" />
      ))}
    </div>
  ),
});

interface OverallStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
}

export default function LazyStatsDashboard({
  minimal,
  initialStats,
}: {
  minimal?: boolean;
  initialStats?: OverallStats | null;
}) {
  return <StatsDashboard minimal={minimal} initialStats={initialStats} />;
}
