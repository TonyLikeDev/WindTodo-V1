"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import useSWR from "swr";
import { useParams } from "next/navigation";
import { 
  Send, 
  MessageSquare, 
  Users, 
  Sparkles,
  MoreVertical,
  WifiOff,
  Smile,
  Image as ImageIcon,
  Paperclip,
  User,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getProjectMessages, getWorkspaceMessages, sendMessage } from "@/app/actions/chatActions";
import { getWorkspacesWithProjects } from "@/app/actions/projectActions";
import { useRealtimeChat } from "@/lib/useRealtimeChat";

interface ChatSidebarProps {
  onClose?: () => void;
}

export default function ChatSidebar({ onClose }: ChatSidebarProps = {}) {
  const params = useParams();
  const projectId = params?.id as string;
  const [message, setMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"chat" | "members">("chat");

  // Fetch workspaces to find the current context
  const { data: workspaces = [] } = useSWR("workspaces", getWorkspacesWithProjects);
  const workspaceId = workspaces[0]?.id; // Default to first workspace

  // Realtime hook
  useRealtimeChat(projectId, workspaceId);

  // Messages fetch
  const { data: serverMessages = [], mutate, error } = useSWR(
    projectId ? `chat:project:${projectId}` : (workspaceId ? `chat:workspace:${workspaceId}` : null),
    () => projectId ? getProjectMessages(projectId) : getWorkspaceMessages(workspaceId!),
    { shouldRetryOnError: false }
  );

  const isOffline = !!error;

  // Mock messages for Demo/Offline Mode
  const demoMessages = useMemo(() => [
    { id: "m1", content: "Chào mừng cả nhóm đến với SkyTodo! 🚀", createdAt: new Date(Date.now() - 3600000), sender: { name: "Admin", avatarUrl: null } },
    { id: "m2", content: "Mọi người nhớ cập nhật Task cho sprint này nhé.", createdAt: new Date(Date.now() - 3000000), sender: { name: "Tony", avatarUrl: null } },
    { id: "m3", content: "Ok anh, em đang update phần UI.", createdAt: new Date(Date.now() - 2000000), sender: { name: "Quang", avatarUrl: null } },
    { id: "m4", content: "Messenger chat nhìn xịn xò quá! 😍", createdAt: new Date(Date.now() - 1000000), sender: { name: "User", avatarUrl: null } },
  ], []);

  const messages = (serverMessages.length > 0 || !isOffline) ? serverMessages : demoMessages;

  const handleSend = async () => {
    if (!message.trim()) return;
    if (!projectId && !workspaceId) {
      console.warn("No active project or workspace for chat.");
      return;
    }
    
    const content = message;
    setMessage("");

    if (isOffline) {
       // Mock send
       mutate([...messages, { 
         id: `temp-${Date.now()}`, content, createdAt: new Date(), sender: { name: "You", avatarUrl: null } 
       } as any], false);
       return;
    }

    try {
      // Optimistic update
      mutate([...messages, { 
        id: `temp-${Date.now()}`, content, createdAt: new Date(), sender: { name: "You", avatarUrl: null } 
       } as any], false);

      await sendMessage(content, { projectId, workspaceId });
      mutate();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, activeTab]);

  return (
    <aside className="h-full w-full flex flex-col">
      <div className="flex flex-col h-full bg-white/20 backdrop-blur-2xl rounded-[2.5rem] border border-white/60 shadow-2xl shadow-sky-dark/10 overflow-hidden relative ring-1 ring-white/20">
        
        {/* Messenger-style Header */}
        <div className="p-6 border-b border-white/20 bg-white/40 backdrop-blur-md relative z-10">
          <div className="flex items-center justify-between mb-6">
             <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-sky-blue flex items-center justify-center text-white shadow-lg shadow-primary/20">
                     <MessageSquare size={20} />
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div>
                   <h3 className="text-sm font-black text-foreground uppercase tracking-widest truncate max-w-[120px]">
                     {projectId ? "Dự án Chat" : "Nhóm Thảo luận"}
                   </h3>
                   <div className="flex items-center gap-1.5 mt-0.5">
                      {isOffline ? (
                        <span className="text-[9px] font-black text-amber-600 flex items-center gap-1 uppercase tracking-tighter">
                          <WifiOff size={10} /> Demo Mode
                        </span>
                      ) : (
                        <span className="text-[9px] font-black text-muted-foreground/60 flex items-center gap-1 uppercase tracking-tighter">
                          <Users size={10} /> 12 Members
                        </span>
                      )}
                   </div>
                </div>
             </div>
             <div className="flex items-center gap-1">
               <button className="p-3 hover:bg-white/60 rounded-2xl transition-all text-muted-foreground/40 hover:text-foreground">
                  <MoreVertical size={20} />
               </button>
               {onClose && (
                 <button 
                   onClick={onClose}
                   className="p-3 hover:bg-red-500/10 hover:text-red-500 rounded-2xl transition-all text-muted-foreground/40 hover:text-red-500"
                 >
                    <X size={20} />
                 </button>
               )}
             </div>
          </div>

          {/* Tab Switcher */}
          <div className="flex p-1 bg-black/5 rounded-2xl">
             <button 
               onClick={() => setActiveTab("chat")}
               className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'chat' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
             >
                Tin nhắn
             </button>
             <button 
               onClick={() => setActiveTab("members")}
               className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'members' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
             >
                Thành viên
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col relative z-10">
          <AnimatePresence mode="wait">
            {activeTab === "chat" ? (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar flex flex-col"
                ref={scrollRef}
              >
                {messages.map((msg: any, i) => {
                  const isMe = msg.sender?.name === "You";
                  const nextMsg = messages[i + 1];
                  const isSameSenderAsNext = nextMsg && nextMsg.sender?.name === msg.sender?.name;

                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} group`}
                    >
                      {!isMe && !isSameSenderAsNext && (
                         <div className="flex items-center gap-2 mb-1 ml-1">
                            <span className="text-[9px] font-black text-primary uppercase tracking-widest">{msg.sender?.name}</span>
                         </div>
                      )}
                      
                      <div className="flex items-end gap-2 max-w-[90%]">
                        {!isMe && (
                          <div className={`w-6 h-6 rounded-lg bg-white/60 border border-white/60 flex items-center justify-center text-[8px] font-black text-muted-foreground mb-1 shadow-sm ${isSameSenderAsNext ? 'opacity-0' : ''}`}>
                             {msg.sender?.name?.charAt(0)}
                          </div>
                        )}
                        <div 
                          className={`px-4 py-3 rounded-2xl text-[13px] font-medium shadow-sm transition-all hover:brightness-95 ${
                            isMe 
                              ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                              : 'bg-white/80 text-foreground border border-white/60 rounded-tl-none'
                          }`}
                        >
                          {msg.content}
                        </div>
                      </div>

                      {!isSameSenderAsNext && (
                        <span className="text-[8px] font-bold text-muted-foreground/40 mt-1 uppercase tracking-tighter px-1">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      )}
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-30">
                     <div className="p-6 bg-white/40 rounded-full mb-4">
                       <MessageSquare size={32} />
                     </div>
                     <p className="text-[10px] font-black uppercase tracking-[0.2em]">Bắt đầu cuộc trò chuyện</p>
                  </div>
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="members"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="flex-1 p-6 space-y-4"
              >
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-4">Thành viên trực tuyến</p>
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-center justify-between p-3 bg-white/40 rounded-2xl border border-white/60">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-black text-xs">
                           U
                        </div>
                        <span className="text-xs font-bold text-foreground">User {i}</span>
                     </div>
                     <div className="w-2 h-2 rounded-full bg-green-500 shadow-sm" />
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Messenger Input Bar */}
        <div className="p-6 bg-white/20 border-t border-white/20 relative z-10">
          <div className="flex items-center gap-2 mb-3 px-2">
             <button className="text-muted-foreground/60 hover:text-primary transition-all"><ImageIcon size={18} /></button>
             <button className="text-muted-foreground/60 hover:text-primary transition-all"><Paperclip size={18} /></button>
             <button className="text-muted-foreground/60 hover:text-primary transition-all ml-auto"><Smile size={18} /></button>
          </div>
          <div className="bg-white/60 backdrop-blur-xl border border-white/80 rounded-2xl p-1.5 flex items-center gap-2 shadow-sm focus-within:shadow-md transition-all">
             <input 
               value={message}
               onChange={e => setMessage(e.target.value)}
               onKeyDown={e => e.key === 'Enter' && handleSend()}
               placeholder={(!projectId && !workspaceId) ? "Chọn dự án để chat..." : "Viết tin nhắn..."} 
               disabled={!projectId && !workspaceId}
               className="flex-1 bg-transparent border-none text-sm font-bold text-foreground placeholder-muted-foreground/40 outline-none px-4 py-2 disabled:opacity-50"
             />
             <button 
               onClick={handleSend}
               disabled={!message.trim() || (!projectId && !workspaceId)}
               className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                 (message.trim() && (projectId || workspaceId)) ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' : 'bg-white/20 text-muted-foreground/40'
               }`}
             >

                <Send size={18} />
             </button>
          </div>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-primary/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-48 h-48 bg-accent-lavender/5 rounded-full blur-[80px] pointer-events-none" />
      </div>
    </aside>
  );
}
