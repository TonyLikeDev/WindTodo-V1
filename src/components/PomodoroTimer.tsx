'use client';

import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, CloudRain, Music, Volume2, VolumeX, Coffee, Zap, Moon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Mode = 'pomodoro' | 'short' | 'long';

const SOUNDS = {
  rain: 'https://assets.mixkit.co/active_storage/sfx/2437/2437-preview.mp3', // Rain sound placeholder
  classic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3', // Classic placeholder
};

export default function PomodoroSidebar() {
  const [mode, setMode] = useState<Mode>('pomodoro');
  const [config, setConfig] = useState({
    pomodoro: 25,
    short: 5,
    long: 15,
  });
  const [timeLeft, setTimeLeft] = useState(config.pomodoro * 60);
  const [isActive, setIsActive] = useState(false);
  const [activeSound, setActiveSound] = useState<'none' | 'rain' | 'classic'>('none');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const alarmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      alarmRef.current?.play();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!isActive) {
      setTimeLeft(config[mode] * 60);
    }
  }, [mode, config, isActive]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(config[mode] * 60);
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(config[newMode] * 60);
  };

  const toggleSound = (sound: 'rain' | 'classic') => {
    if (activeSound === sound) {
      setActiveSound('none');
      if (audioRef.current) audioRef.current.pause();
    } else {
      setActiveSound(sound);
      if (audioRef.current) {
        audioRef.current.src = SOUNDS[sound];
        audioRef.current.play();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  // LinkFlow color theme
  const themes = {
    pomodoro: 'bg-[#1f2a1d]', // Dark Green
    short: 'bg-[#336443]',    // Heading Primary
    long: 'bg-[#85AB8B]',     // Heading Accent
  };

  return (
    <div className={`mt-6 rounded-2xl overflow-hidden transition-colors duration-500 ${themes[mode]} p-4 text-white shadow-lg`}>
      <audio ref={audioRef} loop />
      <audio ref={alarmRef} src="https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3" />

      {/* Tabs */}
      <div className="flex items-center justify-between gap-1 mb-6">
        {(['pomodoro', 'short', 'long'] as Mode[]).map((m) => (
          <button
            key={m}
            onClick={() => handleModeChange(m)}
            className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${
              mode === m ? 'bg-white/20' : 'hover:bg-white/10'
            }`}
          >
            {m === 'pomodoro' ? 'Pomo' : m === 'short' ? 'Short' : 'Long'}
          </button>
        ))}
      </div>

      {/* Timer */}
      <div className="text-center mb-6">
        <h2 className="text-5xl font-black tracking-tighter tabular-nums drop-shadow-md">
          {formatTime(timeLeft)}
        </h2>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 mb-6">
        <button
          onClick={toggleTimer}
          className="flex-[2] py-3 bg-white text-[#1f2a1d] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white/90 active:scale-95 transition-all shadow-xl shadow-black/10"
        >
          {isActive ? <Pause className="mx-auto" size={18} /> : <Play className="mx-auto ml-1" size={18} />}
        </button>
        <button
          onClick={resetTimer}
          className="flex-1 py-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-95"
        >
          <RotateCcw className="mx-auto" size={18} />
        </button>
      </div>

      {/* Music Section */}
      <div className="pt-4 border-t border-white/10 space-y-3">
        <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-60 text-center">Focus Sounds</p>
        <div className="flex items-center justify-center gap-3">
          <button 
            onClick={() => toggleSound('rain')}
            className={`p-2 rounded-xl transition-all ${activeSound === 'rain' ? 'bg-white text-foreground' : 'bg-white/10 hover:bg-white/20'}`}
            title="Rain Sound"
          >
            <CloudRain size={16} />
          </button>
          <button 
            onClick={() => toggleSound('classic')}
            className={`p-2 rounded-xl transition-all ${activeSound === 'classic' ? 'bg-white text-foreground' : 'bg-white/10 hover:bg-white/20'}`}
            title="Classical Music"
          >
            <Music size={16} />
          </button>
          <button 
            onClick={() => {
                setActiveSound('none');
                if (audioRef.current) audioRef.current.pause();
            }}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-all"
            title="Mute"
          >
            <VolumeX size={16} />
          </button>
        </div>
        
        {activeSound !== 'none' && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <span className="text-[9px] font-bold italic opacity-80 animate-pulse">
                Playing: {activeSound === 'rain' ? 'Gentle Rain' : 'Deep Classical'}...
            </span>
          </motion.div>
        )}
      </div>
    </div>
  );
}
