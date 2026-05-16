"use client";

import useSWR from "swr";
import { syncUser } from "@/app/actions/userActions";
import Image from "next/image";
import { Edit2, LogOut, Trophy, Target, Star, Heart } from "lucide-react";

export default function UserTab() {
  const { data: user, isLoading } = useSWR("currentUser", syncUser);

  if (isLoading) return <div className="p-20 text-center animate-pulse">Loading profile...</div>;
  if (!user) return <div className="p-20 text-center">User not found</div>;

  const stats = {
    completionRate: 85, // Placeholder for now, could be fetched from statsActions
    level: 42,
    xp: 2500,
    nextLevelXp: 3000
  };

  return (
    <div className="max-w-4xl mx-auto p-4 animate-in fade-in zoom-in duration-500">
      <div className="cake-card bg-white p-12 flex flex-col md:flex-row items-center md:items-start gap-12">
        {/* Avatar Area */}
        <div className="relative">
          <div className="w-56 h-56 rounded-full border-[10px] border-[#FFF5F8] overflow-hidden shadow-2xl shadow-pink-100 flex items-center justify-center bg-muted text-4xl font-black text-primary">
            {user.avatarUrl ? (
              <Image 
                src={user.avatarUrl} 
                alt={user.name || ''} 
                width={224} 
                height={224} 
                className="object-cover scale-110"
              />
            ) : (user.name || user.email).charAt(0).toUpperCase()}
          </div>
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-[#FF4D94] to-[#E6005C] w-16 h-16 rounded-3xl flex items-center justify-center shadow-lg shadow-pink-200 border-4 border-white">
            <Heart className="text-white fill-current" size={28} />
          </div>
        </div>

        {/* Info Area */}
        <div className="flex-grow w-full space-y-8">
          <div className="text-center md:text-left">
            <h1 className="text-5xl font-black text-[#E6005C] tracking-tighter mb-2">
              {user.name || 'User'}
            </h1>
            <p className="text-xl font-bold text-gray-400 tracking-wide uppercase">
              {user.email}
            </p>
          </div>

          <div className="space-y-5 bg-[#FFF5F8] p-8 rounded-[40px] border border-pink-50 shadow-inner">
            <div className="flex justify-between items-end mb-2">
              <span className="flex items-center gap-2 font-bold text-[#E6005C] uppercase tracking-wider text-sm">
                <Target size={18} />
                Baking Progress
              </span>
              <span className="font-black text-3xl text-[#FF4D94]">{stats.completionRate}%</span>
            </div>
            {/* Progress Bar */}
            <div className="w-full h-10 bg-white border border-pink-50 rounded-full overflow-hidden p-1.5 shadow-sm">
              <div 
                className="h-full bg-gradient-to-r from-[#FF4D94] to-[#E6005C] rounded-full transition-all duration-1000 ease-out shadow-lg shadow-pink-100"
                style={{ width: `${stats.completionRate}%` }}
              ></div>
            </div>
            <div className="flex justify-between text-[10px] font-bold text-[#FF4D94] uppercase tracking-widest">
              <span>{stats.xp} XP EARNED</span>
              <span>{stats.nextLevelXp - stats.xp} XP UNTIL LEVEL 43</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button className="cake-btn flex items-center gap-3 shadow-lg shadow-pink-100 hover:scale-105 transition-transform">
              <Edit2 size={20} strokeWidth={3} />
              <span>EDIT PROFILE</span>
            </button>
            <button className="px-8 py-4 bg-white text-[#FF4D94] font-bold rounded-[30px] border-2 border-pink-50 hover:bg-pink-50 transition-colors flex items-center gap-3">
              <LogOut size={20} strokeWidth={3} />
              <span>SIGN OUT</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-10">
        <div className="cake-card p-8 bg-gradient-to-br from-[#FF4D94] to-[#E6005C] text-white flex items-center justify-between shadow-xl shadow-pink-100">
           <div>
             <p className="text-xs font-bold uppercase opacity-80 tracking-widest mb-1">Current Rank</p>
             <p className="text-3xl font-black italic">PRO BAKER</p>
           </div>
           <Trophy size={56} strokeWidth={2.5} className="opacity-40" />
        </div>
        <div className="cake-card p-8 bg-white text-[#E6005C] flex items-center justify-between border border-pink-50">
           <div>
             <p className="text-xs font-bold uppercase text-gray-400 tracking-widest mb-1">Task Master Level</p>
             <p className="text-4xl font-black">{stats.level}</p>
           </div>
           <Star size={56} strokeWidth={2.5} className="fill-[#FF4D94] text-[#FF4D94] opacity-20" />
        </div>
      </div>
    </div>
  );
}

