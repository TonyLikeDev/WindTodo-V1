"use client";

import { useRef, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import SkyBackground from "@/components/SkyBackground";

const SWIPE_THRESHOLD_PX = 50;
const VERTICAL_SWIPE_TOLERANCE_PX = 60;

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const onTouchEndOpen = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;

    const screenMidpoint = window.innerWidth / 2;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    if (
      touchStartX.current <= screenMidpoint &&
      dx > SWIPE_THRESHOLD_PX &&
      Math.abs(dy) < VERTICAL_SWIPE_TOLERANCE_PX
    ) {
      setIsMobileMenuOpen(true);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  const onTouchEndClose = (e: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;

    if (dx < -SWIPE_THRESHOLD_PX && Math.abs(dy) < VERTICAL_SWIPE_TOLERANCE_PX) {
      setIsMobileMenuOpen(false);
    }

    touchStartX.current = null;
    touchStartY.current = null;
  };

  return (
    <SkyBackground>
      <div className="flex h-screen overflow-hidden w-full relative">
        <Sidebar isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

        <main
          className="flex-grow flex flex-col h-screen overflow-hidden w-full"
          onTouchStart={!isMobileMenuOpen ? onTouchStart : undefined}
          onTouchEnd={!isMobileMenuOpen ? onTouchEndOpen : undefined}
        >
          <div className="md:hidden flex h-16 flex-shrink-0 items-center px-4">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-11 h-11 rounded-2xl glass border border-white/60 shadow-lg shadow-sky-dark/10 flex items-center justify-center text-foreground"
            >
              <Menu size={22} />
            </button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 md:p-8 custom-scrollbar">
            {children}
          </div>
        </main>

        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEndClose}
          />
        )}
      </div>
    </SkyBackground>
  );
}
