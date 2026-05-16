"use client";

import React from "react";
import useSWR from "swr";
import { getTaskActivities } from "@/app/actions/activityActions";
import { formatDistanceToNow } from "date-fns";
import { 
  MessageSquare, 
  RefreshCw, 
  PlusCircle, 
  ArrowRight,
  User as UserIcon,
  Clock
} from "lucide-react";

export default function ActivityTab({ taskId }: { taskId: string }) {
  const { data: activities, isLoading } = useSWR(
    `activities:${taskId}`,
    () => getTaskActivities(taskId)
  );

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created': return <PlusCircle size={16} className="text-green-500" />;
      case 'status_change': return <RefreshCw size={16} className="text-blue-500" />;
      case 'commented': return <MessageSquare size={16} className="text-purple-500" />;
      default: return <Clock size={16} className="text-muted-foreground" />;
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse font-black text-primary uppercase tracking-widest text-[10px]">Loading history...</div>;

  return (
    <div className="space-y-8">
      {/* Activity Timeline */}
      <div className="relative pl-8 space-y-10">
        <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-white/40" />
        
        {activities?.map((activity: any) => (
          <div key={activity.id} className="relative">
            <div className="absolute -left-[25px] top-1 w-5 h-5 rounded-lg bg-white shadow-sm border border-white/60 flex items-center justify-center z-10">
              {getActivityIcon(activity.type)}
            </div>
            
            <div className="glass p-5 rounded-2xl border-white/60 bg-white/40 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-xl bg-white border border-white/60 flex items-center justify-center text-[10px] font-black text-primary overflow-hidden">
                      {activity.user.avatarUrl ? <img src={activity.user.avatarUrl} alt="" className="w-full h-full object-cover" /> : <UserIcon size={14} />}
                   </div>
                   <span className="text-xs font-black text-foreground">{activity.user.name || activity.user.email}</span>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground/80 leading-relaxed">
                {activity.content}
              </p>
              {activity.metadata && (
                <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/60">
                   <span>{activity.metadata.old}</span>
                   <ArrowRight size={10} />
                   <span>{activity.metadata.new}</span>
                </div>
              )}
            </div>
          </div>
        ))}

        {(!activities || activities.length === 0) && (
          <div className="text-center py-20 opacity-30">
            <Clock size={48} className="mx-auto mb-4" />
            <p className="text-xs font-black uppercase tracking-widest">No activity history yet</p>
          </div>
        )}
      </div>

      {/* Comment Input Placeholder */}
      <div className="glass p-6 rounded-[2rem] border-white/60 bg-white/60 shadow-xl">
         <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
               <MessageSquare size={20} />
            </div>
            <textarea 
              placeholder="Nhập phản hồi hoặc thảo luận..." 
              className="flex-1 bg-transparent border-none text-sm font-medium outline-none resize-none pt-2"
              rows={2}
            />
         </div>
         <div className="flex justify-end mt-4">
            <button className="btn-primary !py-2.5 !px-6 !text-[10px] !uppercase !tracking-widest">Gửi bình luận</button>
         </div>
      </div>
    </div>
  );
}
