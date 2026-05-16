"use client";

import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  Users, CheckCircle, Clock, AlertCircle,
  BarChart2, PieChart as PieChartIcon, Trophy, Target, Layers,
  Search, Filter, Sparkles
} from 'lucide-react';
import { getOverallStats, getProjectStats } from '@/app/actions/statsActions';
import { getProjects } from '@/app/actions/projectActions';
import GlassCard from './GlassCard';

// ─── Colour palette ────────────────────────────────────────────────────────────
const STATUS_COLORS = { done: '#22c55e', inProgress: '#3b82f6', todo: '#64748b' };
const AVATAR_PALETTE = ['#0ea5e9', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'];

// ─── Types ─────────────────────────────────────────────────────────────────────
interface OverallStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
}

interface ProjectData {
  id: string;
  name: string;
  color: string;
}

interface ProjectBreakdown {
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  unassignedCount: number;
  userStats: MemberStats[];
}

interface MemberStats {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  completionPct: number;
  contributionPct: number;
}

// ─── Custom tooltip ─────────────────────────────────────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass bg-white/80 backdrop-blur-xl border border-white/60 rounded-2xl p-4 text-xs shadow-2xl animate-in zoom-in-95 duration-200">
      <p className="text-foreground font-black mb-2 uppercase tracking-widest text-[10px]">{label || payload[0].name}</p>
      {payload.map((p: any) => (
        <div key={p.name} className="flex items-center justify-between gap-6 py-1 border-t border-black/5 first:border-none">
           <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.fill }} />
              <span className="font-bold text-muted-foreground">{p.name}</span>
           </div>
           <span className="font-black text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Circular progress ring ─────────────────────────────────────────────────────
function RingProgress({ pct, color, size = 80 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} strokeWidth={6} stroke="rgba(0,0,0,0.05)" fill="none" />
      <circle
        cx={size / 2} cy={size / 2} r={r} strokeWidth={6}
        stroke={color} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </svg>
  );
}

// ─── Member card ────────────────────────────────────────────────────────────────
function MemberCard({ u, rank }: { u: MemberStats; rank: number }) {
  const avatarBg = AVATAR_PALETTE[(rank - 1) % AVATAR_PALETTE.length];
  const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;

  return (
    <div className="glass rounded-[2.5rem] p-6 border-white/40 flex flex-col gap-6 hover:bg-white/60 transition-all duration-500 group relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
      
      {/* Header */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="relative flex-shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center border border-white shadow-lg overflow-hidden group-hover:scale-110 transition-transform duration-500">
             {u.avatarUrl ? (
                <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
             ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-black text-xl" style={{ backgroundColor: avatarBg }}>
                   {u.name.charAt(0).toUpperCase()}
                </div>
             )}
          </div>
          {medal && <span className="absolute -top-2 -right-2 text-xl filter drop-shadow-md animate-bounce">{medal}</span>}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-black text-foreground truncate tracking-tight">{u.name}</p>
          <p className="text-[10px] font-bold text-muted-foreground truncate uppercase tracking-widest opacity-50">{u.email}</p>
        </div>

        {/* Completion ring */}
        <div className="relative flex-shrink-0 flex items-center justify-center">
          <RingProgress pct={u.completionPct} color={STATUS_COLORS.done} size={56} />
          <span className="absolute text-[10px] font-black text-primary rotate-90">{u.completionPct}%</span>
        </div>
      </div>

      {/* Stats chips */}
      <div className="grid grid-cols-3 gap-3 relative z-10">
        <StatChip label="To Do" value={u.todo} color="gray" />
        <StatChip label="Active" value={u.inProgress} color="blue" />
        <StatChip label="Done" value={u.completed} color="green" />
      </div>

      {/* Multi-segment progress bar */}
      <div className="space-y-3 relative z-10">
          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-[0.2em]">
            <span className="text-muted-foreground">{u.total} Tasks Assigned</span>
            <span className="text-primary">{u.contributionPct}% Workspace share</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden bg-black/5 flex p-0.5 border border-white/20">
            {u.total > 0 ? (
              <>
                <div className="h-full rounded-full bg-green-500 shadow-sm" style={{ width: `${(u.completed / u.total) * 100}%` }} />
                <div className="h-full rounded-full bg-blue-500 shadow-sm mx-0.5" style={{ width: `${(u.inProgress / u.total) * 100}%` }} />
                <div className="h-full rounded-full bg-gray-400 shadow-sm" style={{ width: `${(u.todo / u.total) * 100}%` }} />
              </>
            ) : (
              <div className="h-full w-full bg-black/5" />
            )}
          </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, color }: { label: string, value: number, color: 'gray' | 'blue' | 'green' }) {
  const styles = {
    gray: 'bg-black/5 text-muted-foreground border-black/5',
    blue: 'bg-primary/10 text-primary border-primary/10',
    green: 'bg-green-500/10 text-green-600 border-green-500/10'
  };
  return (
    <div className={`flex flex-col items-center py-2.5 rounded-2xl border transition-all ${styles[color]}`}>
      <span className="text-[8px] font-black uppercase tracking-widest mb-0.5 opacity-60">{label}</span>
      <span className="text-lg font-black">{value}</span>
    </div>
  );
}

// ─── Main dashboard ─────────────────────────────────────────────────────────────
export default function StatsDashboard() {
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [projectStats, setProjectStats] = useState<ProjectBreakdown | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      const [overallData, projectsData] = await Promise.all([
        getOverallStats(),
        getProjects()
      ]);
      setOverall(overallData);
      setProjects(projectsData);
      if (projectsData.length > 0) setSelectedProjectId(projectsData[0].id);
      setLoading(false);
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    getProjectStats(selectedProjectId).then(data => setProjectStats(data));
  }, [selectedProjectId]);

  if (loading) {
    return (
      <div className="h-96 flex flex-col items-center justify-center gap-4 text-muted-foreground">
        <Loader2 className="animate-spin text-primary" size={48} />
        <p className="text-sm font-black uppercase tracking-widest animate-pulse">Analyzing Sky Performance...</p>
      </div>
    );
  }

  const projectPieData = projectStats ? [
    { name: 'Done',        value: projectStats.completedTasks,  fill: STATUS_COLORS.done },
    { name: 'In Progress', value: projectStats.inProgressTasks, fill: STATUS_COLORS.inProgress },
    { name: 'To Do',       value: projectStats.todoTasks,       fill: STATUS_COLORS.todo },
  ].filter(d => d.value > 0) : [];

  const memberContributionData = projectStats?.userStats?.map((u, i) => ({
    name: u.name,
    value: u.completed, // Measuring progress by completed tasks
    fill: AVATAR_PALETTE[i % AVATAR_PALETTE.length]
  })).filter(d => d.value > 0) || [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 pb-20">

      {/* KPI Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard title="Active Workspaces" value={overall?.totalProjects ?? 0} icon={<Layers size={24} />} color="blue" />
        <KpiCard title="Total Milestones" value={overall?.totalTasks ?? 0} icon={<Target size={24} />} color="purple" />
        <KpiCard title="Underway" value={overall?.inProgressTasks ?? 0} icon={<Clock size={24} />} color="orange" />
        <KpiCard title="Victory" value={overall?.completedTasks ?? 0} icon={<CheckCircle size={24} />} color="green" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Project Task Breakdown Pie */}
        <div className="glass rounded-[3rem] p-10 border-white/60 bg-white/40 shadow-xl shadow-sky-dark/5 flex flex-col">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Project Health</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Status distribution</p>
             </div>
             <select
                value={selectedProjectId}
                onChange={e => setSelectedProjectId(e.target.value)}
                className="bg-white/60 border border-white/60 rounded-2xl text-[10px] font-black uppercase tracking-widest px-4 py-2 text-primary focus:ring-4 focus:ring-primary/10 transition-all outline-none"
              >
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
          </div>

          <div className="flex-1 flex flex-col xl:flex-row items-center gap-10">
             <div className="relative w-56 h-56 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={projectPieData} innerRadius={70} outerRadius={90} dataKey="value" paddingAngle={8} stroke="none">
                      {projectPieData.map((d, i) => <Cell key={i} fill={d.fill} className="hover:opacity-80 transition-opacity" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-black text-primary">
                    {projectStats && projectStats.totalTasks > 0 ? Math.round((projectStats.completedTasks / projectStats.totalTasks) * 100) : 0}%
                  </span>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mt-1">Completed</span>
                </div>
             </div>
             <div className="flex-1 w-full space-y-4">
                {projectPieData.map(d => (
                  <div key={d.name} className="flex items-center justify-between p-4 bg-white/40 rounded-2xl border border-white/60 shadow-sm">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: d.fill }} />
                        <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{d.name}</span>
                     </div>
                     <span className="text-base font-black text-foreground">{d.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </div>

        {/* Member Progress Evaluation Pie */}
        <div className="glass rounded-[3rem] p-10 border-white/60 bg-white/40 shadow-xl shadow-sky-dark/5 flex flex-col">
          <div className="flex items-center justify-between mb-10">
             <div>
                <h3 className="text-xl font-black text-foreground tracking-tight">Member Efficiency</h3>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Task completion share</p>
             </div>
             <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                <Trophy size={20} />
             </div>
          </div>

          <div className="flex-1 flex flex-col xl:flex-row items-center gap-10">
             <div className="relative w-56 h-56 flex-shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie 
                      data={memberContributionData} 
                      innerRadius={0} 
                      outerRadius={90} 
                      dataKey="value" 
                      paddingAngle={2}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {memberContributionData.map((d, i) => <Cell key={i} fill={d.fill} className="hover:scale-105 transition-transform duration-500" />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {memberContributionData.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-center p-8">
                     <p className="text-[10px] font-black text-muted-foreground uppercase leading-relaxed">No completed tasks yet</p>
                  </div>
                )}
             </div>
             <div className="flex-1 w-full space-y-3">
                {memberContributionData.length > 0 ? memberContributionData.slice(0, 4).map(d => (
                  <div key={d.name} className="flex items-center justify-between p-3.5 bg-white/40 rounded-2xl border border-white/60 shadow-sm hover:scale-102 transition-all">
                     <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.fill }} />
                        <span className="text-[11px] font-bold text-foreground truncate max-w-[100px]">{d.name}</span>
                     </div>
                     <span className="text-[11px] font-black text-primary bg-primary/10 px-3 py-1 rounded-xl">
                        {Math.round((d.value / (projectStats?.completedTasks || 1)) * 100)}%
                     </span>
                  </div>
                )) : (
                  <div className="p-10 text-center glass rounded-[2rem] border-dashed border-white/40">
                     <Users size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                     <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Awaiting Results</p>
                  </div>
                )}
             </div>
          </div>
        </div>

      </div>

      {/* Team Leaderboard */}
      <div className="space-y-8">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-4">
                <div className="p-3 bg-white/60 rounded-2xl shadow-sm border border-white">
                   <Users size={24} className="text-primary" />
                </div>
                <div>
                   <h3 className="text-2xl font-black text-foreground tracking-tight">Performance Ranking</h3>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1">Based on milestone completion</p>
                </div>
             </div>
             <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-2xl text-primary text-[10px] font-black uppercase tracking-widest">
                <Sparkles size={14} />
                Real-time Sync
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {projectStats?.userStats.map((u, i) => (
              <MemberCard key={u.id} u={u} rank={i + 1} />
            ))}
          </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  const colorStyles: any = {
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/10',
    purple: 'text-purple-500 bg-purple-500/10 border-purple-500/10',
    orange: 'text-orange-500 bg-orange-500/10 border-orange-500/10',
    green: 'text-green-500 bg-green-500/10 border-green-500/10'
  };
  return (
    <div className="glass rounded-[2.5rem] p-8 border-white/40 bg-white/40 shadow-xl shadow-sky-dark/5 hover:translate-y-[-4px] transition-all duration-500 group">
       <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm border ${colorStyles[color]}`}>
          {icon}
       </div>
       <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">{title}</p>
       <p className="text-4xl font-black text-foreground group-hover:scale-105 transition-transform duration-500 origin-left">{value}</p>
    </div>
  );
}

function Loader2({ size, className }: { size?: number, className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width={size || 24} 
      height={size || 24} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={`animate-spin ${className}`}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}
