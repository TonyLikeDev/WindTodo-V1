"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatSidebar from "@/components/ChatSidebar";
import SkyBackground from "@/components/SkyBackground";
import { Menu, X, MessageSquare } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(true);

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
            <div className="max-w-7xl mx-auto w-full min-h-full">
              {children}
            </div>
          </div>
        </main>


        {/* Right Sidebar (Chat) */}
        <div className={`hidden xl:block transition-all duration-500 ease-in-out ${isChatOpen ? "w-80 opacity-100" : "w-0 opacity-0 overflow-hidden"}`}>
          <ChatSidebar />
        </div>

        {/* Floating Chat Toggle (Desktop) */}
        <button 
          onClick={() => setIsChatOpen(!isChatOpen)}
          className={`hidden md:flex fixed bottom-8 right-8 z-[70] w-14 h-14 items-center justify-center rounded-2xl shadow-2xl transition-all hover:scale-110 active:scale-95 ${
            isChatOpen ? 'bg-white/60 text-primary border border-white/60 backdrop-blur-md' : 'bg-primary text-white shadow-primary/30'
          }`}
        >
          {isChatOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>
    </SkyBackground>
  );
}