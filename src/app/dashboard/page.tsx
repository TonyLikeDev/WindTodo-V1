import { Suspense } from 'react'
import { getProjects } from '@/app/actions/projectActions'
import { getTasks } from '@/app/actions/taskActions'
import { getOverallStats } from '@/app/actions/statsActions'
import { getAuthUser } from '@/app/actions/userActions'
import DashboardSWRProvider from '@/components/DashboardSWRProvider'
import LazyStatsDashboard from '@/components/LazyStatsDashboard'
import ProjectsSection from '@/components/ProjectsSection'
import TaskList from '@/components/TaskList'

// ─── Inline async server components ───────────────────────────────────────────
// Each one fetches only what it needs and streams in independently.
// getAuthUser and getProjects are wrapped in React cache() so parallel Suspense
// sections share one DB call per request, not one per section.

async function StatsLoader() {
  const stats = await getOverallStats(null)
  return <LazyStatsDashboard minimal initialStats={stats} />
}

async function ProjectsLoader() {
  const [projects, me] = await Promise.all([getProjects(), getAuthUser()])
  return (
    <DashboardSWRProvider fallback={{ projects, 'auth-user': me }}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <ProjectsSection />
      </div>
    </DashboardSWRProvider>
  )
}

async function TasksLoader() {
  // TaskList's virtual-list mode calls useSWR('projects') for the project picker,
  // so projects and auth-user must be in this fallback too.
  const [tasks, projects, me] = await Promise.all([
    getTasks('recent_assignments'),
    getProjects(),  // deduplicated by React cache() — no extra DB query
    getAuthUser(),  // deduplicated by React cache() — no extra DB query
  ])
  return (
    <DashboardSWRProvider fallback={{ recent_assignments: tasks, projects, 'auth-user': me }}>
      <TaskList
        title="Recent Assignments"
        listId="recent_assignments"
        placeholder="New quick task..."
      />
    </DashboardSWRProvider>
  )
}

// ─── Skeleton fallbacks ────────────────────────────────────────────────────────
// Sized to match the real components so layout doesn't shift when content streams in.

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="glass rounded-2xl h-28 animate-pulse" />
      <div className="glass rounded-2xl h-28 lg:col-span-2 animate-pulse" />
    </div>
  )
}

function ProjectsSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="glass rounded-2xl min-h-[180px] animate-pulse" />
      ))}
    </div>
  )
}

function TasksSkeleton() {
  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/40 shadow-xl shadow-sky-dark/10 flex flex-col min-h-[300px] animate-pulse">
      <div className="flex items-center justify-between mb-6">
        <div className="w-32 h-3 bg-white/20 rounded" />
        <div className="w-8 h-6 bg-white/20 rounded-full" />
      </div>
      <div className="space-y-3 flex-grow">
        <div className="w-full h-12 bg-white/10 rounded-xl" />
        <div className="w-full h-12 bg-white/10 rounded-xl" />
        <div className="w-full h-12 bg-white/10 rounded-xl" />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
// NOT async — the shell (headings, layout) streams to the browser immediately.
// Next.js only shows loading.tsx when the page function itself suspends, so by
// making the page non-async we skip that blocking skeleton entirely.
// Each section suspends independently and streams in as its data arrives.

export default function Dashboard() {
  return (
    // Outermost provider sets up the localStorage-backed SWR cache so return
    // visits render instantly from stored data, then silently revalidate.
    <DashboardSWRProvider provideCache>
      <div className="space-y-10 animate-in fade-in duration-1000">
        <section>
          <div className="flex flex-col mb-6">
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">
              Workspace Overview
            </h1>
            <p className="text-muted-foreground text-sm">
              Monitor your projects and team productivity in real-time.
            </p>
          </div>
          <Suspense fallback={<StatsSkeleton />}>
            <StatsLoader />
          </Suspense>
        </section>

        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground tracking-tight">Active Projects</h2>
          </div>
          <Suspense fallback={<ProjectsSkeleton />}>
            <ProjectsLoader />
          </Suspense>
        </section>

        <section>
          <Suspense fallback={<TasksSkeleton />}>
            <TasksLoader />
          </Suspense>
        </section>
      </div>
    </DashboardSWRProvider>
  )
}
