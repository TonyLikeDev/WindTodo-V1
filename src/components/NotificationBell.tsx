"use client";

import React, { useState } from "react";
import useSWR from "swr";
import { Bell, Check, Clock, Trash2, X } from "lucide-react";
import { 
  getNotifications, 
  markAsRead, 
  markAllAsRead, 
  getUnreadCount 
} from "@/app/actions/notificationActions";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: notifications = [], mutate: mutateNotifications } = useSWR(
    "notifications",
    () => getNotifications()
  );
  
  const { data: unreadCount = 0, mutate: mutateCount } = useSWR(
    "notifications:count",
    () => getUnreadCount()
  );

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    mutateNotifications();
    mutateCount();
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
    mutateNotifications();
    mutateCount();
  };

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`relative w-12 h-12 flex items-center justify-center glass rounded-2xl transition-all group ${
          isOpen ? 'bg-white/60 text-primary shadow-inner' : 'text-muted-foreground hover:text-primary hover:bg-white/50'
        }`}
      >
        <Bell size={20} className={`${isOpen ? '' : 'group-hover:rotate-12'} transition-transform`} />
        {unreadCount > 0 && (
          <span className="absolute top-3 right-3 w-5 h-5 bg-primary text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-300">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop for mobile */}
            <div 
              className="fixed inset-0 z-40 md:hidden" 
              onClick={() => setIsOpen(false)} 
            />
            
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="absolute right-0 mt-4 w-80 md:w-96 glass rounded-[2.5rem] shadow-2xl border-white/60 z-50 overflow-hidden flex flex-col max-h-[32rem]"
            >
              <div className="p-6 border-b border-white/20 flex items-center justify-between bg-white/20 backdrop-blur-xl">
                <div>
                  <h3 className="text-sm font-black text-foreground uppercase tracking-widest">Notifications</h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-0.5">You have {unreadCount} unread messages</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[10px] font-black text-primary uppercase tracking-widest hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {notifications.map((notif: any) => (
                  <div 
                    key={notif.id}
                    className={`p-4 rounded-3xl transition-all border flex gap-4 group ${
                      notif.isRead 
                        ? 'bg-white/10 border-transparent opacity-60' 
                        : 'bg-white/60 border-white/60 shadow-sm'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-2xl flex-shrink-0 flex items-center justify-center ${
                      notif.type === 'task_completed' ? 'bg-green-500/10 text-green-500' :
                      notif.type === 'task_assigned' ? 'bg-primary/10 text-primary' :
                      'bg-orange-500/10 text-orange-500'
                    }`}>
                      {notif.type === 'task_completed' ? <Check size={18} /> :
                       notif.type === 'task_assigned' ? <Bell size={18} /> :
                       <Clock size={18} />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{notif.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{notif.message}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-[9px] font-bold text-muted-foreground/50 uppercase tracking-tight">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {!notif.isRead && (
                          <button 
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="text-[9px] font-black text-primary uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            Mark read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {notifications.length === 0 && (
                  <div className="py-12 text-center opacity-30">
                    <Bell size={48} className="mx-auto mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest">All caught up!</p>
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="p-4 bg-white/10 text-center border-t border-white/10">
                   <button className="text-[10px] font-black text-muted-foreground uppercase tracking-widest hover:text-foreground transition-colors">
                      View all activity
                   </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
