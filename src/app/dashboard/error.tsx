"use client";

import React, { useEffect } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import Link from "next/link";
import SkyBackground from "@/components/SkyBackground";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard Error:", error);
  }, [error]);

  return (
    <SkyBackground>
      <div className="flex flex-col items-center justify-center h-screen w-full p-8 text-center">
        <div className="glass-dark p-12 rounded-[3.5rem] shadow-2xl border-white/60 max-w-xl w-full flex flex-col items-center gap-8">
           <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-inner">
             <AlertTriangle size={48} />
           </div>
           
           <div>
             <h2 className="text-3xl font-black text-foreground mb-4">Ối! Có lỗi xảy ra</h2>
             <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest opacity-60">
               {error.message || "Không thể tải Dashboard lúc này."}
             </p>
           </div>

           <div className="flex flex-col sm:flex-row gap-4 w-full">
             <button
               onClick={() => reset()}
               className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-black uppercase tracking-widest text-xs py-5 rounded-2xl shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
             >
               <RefreshCcw size={16} /> Thử lại
             </button>
             <Link
               href="/dashboard"
               className="flex-1 flex items-center justify-center gap-2 bg-white/60 text-foreground font-black uppercase tracking-widest text-xs py-5 rounded-2xl border border-white hover:bg-white/80 transition-all"
             >
               <Home size={16} /> Dashboard
             </Link>
           </div>

           <p className="text-[10px] text-muted-foreground/40 font-mono">
             ID: {error.digest || "N/A"}
           </p>
        </div>
      </div>
    </SkyBackground>
  );
}
