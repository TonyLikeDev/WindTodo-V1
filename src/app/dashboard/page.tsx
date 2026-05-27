import { getProjects } from '@/app/actions/projectActions';
import { getTasks } from '@/app/actions/taskActions';
import { getOverallStats } from '@/app/actions/statsActions';
import { getAuthUser } from '@/app/actions/userActions';
import DashboardSWRProvider from '@/components/DashboardSWRProvider';
import LazyStatsDashboard from '@/components/LazyStatsDashboard';
import ProjectsSection from '@/components/ProjectsSection';
import TaskList from '@/components/TaskList';

export default async function Dashboard() {
  // Fetch everything in parallel on the server — one round-trip to Neon,
  // data is ready before the HTML even reaches the browser.
  const [projects, recentTasks, overallStats, me] = await Promise.all([
    getProjects(),
    getTasks('recent_assignments'),
    getOverallStats(null),
    getAuthUser(),
  ]);

  return (
    // Inject server-fetched data into SWR's cache so child components render
    // immediately with real data instead of showing loading skeletons.
    <DashboardSWRProvider
      fallback={{
        projects,
        recent_assignments: recentTasks,
        'auth-user': me,
      }}
    >
      <div className="space-y-10 animate-in fade-in duration-1000">
        <section>
          <div className="flex flex-col mb-6">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Workspace Overview</h1>
            <p className="text-muted-foreground text-sm">Monitor your projects and team productivity in real-time.</p>
          </div>
          <LazyStatsDashboard minimal initialStats={overallStats} />
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Active Projects</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ProjectsSection />
          </div>
        </section>

        <section>
          <TaskList
            title="Recent Assignments"
            listId="recent_assignments"
            placeholder="New quick task..."
          />
        </section>
      </div>
    </DashboardSWRProvider>
  );
}
