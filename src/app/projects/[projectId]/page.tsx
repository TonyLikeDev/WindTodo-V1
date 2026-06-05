import { Suspense } from 'react';
import ProjectViewSwitcher from '@/components/ProjectViewSwitcher';
import DashboardSWRProvider from '@/components/DashboardSWRProvider';
import { getProjectBoardData } from '@/app/actions/projectActions';

// Server component: the layout chrome streams instantly while BoardLoader
// fetches the whole board in ONE round trip and seeds the SWR cache, so the
// client board renders with data — no post-hydration fetch waterfall.
export default function ProjectPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  return (
    <Suspense fallback={<BoardSkeleton />}>
      <BoardLoader params={params} />
    </Suspense>
  );
}

async function BoardLoader({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const data = await getProjectBoardData(projectId);

  // Seed the SWR cache under the exact keys ProjectBoard/BoardColumn already use:
  //   'projects', 'auth-user', `board:${projectId}` (lists), and one entry per
  //   listId (that column's tasks). Client components then render from cache.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const fallback: Record<string, any> = {};
  if (data) {
    fallback['projects'] = data.projects;
    fallback['auth-user'] = data.authUser;
    fallback[`board:${projectId}`] = data.lists;
    for (const [listId, tasks] of Object.entries(data.tasksByListId)) {
      fallback[listId] = tasks;
    }
  }

  return (
    <DashboardSWRProvider provideCache fallback={fallback}>
      <ProjectViewSwitcher projectId={projectId} />
    </DashboardSWRProvider>
  );
}

function BoardSkeleton() {
  return (
    <div className="flex gap-6 p-8 h-full overflow-hidden">
      {[...Array(4)].map((_, i) => (
        <div
          key={i}
          className="w-72 flex-shrink-0 h-96 glass rounded-2xl animate-pulse"
        />
      ))}
    </div>
  );
}
