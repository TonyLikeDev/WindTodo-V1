"use client";

import { useState, useMemo } from 'react';
import useSWR from 'swr';
import { getProjectTasks } from '@/app/actions/taskActions';
import { 
  Clock, 
  Search, 
  Filter, 
  ChevronUp, 
  ChevronDown, 
  MoreVertical,
  Loader2,
  Calendar
} from 'lucide-react';

import { useTaskStore } from '@/store/taskStore';

export default function TableView({ projectId }: { projectId: string }) {
  const { openTask } = useTaskStore();
  const { data: tasks = [], isLoading } = useSWR(
    projectId ? `project-tasks:${projectId}` : null,
    () => getProjectTasks(projectId)
  );

  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState<string>("title");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];
    
    if (search) {
      result = result.filter(t => t.title.toLowerCase().includes(search.toLowerCase()));
    }

    result.sort((a: any, b: any) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'list') {
        valA = a.list?.name;
        valB = b.list?.name;
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return result;
  }, [tasks, search, sortField, sortOrder]);

  const toggleSort = (field: string) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
         <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-8 overflow-hidden">
      {/* Search & Filter Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="relative w-96 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground group-focus-within:text-primary transition-colors">
            <Search size={18} />
          </div>
          <input 
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search milestones..."
            className="w-full bg-white/40 border border-white/60 rounded-2xl pl-12 pr-4 py-3 text-sm font-bold text-foreground placeholder-muted-foreground/40 outline-none focus:ring-4 focus:ring-primary/10 transition-all shadow-sm"
          />
        </div>
        
        <button className="flex items-center gap-3 px-6 py-3 glass rounded-2xl text-xs font-black uppercase tracking-widest text-muted-foreground hover:bg-white hover:text-primary transition-all shadow-sm border border-white/60">
           <Filter size={16} />
           Filters
        </button>
      </div>

      {/* Table Container */}
      <div className="flex-1 glass rounded-[2.5rem] border-white/40 overflow-hidden shadow-xl shadow-sky-dark/5 flex flex-col">
        <div className="flex-1 overflow-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead className="sticky top-0 z-10">
              <tr className="bg-white/60 backdrop-blur-md border-b border-white/40">
                <SortableHeader label="Name" field="title" active={sortField === 'title'} order={sortOrder} onClick={toggleSort} />
                <SortableHeader label="Section" field="list" active={sortField === 'list'} order={sortOrder} onClick={toggleSort} />
                <SortableHeader label="Status" field="status" active={sortField === 'status'} order={sortOrder} onClick={toggleSort} />
                <SortableHeader label="Timeline" field="dueDate" active={sortField === 'dueDate'} order={sortOrder} onClick={toggleSort} />
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20">
              {filteredAndSortedTasks.map((task: any) => (
                <tr 
                  key={task.id} 
                  onClick={() => openTask(task.id)}
                  className="hover:bg-white/40 transition-all cursor-pointer group animate-in fade-in duration-300"
                >
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-2 h-8 rounded-full shadow-sm" style={{ backgroundColor: task.list?.color || '#ccc' }} />
                      <span className={`text-sm font-black text-foreground group-hover:text-primary transition-colors ${task.status === 'DONE' ? 'line-through text-muted-foreground opacity-50' : ''}`}>
                        {task.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1.5 rounded-xl border border-primary/10 uppercase tracking-[0.2em] shadow-inner">
                      {task.list?.name || 'Milestone'}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border ${
                      task.status === 'DONE' ? 'bg-green-500/10 text-green-600 border-green-500/10' : 
                      task.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-600 border-blue-500/10' : 
                      'bg-gray-500/10 text-gray-600 border-gray-500/10'
                    }`}>
                       <div className={`w-1.5 h-1.5 rounded-full ${
                         task.status === 'DONE' ? 'bg-green-500' : 
                         task.status === 'IN_PROGRESS' ? 'bg-blue-500' : 'bg-gray-500'
                       }`} />
                       {task.status.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    {task.dueDate ? (
                      <div className="flex items-center gap-2.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <Calendar size={14} className="text-primary/60" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-[9px] font-black text-muted-foreground/30 uppercase tracking-widest italic opacity-50">-</span>
                    )}
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <div className="flex -space-x-3">
                        {task.assignees && task.assignees.length > 0 ? (
                          task.assignees.slice(0, 2).map((u: any) => (
                            <div key={u.id} className="w-9 h-9 rounded-2xl bg-white flex items-center justify-center text-[11px] font-black text-primary border-4 border-white shadow-sm overflow-hidden transition-transform group-hover:scale-110">
                              {u.avatarUrl ? (
                                <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                              ) : u.name?.charAt(0).toUpperCase()}
                            </div>
                          ))
                        ) : (
                          <div className="w-9 h-9 rounded-2xl bg-black/5 flex items-center justify-center border-4 border-white">
                             <span className="text-[10px] font-black text-muted-foreground/30">?</span>
                          </div>
                        )}
                        {task.assignees && task.assignees.length > 2 && (
                          <div className="w-9 h-9 rounded-2xl bg-primary text-white flex items-center justify-center border-4 border-white text-[9px] font-black z-0">
                            +{task.assignees.length - 2}
                          </div>
                        )}
                      </div>
                      <span className="text-xs font-bold text-muted-foreground">
                        {task.assignees?.length > 0 
                          ? (task.assignees.length === 1 ? task.assignees[0].name : `${task.assignees.length} members`) 
                          : 'Open'}
                      </span>
                    </div>
                  </td>

                </tr>
              ))}
              {filteredAndSortedTasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                     <Search size={48} className="mx-auto text-muted-foreground/20 mb-4" />
                     <p className="text-sm font-black text-muted-foreground uppercase tracking-widest">No matching results found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function SortableHeader({ label, field, active, order, onClick }: any) {
  return (
    <th 
      onClick={() => onClick(field)}
      className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] cursor-pointer hover:bg-black/5 transition-all group"
    >
      <div className="flex items-center gap-2">
        {label}
        <div className={`transition-all ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-30'}`}>
          {active && order === 'desc' ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </div>
      </div>
    </th>
  );
}
