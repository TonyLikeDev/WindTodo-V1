"use client";

import { useState, useEffect } from 'react';
import { Search, Bell, Calendar, ChevronRight } from 'lucide-react';
import NotificationBell from './NotificationBell';

export default function TopBar({ onMenuToggle = () => {} }: { onMenuToggle?: () => void }) {
  const [currentDate, setCurrentDate] = useState({ date: '', day: '' });

  useEffect(() => {
    const formatDate = () => {
      const now = new Date();
      const dateOptions: Intl.DateTimeFormatOptions = { month: 'long', day: 'numeric', year: 'numeric' };
      const dayOptions: Intl.DateTimeFormatOptions = { weekday: 'long' };
      
      setCurrentDate({
        date: now.toLocaleDateString('en-US', dateOptions),
        day: now.toLocaleDateString('en-US', dayOptions)
      });
    };

    formatDate();
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-white/20 bg-white/30 backdrop-blur-md">
        <div className="flex items-center space-x-6 flex-1">
            <button 
              className="md:hidden text-foreground hover:text-primary transition-colors p-2 glass rounded-xl"
              onClick={onMenuToggle}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"></path></svg>
            </button>
            
            <div className="hidden md:flex items-center gap-2 text-xs font-bold text-muted-foreground uppercase tracking-widest">
               <span>Dashboard</span>
               <ChevronRight size={14} className="opacity-50" />
               <span className="text-foreground">Overview</span>
            </div>

            <div className="relative w-72 lg:w-96 hidden sm:block">
              <span className="absolute inset-y-0 left-0 flex items-center pl-4">
                  <Search className="w-4 h-4 text-muted-foreground" />
              </span>
              <input 
                type="text" 
                placeholder="Find anything..." 
                className="w-full bg-white/40 border border-white/40 rounded-full py-2.5 pl-12 pr-5 text-sm text-foreground placeholder-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/10 transition-all shadow-sm" 
              />
            </div>
        </div>
        
        <div className="flex items-center space-x-4">
            <div className="hidden lg:flex flex-col items-end mr-4">
                <p className="text-sm font-bold text-foreground">{currentDate.date}</p>
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{currentDate.day}</p>
            </div>

            <NotificationBell />

            <button 
              className="w-12 h-12 flex items-center justify-center glass rounded-2xl text-muted-foreground hover:text-primary hover:bg-white/50 transition-all"
            >
                <Calendar size={20} />
            </button>
        </div>
    </header>
  );
}