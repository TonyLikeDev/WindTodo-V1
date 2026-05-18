/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import SkyBackground from "@/components/SkyBackground";
import { useTheme } from "next-themes";
import { Sun, Moon, Menu } from "lucide-react";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <SkyBackground>
      <div className="flex h-screen overflow-hidden w-full relative">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />
        <main className="flex-grow flex flex-col h-screen overflow-hidden w-full relative">
          
          {/* Floating Actions Header (Top Right) */}
          <div className="absolute top-4 md:top-6 right-4 md:right-8 z-40 flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-2xl bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 text-foreground hover:text-primary transition-all border border-white/20 dark:border-white/5 flex items-center justify-center cursor-pointer shadow-md shadow-sky-dark/5 dark:shadow-none"
                title="Toggle Theme"
              >
                {theme === "dark" ? (
                  <Sun size={18} className="text-amber-400" />
                ) : (
                  <Moon size={18} className="text-indigo-600" />
                )}
              </button>
            )}
          </div>

          {/* Mobile Menu Trigger (Top Left) */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden absolute top-4 left-4 z-40 p-2.5 rounded-2xl bg-white/40 dark:bg-black/20 hover:bg-white/60 dark:hover:bg-black/35 text-foreground transition-all border border-white/20 dark:border-white/5 flex items-center justify-center cursor-pointer shadow-md"
            title="Open Menu"
          >
            <Menu size={18} />
          </button>

          <div className="flex-grow overflow-y-auto p-4 md:p-8 pt-16 md:pt-8 custom-scrollbar">
            {children}
          </div>
        </main>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </SkyBackground>
  );
}
