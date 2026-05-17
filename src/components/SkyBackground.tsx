"use client";

import React, { useEffect, useState } from "react";
import { useTheme } from "next-themes";

const Cloud = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <svg
    className={`absolute opacity-60 pointer-events-none ${className}`}
    viewBox="0 0 200 60"
    fill="white"
    style={style}
  >
    <path d="M10,40 Q10,20 30,20 Q40,10 60,20 Q80,5 110,20 Q130,10 150,20 Q170,10 180,30 Q195,40 180,50 L20,50 Q5,50 10,40 Z" />
  </svg>
);

export default function SkyBackground({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full sky-gradient overflow-hidden flex flex-col">
      <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-white/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-accent-lavender/30 blur-[100px] rounded-full pointer-events-none" />

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Dynamic Celestial Body (Sun/Moon background graphic) */}
        {mounted && (
          theme === "dark" ? (
            <div 
              className="absolute top-[6%] right-[6%] w-[160px] h-[160px] transition-all duration-1000 ease-in-out select-none opacity-85"
              style={{
                filter: "drop-shadow(0 0 25px rgba(129, 140, 248, 0.6))"
              }}
            >
              {/* Moon Glow */}
              <div className="absolute inset-0 bg-indigo-400/25 blur-xl rounded-full animate-pulse" style={{ animationDuration: '5s' }} />
              {/* Moon Icon */}
              <svg className="w-full h-full text-indigo-100/70" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 25C36.19 25 25 36.19 25 50C25 63.81 36.19 75 50 75C53.94 75 57.65 74.09 61 72.48C50.29 70.82 42.5 61.34 42.5 50C42.5 38.66 50.29 29.18 61 27.52C57.65 25.91 53.94 25 50 25Z" />
              </svg>
            </div>
          ) : (
            <div 
              className="absolute top-[6%] right-[6%] w-[180px] h-[180px] transition-all duration-1000 ease-in-out select-none opacity-80"
              style={{
                animation: "spin 120s linear infinite",
                filter: "drop-shadow(0 0 35px rgba(251, 191, 36, 0.65))"
              }}
            >
              {/* Sun Glow */}
              <div className="absolute inset-0 bg-amber-400/30 blur-2xl rounded-full" />
              {/* Sun Icon */}
              <svg className="w-full h-full text-amber-400/75" viewBox="0 0 100 100" fill="none" stroke="currentColor">
                <circle cx="50" cy="50" r="20" fill="currentColor" className="text-amber-300/45" />
                {[...Array(12)].map((_, i) => (
                  <line
                    key={i}
                    x1="50"
                    y1="12"
                    x2="50"
                    y2="22"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    transform={`rotate(${i * 30} 50 50)`}
                  />
                ))}
              </svg>
            </div>
          )
        )}

        <Cloud
          className="cloud-anim w-[300px] top-[15%]"
          style={{ animationDuration: "100s", animationDelay: "0s" }}
        />
        <Cloud
          className="cloud-anim w-[450px] top-[40%]"
          style={{ animationDuration: "150s", animationDelay: "-20s" }}
        />
        <Cloud
          className="cloud-anim w-[250px] top-[65%]"
          style={{ animationDuration: "120s", animationDelay: "-50s" }}
        />
        <Cloud
          className="cloud-anim w-[400px] top-[5%]"
          style={{ animationDuration: "180s", animationDelay: "-80s" }}
        />
      </div>

      <div className="relative z-10 flex flex-col flex-grow">
        {children}
      </div>
    </div>
  );
}
