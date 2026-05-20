import StatsDashboard from '@/components/StatsDashboard';

export default function StatsPage() {
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight mb-2">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep insights into your productivity and team performance.</p>
      </div>
      <StatsDashboard />
    </div>
  );
}
