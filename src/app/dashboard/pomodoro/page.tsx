"use client";

import { useState, useEffect, useRef } from "react";
import { Play, Pause, RotateCcw, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type Mode = 'pomodoro' | 'short' | 'long';

export default function PomodoroPage() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  const configs = {
    pomodoro: 25,
    short: 5,
    long: 15
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alarmRef.current?.play();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleModeChange = (m: Mode) => {
    setMode(m);
    setIsActive(false);
    setTimeLeft(configs[m] * 60);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const themes = {
    pomodoro: 'bg-[#1f2a1d]', // Dark Green
    short: 'bg-[#336443]',    // Heading Primary
    long: 'bg-[#85AB8B]',     // Heading Accent
  };

  return (
    <div className={`min-h-[80vh] rounded-[40px] transition-colors duration-700 flex flex-col items-center justify-center p-8 text-white relative overflow-hidden ${themes[mode]}`}>
      <audio ref={alarmRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-white rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-white rounded-full blur-[80px]" />
      </div>

      <div className="max-w-xl w-full z-10 space-y-16">
        {/* Header Controls */}
        <div className="flex items-center justify-between bg-white/10 backdrop-blur-md p-2 rounded-2xl border border-white/10 max-w-sm mx-auto">
          {(['pomodoro', 'short', 'long'] as Mode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleModeChange(m)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                mode === m ? 'bg-white text-foreground shadow-lg' : 'hover:bg-white/10 text-white opacity-60 hover:opacity-100'
              }`}
            >
              {m === 'pomodoro' ? 'Pomo' : m === 'short' ? 'Short' : 'Long'}
            </button>
          ))}
        </div>

        {/* Big Timer */}
        <div className="text-center space-y-4">
           <motion.h1 
             key={timeLeft}
             initial={{ scale: 0.98, opacity: 0.9 }}
             animate={{ scale: 1, opacity: 1 }}
             className="text-[12rem] font-black tracking-tighter tabular-nums leading-none drop-shadow-2xl"
           >
             {formatTime(timeLeft)}
           </motion.h1>
           <p className="text-xl font-bold opacity-80 uppercase tracking-[0.3em]">
             {mode === 'pomodoro' ? 'Time to Focus' : 'Take a Breath'}
           </p>
        </div>

        {/* Main Controls */}
        <div className="flex items-center justify-center gap-6">
          <button
            onClick={() => setIsActive(!isActive)}
            className="group relative h-24 w-64 bg-white text-foreground rounded-[32px] overflow-hidden shadow-2xl transition-all active:scale-95 hover:shadow-white/20"
          >
             <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity" />
             <div className="relative flex items-center justify-center gap-4">
                {isActive ? <Pause size={32} /> : <Play size={32} className="ml-2" />}
                <span className="text-2xl font-black uppercase tracking-widest">
                  {isActive ? 'Pause' : 'Start'}
                </span>
             </div>
          </button>
          
          <button
            onClick={() => {
                setIsActive(false);
                setTimeLeft(configs[mode] * 60);
            }}
            className="w-24 h-24 bg-white/10 hover:bg-white/20 border border-white/20 rounded-[32px] flex items-center justify-center transition-all active:scale-95"
          >
            <RotateCcw size={32} />
          </button>
        </div>

        {/* Motivation */}
        <div className="text-center pt-8 opacity-40 hover:opacity-100 transition-opacity cursor-default">
           <p className="text-sm font-medium italic">"The only way to do great work is to love what you do."</p>
        </div>
      </div>
    </div>
  );
}
