"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  UserPlus, 
  Trash2, 
  Plus, 
  X, 
  Sparkles, 
  Award,
  Search,
  Star,
  CheckCircle2,
  TrendingUp,
  UserCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'Online' | 'Offline' | 'Away';
  avatar: string;
  tasksCompleted: number;
  tasksTotal: number;
  rating: number; // performance rating out of 100
  evaluation: string;
  joinedDate: string;
}

const DEFAULT_MEMBERS: Member[] = [
  { 
    id: 'm-1', 
    name: 'Tony Stark', 
    email: 'tony@starkindustries.com',
    role: 'Nhà phát triển chính (Lead Dev)', 
    status: 'Online', 
    avatar: 'TS',
    tasksCompleted: 14,
    tasksTotal: 15,
    rating: 95,
    evaluation: 'Xuất sắc • Vượt tiến độ',
    joinedDate: '2026-01-10'
  },
  { 
    id: 'm-2', 
    name: 'Steve Rogers', 
    email: 'steve@shield.gov',
    role: 'Trưởng nhóm Dự án (Team Lead)', 
    status: 'Away', 
    avatar: 'SR',
    tasksCompleted: 9,
    tasksTotal: 10,
    rating: 90,
    evaluation: 'Xuất sắc • Đúng tiến độ',
    joinedDate: '2026-01-15'
  },
  { 
    id: 'm-3', 
    name: 'Natasha Romanoff', 
    email: 'natasha@shield.gov',
    role: 'Quản trị viên (Admin)', 
    status: 'Online', 
    avatar: 'NR',
    tasksCompleted: 8,
    tasksTotal: 12,
    rating: 75,
    evaluation: 'Tốt • Đúng tiến độ',
    joinedDate: '2026-02-01'
  },
  { 
    id: 'm-4', 
    name: 'Bruce Banner', 
    email: 'bruce@starklabs.com',
    role: 'Kỹ sư AI & Data (AI Engineer)', 
    status: 'Offline', 
    avatar: 'BB',
    tasksCompleted: 3,
    tasksTotal: 8,
    rating: 45,
    evaluation: 'Cần cố gắng • Trễ hạn',
    joinedDate: '2026-03-20'
  }
];

export default function UsersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // Form states
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("Developer");
  const [newStatus, setNewStatus] = useState<'Online' | 'Offline' | 'Away'>("Online");
  const [newCompleted, setNewCompleted] = useState(0);
  const [newTotal, setNewTotal] = useState(5);
  const [newRating, setNewRating] = useState(80);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem('sky-todo-members');
    if (stored) {
      setMembers(JSON.parse(stored));
    } else {
      setMembers(DEFAULT_MEMBERS);
      localStorage.setItem('sky-todo-members', JSON.stringify(DEFAULT_MEMBERS));
    }
  }, []);

  const saveMembersList = (updatedList: Member[]) => {
    setMembers(updatedList);
    localStorage.setItem('sky-todo-members', JSON.stringify(updatedList));
  };

  const handleAddMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) return;

    // Calculate rating evaluation
    let evalStr = 'Khá • Đúng tiến độ';
    const percent = Math.round((newCompleted / newTotal) * 100) || 0;
    if (newRating >= 90) evalStr = 'Xuất sắc • Vượt tiến độ';
    else if (newRating >= 75) evalStr = 'Tốt • Đúng tiến độ';
    else if (newRating >= 50) evalStr = 'Trung bình • Cần cố gắng';
    else evalStr = 'Cần cải thiện • Trễ hạn';

    const newMember: Member = {
      id: `m-${Date.now()}`,
      name: newName,
      email: newEmail,
      role: newRole,
      status: newStatus,
      avatar: newName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
      tasksCompleted: Number(newCompleted),
      tasksTotal: Number(newTotal),
      rating: Number(newRating),
      evaluation: evalStr,
      joinedDate: new Date().toISOString().split('T')[0]
    };

    const newList = [...members, newMember];
    saveMembersList(newList);

    // Reset Form
    setNewName("");
    setNewEmail("");
    setNewRole("Developer");
    setNewStatus("Online");
    setNewCompleted(0);
    setNewTotal(5);
    setNewRating(80);
    setIsAddModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    if (confirm("Bạn có chắc chắn muốn xóa thành viên này ra khỏi dự án?")) {
      const newList = members.filter(m => m.id !== id);
      saveMembersList(newList);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStarRating = (rating: number) => {
    const stars = Math.round(rating / 20);
    return Array.from({ length: 5 }).map((_, i) => (
      <Star 
        key={i} 
        size={12} 
        className={i < stars ? "text-amber-400 fill-amber-400" : "text-white/20"} 
      />
    ));
  };

  const getRatingBadgeClass = (rating: number) => {
    if (rating >= 90) return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
    if (rating >= 75) return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
    if (rating >= 50) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    return 'bg-red-500/20 text-red-300 border-red-500/30';
  };

  const getRatingBarClass = (rating: number) => {
    if (rating >= 90) return 'from-purple-500 to-indigo-500';
    if (rating >= 75) return 'from-emerald-500 to-teal-500';
    if (rating >= 50) return 'from-amber-500 to-orange-500';
    return 'from-red-500 to-rose-500';
  };

  if (!isMounted) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 p-2 relative z-10">
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-primary/10 rounded-3xl text-primary border border-primary/20 shadow-md">
            <Users size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
              Quản lý Thành viên
              <span className="text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                {members.length} Nhân sự
              </span>
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5 font-bold uppercase tracking-wider opacity-60">Theo dõi, đánh giá tiến độ và hiệu suất công việc của đội ngũ</p>
          </div>
        </div>

        {/* Actions Section */}
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search bar */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-3 text-muted-foreground/50" size={16} />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm thành viên, vai trò..."
              className="w-full bg-white/40 border border-white/60 rounded-2xl pl-11 pr-4 py-2.5 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner placeholder-muted-foreground/60"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto bg-primary text-white px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer border border-primary/30"
          >
            <UserPlus size={16} />
            Thêm thành viên
          </button>
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-[2rem] border-white/40 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-400 border border-purple-500/20">
            <Award size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hiệu suất Xuất sắc</p>
            <h3 className="text-xl font-black text-white mt-1">{members.filter(m => m.rating >= 90).length} Thành viên</h3>
          </div>
        </div>

        <div className="glass p-6 rounded-[2rem] border-white/40 flex items-center gap-4 shadow-xl">
          <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Nhiệm vụ đã hoàn thành</p>
            <h3 className="text-xl font-black text-white mt-1">
              {members.reduce((acc, m) => acc + m.tasksCompleted, 0)}/{members.reduce((acc, m) => acc + m.tasksTotal, 0)} Tasks
            </h3>
          </div>
        </div>

        <div className="glass p-6 rounded-[2rem] border-white/40 flex items-center gap-4 shadow-xl sm:col-span-2 lg:col-span-1">
          <div className="p-3 bg-primary/10 rounded-2xl text-primary border border-primary/20">
            <TrendingUp size={20} />
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Hiệu suất trung bình</p>
            <h3 className="text-xl font-black text-white mt-1">
              {members.length > 0 ? Math.round(members.reduce((acc, m) => acc + m.rating, 0) / members.length) : 0}%
            </h3>
          </div>
        </div>
      </div>

      {/* Main Members Table Panel */}
      <div className="glass overflow-hidden rounded-[3rem] border-white/40 shadow-2xl relative">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/40 border-b border-white/40">
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Thành viên</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Vai trò / Email</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">Trạng thái</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] min-w-[200px]">Tiến độ công việc</th>
                <th className="px-6 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] min-w-[180px]">Đánh giá tiến độ (Hiệu suất)</th>
                <th className="px-8 py-5 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/20 bg-white/10">
              {filteredMembers.length > 0 ? (
                filteredMembers.map((user) => (
                  <tr key={user.id} className="hover:bg-white/30 transition-colors group">
                    {/* Avatar & Name */}
                    <td className="px-8 py-5 whitespace-nowrap">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/80 to-sky-blue/80 flex items-center justify-center text-xs font-black text-white border border-white/40 shadow-md">
                            {user.avatar}
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm ${
                            user.status === 'Online' ? 'bg-green-500' : 
                            user.status === 'Away' ? 'bg-yellow-500' : 
                            'bg-gray-400'
                          }`} />
                        </div>
                        <div>
                          <span className="text-sm font-black text-foreground block">{user.name}</span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">Gia nhập: {user.joinedDate}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role & Email */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className="text-xs font-black text-foreground block">{user.role}</span>
                      <span className="text-[10px] font-medium text-muted-foreground opacity-80 block">{user.email}</span>
                    </td>

                    {/* Online status badge */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                        user.status === 'Online' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                        user.status === 'Away' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20' : 
                        'bg-gray-500/10 text-gray-500 border-gray-500/20'
                      }`}>
                        {user.status}
                      </span>
                    </td>

                    {/* Task Progress Bar */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="w-full max-w-[200px] space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] font-bold">
                          <span className="text-muted-foreground/80">Hoàn thành</span>
                          <span className="text-foreground">{user.tasksCompleted}/{user.tasksTotal} Tasks</span>
                        </div>
                        <div className="w-full h-2.5 bg-white/40 rounded-full overflow-hidden border border-white/60 p-0.5 shadow-inner">
                          <div 
                            className="h-full rounded-full bg-gradient-to-r from-primary to-sky-blue transition-all duration-500"
                            style={{ width: `${Math.round((user.tasksCompleted / user.tasksTotal) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Performance Rating / Score */}
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className={`px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${getRatingBadgeClass(user.rating)}`}>
                            {user.rating}%
                          </span>
                          <div className="flex gap-0.5">
                            {getStarRating(user.rating)}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground/80 block">{user.evaluation}</span>
                      </div>
                    </td>

                    {/* Action buttons */}
                    <td className="px-8 py-5 whitespace-nowrap text-right">
                      <button 
                        onClick={() => handleDeleteMember(user.id)}
                        className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-muted-foreground/40 cursor-pointer"
                        title="Xóa thành viên"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-8 py-16 text-center">
                    <Users size={48} className="mx-auto text-muted-foreground/30 mb-4 animate-pulse" />
                    <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Không tìm thấy thành viên nào</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Member Glassmorphic Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Backdrop filter overlay */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-md"
            />

            {/* Modal Dialog */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="glass relative w-full max-w-lg bg-white/80 rounded-[3.5rem] shadow-2xl border border-white/60 overflow-hidden z-10 flex flex-col p-8 md:p-10"
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-primary/10 rounded-2xl text-primary border border-primary/20 shadow-sm">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-foreground uppercase tracking-wider">Thêm Nhân Sự Mới</h3>
                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-0.5 opacity-60">Gia nhập nhóm và phân bổ chỉ tiêu</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-2.5 bg-white/40 hover:bg-white border border-white/60 rounded-xl text-muted-foreground hover:text-foreground transition-all cursor-pointer shadow-sm"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleAddMember} className="space-y-6">
                {/* Họ tên */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Họ và Tên</label>
                  <input 
                    required
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder="Ví dụ: Quang Trần"
                    className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Địa chỉ Email</label>
                  <input 
                    required
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="example@windtodo.com"
                    className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                  />
                </div>

                {/* Role & Status Row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vai trò */}
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Vai trò</label>
                    <select
                      value={newRole}
                      onChange={(e) => setNewRole(e.target.value)}
                      className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner cursor-pointer"
                    >
                      <option value="Lead Developer">Lead Developer</option>
                      <option value="Developer">Developer</option>
                      <option value="UI/UX Designer">UI/UX Designer</option>
                      <option value="Product Manager">Product Manager</option>
                      <option value="QA Tester">QA Tester</option>
                    </select>
                  </div>

                  {/* Trạng thái */}
                  <div>
                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Trạng thái đầu tiên</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as any)}
                      className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner cursor-pointer"
                    >
                      <option value="Online">Online</option>
                      <option value="Away">Away</option>
                      <option value="Offline">Offline</option>
                    </select>
                  </div>
                </div>

                {/* Tasks & Rating Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Hoàn thành */}
                  <div>
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Tasks đã xong</label>
                    <input 
                      type="number"
                      min={0}
                      value={newCompleted}
                      onChange={(e) => setNewCompleted(Math.max(0, Number(e.target.value)))}
                      className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>

                  {/* Tổng cộng */}
                  <div>
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Tổng Tasks được giao</label>
                    <input 
                      type="number"
                      min={1}
                      value={newTotal}
                      onChange={(e) => setNewTotal(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>

                  {/* Hiệu suất (%) */}
                  <div>
                    <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-2 block">Đánh giá hiệu suất (%)</label>
                    <input 
                      type="number"
                      min={0}
                      max={100}
                      value={newRating}
                      onChange={(e) => setNewRating(Math.max(0, Math.min(100, Number(e.target.value))))}
                      className="w-full bg-white/40 border border-white/60 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Footer Submit */}
                <button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/95 text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all cursor-pointer mt-4 flex items-center justify-center gap-2 border border-primary/30"
                >
                  <Plus size={16} />
                  Hoàn tất thêm mới
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
