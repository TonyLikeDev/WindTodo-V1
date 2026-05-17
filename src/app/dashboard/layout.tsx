"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatSidebar from "@/components/ChatSidebar";
import SkyBackground from "@/components/SkyBackground";
import { Menu, X, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <SkyBackground>
      <div className="flex h-screen overflow-hidden w-full relative">
        {/* Left Sidebar (Navigation) */}
        <div className="hidden md:block">
          <Sidebar isOpen={true} onClose={() => {}} />
        </div>

        {/* Mobile Left Sidebar */}
        <div 
          className={`fixed inset-0 z-[60] md:hidden transition-opacity duration-300 ${
            isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="absolute inset-0 bg-sky-dark/20 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
          <div className={`absolute left-0 h-full w-72 transition-transform duration-300 ease-out ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}>
            <Sidebar isOpen={true} onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>

        {/* Main Content Area */}
        <main className="flex-grow flex flex-col w-full relative">
          {/* Mobile Header */}
          <div className="md:hidden flex items-center justify-between p-4 relative z-20">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 flex items-center justify-center rounded-xl glass hover:bg-white/40 transition-all"
            >
              <Menu size={20} className="text-foreground" />
            </button>
            <h1 className="text-lg font-bold text-foreground">SkyTodo</h1>
            <button 
              onClick={() => setIsChatOpen(!isChatOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl glass hover:bg-white/40 transition-all"
            >
              <MessageSquare size={20} className="text-foreground" />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar relative z-10">
            <div className="max-w-none w-full min-h-full px-1 md:px-3">
              {children}
            </div>
          </div>
        </main>


        {/* Floating Chat Sidebar (Messenger Style) */}
        <AnimatePresence>
          {isChatOpen && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.85, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="fixed bottom-28 right-8 z-[70] w-96 max-w-[calc(100vw-2rem)] h-[600px] max-h-[80vh] pointer-events-auto p-0"
            >
              <ChatSidebar onClose={() => setIsChatOpen(false)} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messenger-style Floating Bubble Toggle Button */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`fixed bottom-8 right-8 z-[80] w-14 h-14 flex items-center justify-center rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:scale-110 active:scale-95 border cursor-pointer ${
            isChatOpen 
              ? 'bg-white text-primary border-white/60 backdrop-blur-md ring-4 ring-primary/20' 
              : 'bg-primary text-white border-transparent shadow-primary/20'
          }`}
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </SkyBackground>
  );
}