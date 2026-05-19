"use client";

import { useState, useEffect, useCallback, useRef } from "react";

type TimerMode = "work" | "shortBreak" | "longBreak";

interface TimerConfig {
  work: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

const DEFAULT_CONFIG: TimerConfig = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

const MODE_LABELS: Record<TimerMode, string> = {
  work: "Focus Time",
  shortBreak: "Short Break",
  longBreak: "Long Break",
};

const MODE_COLORS: Record<TimerMode, { ring: string; glow: string; text: string; bg: string }> = {
  work: {
    ring: "stroke-white/80",
    glow: "shadow-[0_0_60px_rgba(255,255,255,0.15)]",
    text: "text-white",
    bg: "bg-white/5",
  },
  shortBreak: {
    ring: "stroke-emerald-400/80",
    glow: "shadow-[0_0_60px_rgba(52,211,153,0.15)]",
    text: "text-emerald-400",
    bg: "bg-emerald-500/5",
  },
  longBreak: {
    ring: "stroke-sky-400/80",
    glow: "shadow-[0_0_60px_rgba(56,189,248,0.15)]",
    text: "text-sky-400",
    bg: "bg-sky-500/5",
  },
};

export default function PomodoroTimer() {
  const [config, setConfig] = useState<TimerConfig>(DEFAULT_CONFIG);
  const [mode, setMode] = useState<TimerMode>("work");
  const [timeLeft, setTimeLeft] = useState(config.work * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [totalFocusTime, setTotalFocusTime] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Request notification permission
  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission();
      }
    }
  }, []);

  // Send notification
  const sendNotification = useCallback((title: string, body: string) => {
    if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: "/windtodo.png",
      });
    }

    // Play a simple beep sound using Web Audio API
    try {
      const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.frequency.value = 800;
      oscillator.type = "sine";
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.stop();
        audioContext.close();
      }, 300);
    } catch {
      // Audio not available
    }
  }, []);

  // Switch mode
  const switchMode = useCallback(
    (newMode: TimerMode) => {
      setMode(newMode);
      setIsRunning(false);
      switch (newMode) {
        case "work":
          setTimeLeft(config.work * 60);
          break;
        case "shortBreak":
          setTimeLeft(config.shortBreak * 60);
          break;
        case "longBreak":
          setTimeLeft(config.longBreak * 60);
          break;
      }
    },
    [config]
  );

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (mode === "work") {
          setTotalFocusTime((prev) => prev + 1);
        }
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Timer completed
      setIsRunning(false);

      if (mode === "work") {
        const newCount = completedPomodoros + 1;
        setCompletedPomodoros(newCount);

        if (newCount % config.longBreakInterval === 0) {
          sendNotification("🎉 Long Break Time!", `Great job! You completed ${newCount} pomodoros. Take a long break.`);
          switchMode("longBreak");
          setIsRunning(true); // Auto-start break
        } else {
          sendNotification("☕ Short Break!", `Pomodoro #${newCount} complete. Take a short break.`);
          switchMode("shortBreak");
          setIsRunning(true); // Auto-start break
        }
      } else {
        sendNotification("🔥 Back to Work!", "Break is over. Time to focus!");
        switchMode("work");
        setIsRunning(true); // Auto-start work session
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, completedPomodoros, config.longBreakInterval, sendNotification, switchMode]);

  // Format time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Format total focus time
  const formatFocusTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m`;
  };

  // Calculate progress
  const totalTime = (() => {
    switch (mode) {
      case "work":
        return config.work * 60;
      case "shortBreak":
        return config.shortBreak * 60;
      case "longBreak":
        return config.longBreak * 60;
    }
  })();
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const colors = MODE_COLORS[mode];

  // Handle reset
  const handleReset = () => {
    setIsRunning(false);
    switchMode(mode);
  };

  // Handle skip
  const handleSkip = () => {
    setIsRunning(false);
    if (mode === "work") {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      if (newCount % config.longBreakInterval === 0) {
        switchMode("longBreak");
      } else {
        switchMode("shortBreak");
      }
    } else {
      switchMode("work");
    }
  };

  // Settings handler
  const handleConfigChange = (key: keyof TimerConfig, value: number) => {
    const newConfig = { ...config, [key]: value };
    setConfig(newConfig);
    if (!isRunning) {
      if (key === "work" && mode === "work") setTimeLeft(value * 60);
      if (key === "shortBreak" && mode === "shortBreak") setTimeLeft(value * 60);
      if (key === "longBreak" && mode === "longBreak") setTimeLeft(value * 60);
    }
  };

  return (
    <div className="space-y-8">
      {/* Mode Selector */}
      <div className="flex justify-center">
        <div className="glass rounded-2xl p-1.5 inline-flex gap-1">
          {(["work", "shortBreak", "longBreak"] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => switchMode(m)}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                mode === m
                  ? `${MODE_COLORS[m].bg} ${MODE_COLORS[m].text} border border-white/10`
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              {MODE_LABELS[m]}
            </button>
          ))}
        </div>
      </div>

      {/* Timer Circle */}
      <div className="flex justify-center">
        <div className={`relative w-72 h-72 rounded-full transition-shadow duration-700 ${colors.glow}`}>
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 256 256">
            <circle cx="128" cy="128" r="120" fill="none" strokeWidth="4" className="stroke-white/5" />
            <circle
              cx="128"
              cy="128"
              r="120"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
              className={`${colors.ring} transition-all duration-1000 ease-linear`}
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>

          {/* Time display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-6xl font-light tracking-wider ${colors.text} tabular-nums font-[var(--font-geist-mono)]`}>
              {formatTime(timeLeft)}
            </span>
            <span className="text-xs text-gray-500 uppercase tracking-[0.3em] mt-3">{MODE_LABELS[mode]}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center items-center gap-4">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title="Reset"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>

        <button
          onClick={() => setIsRunning(!isRunning)}
          className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 border ${
            isRunning
              ? "bg-white/10 border-white/20 text-white hover:bg-white/15"
              : "bg-white text-black border-white hover:bg-gray-200"
          }`}
        >
          {isRunning ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button
          onClick={handleSkip}
          className="w-12 h-12 rounded-full glass flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
          title="Skip"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold text-white mb-1">{completedPomodoros}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Pomodoros</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold text-white mb-1">{formatFocusTime(totalFocusTime)}</div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Focus Time</div>
        </div>
        <div className="glass rounded-2xl p-5 text-center">
          <div className="text-3xl font-bold text-white mb-1">
            {config.longBreakInterval - (completedPomodoros % config.longBreakInterval)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wider">Until Long Break</div>
        </div>
      </div>

      {/* Pomodoro Progress Dots */}
      <div className="flex justify-center gap-2">
        {Array.from({ length: config.longBreakInterval }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i < completedPomodoros % config.longBreakInterval
                ? "bg-white scale-110"
                : "bg-white/10 border border-white/10"
            }`}
          />
        ))}
      </div>

      {/* Settings Toggle */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-300 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Timer Settings
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${showSettings ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="glass rounded-2xl p-6 max-w-md mx-auto space-y-5 animate-in">
          <h3 className="text-sm font-medium text-white uppercase tracking-wider mb-4">Timer Durations (minutes)</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Focus</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConfigChange("work", Math.max(1, config.work - 5))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  −
                </button>
                <span className="text-white font-medium w-8 text-center tabular-nums">{config.work}</span>
                <button
                  onClick={() => handleConfigChange("work", Math.min(60, config.work + 5))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Short Break</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConfigChange("shortBreak", Math.max(1, config.shortBreak - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  −
                </button>
                <span className="text-white font-medium w-8 text-center tabular-nums">{config.shortBreak}</span>
                <button
                  onClick={() => handleConfigChange("shortBreak", Math.min(30, config.shortBreak + 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Long Break</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConfigChange("longBreak", Math.max(1, config.longBreak - 5))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  −
                </button>
                <span className="text-white font-medium w-8 text-center tabular-nums">{config.longBreak}</span>
                <button
                  onClick={() => handleConfigChange("longBreak", Math.min(60, config.longBreak + 5))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-400">Long Break After</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleConfigChange("longBreakInterval", Math.max(2, config.longBreakInterval - 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  −
                </button>
                <span className="text-white font-medium w-8 text-center tabular-nums">{config.longBreakInterval}</span>
                <button
                  onClick={() => handleConfigChange("longBreakInterval", Math.min(8, config.longBreakInterval + 1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden audio element */}
      <audio ref={audioRef} preload="none" />
    </div>
  );
}
