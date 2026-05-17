import StatsDashboard from '@/components/StatsDashboard';

export default function StatsPage() {
  return (
    <div className="max-w-none w-full py-6">
      <div className="flex flex-col mb-8">
        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">Analytics</h1>
        <p className="text-gray-400 text-sm">Deep insights into your productivity and team performance.</p>
      </div>
      <StatsDashboard />
    </div>
  );
}
