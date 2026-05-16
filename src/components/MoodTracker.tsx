"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGamificationStore, ACHIEVEMENTS } from "@/store/gamificationStore";

type MoodEntry = { date: string; mood: number; energy: number };

const MOODS = [
  { value: 1, emoji: "😞", label: "Rough", color: "bg-red-200 border-red-300 text-red-600" },
  { value: 2, emoji: "😕", label: "Meh", color: "bg-orange-200 border-orange-300 text-orange-600" },
  { value: 3, emoji: "😐", label: "Okay", color: "bg-yellow-200 border-yellow-300 text-yellow-600" },
  { value: 4, emoji: "🙂", label: "Good", color: "bg-green-200 border-green-300 text-green-600" },
  { value: 5, emoji: "😊", label: "Great!", color: "bg-primary/20 border-primary/30 text-primary" },
];

const ENERGY = [
  { value: 1, label: "Drained", icon: "🪫" },
  { value: 2, label: "Low", icon: "🔋" },
  { value: 3, label: "Medium", icon: "⚡" },
  { value: 4, label: "High", icon: "🚀" },
  { value: 5, label: "Supercharged", icon: "💥" },
];

export default function MoodTracker() {
  const [todayEntry, setTodayEntry] = useState<MoodEntry | null>(null);
  const [selectedMood, setSelectedMood] = useState<number>(0);
  const [selectedEnergy, setSelectedEnergy] = useState<number>(0);
  const [saved, setSaved] = useState(false);
  const { unlockedAchievements, addXP } = useGamificationStore();

  const today = new Date().toDateString();

  useEffect(() => {
    const stored = localStorage.getItem("skytodo-mood-log");
    if (stored) {
      const log: MoodEntry[] = JSON.parse(stored);
      const todayLog = log.find(e => e.date === today);
      if (todayLog) {
        setTodayEntry(todayLog);
        setSelectedMood(todayLog.mood);
        setSelectedEnergy(todayLog.energy);
        setSaved(true);
      }
    }
  }, [today]);

  const handleSave = () => {
    if (!selectedMood || !selectedEnergy) return;
    const stored = localStorage.getItem("skytodo-mood-log");
    const log: MoodEntry[] = stored ? JSON.parse(stored) : [];
    const filtered = log.filter(e => e.date !== today);
    const newEntry = { date: today, mood: selectedMood, energy: selectedEnergy };
    filtered.push(newEntry);
    localStorage.setItem("skytodo-mood-log", JSON.stringify(filtered));
    setTodayEntry(newEntry);
    setSaved(true);
    addXP(5);
  };

  const currentMood = MOODS.find(m => m.value === selectedMood);

  return (
    <div className="glass rounded-[2.5rem] p-6 border-white/40">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-2xl bg-pink-100/60 flex items-center justify-center text-lg border border-pink-200/50">
          💭
        </div>
        <div>
          <h3 className="text-sm font-black text-foreground">How are you feeling?</h3>
          <p className="text-[10px] text-muted-foreground font-medium">Daily mood & energy check-in</p>
        </div>
        {saved && (
          <div className="ml-auto px-3 py-1 bg-green-100/60 rounded-xl border border-green-200/50">
            <span className="text-[10px] font-black text-green-600">✓ Logged</span>
          </div>
        )}
      </div>

      {/* Mood Selection */}
      <div className="mb-4">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Mood</p>
        <div className="flex gap-2">
          {MOODS.map(m => (
            <button
              key={m.value}
              onClick={() => { setSelectedMood(m.value); setSaved(false); }}
              className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-2xl border-2 transition-all ${
                selectedMood === m.value
                  ? `${m.color} scale-105 shadow-md`
                  : "bg-white/30 border-white/40 hover:bg-white/50"
              }`}
            >
              <span className="text-xl">{m.emoji}</span>
              <span className="text-[8px] font-black uppercase tracking-wide leading-none">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Energy Selection */}
      <div className="mb-5">
        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-3">Energy Level</p>
        <div className="flex gap-1.5">
          {ENERGY.map(e => (
            <button
              key={e.value}
              onClick={() => { setSelectedEnergy(e.value); setSaved(false); }}
              className={`flex-1 py-2 rounded-xl border transition-all text-center ${
                selectedEnergy === e.value
                  ? "bg-primary/20 border-primary/30 scale-105"
                  : "bg-white/30 border-white/40 hover:bg-white/50"
              }`}
              title={e.label}
            >
              <span className="text-base">{e.icon}</span>
            </button>
          ))}
        </div>
      </div>

      {/* AI Insight based on mood+energy */}
      <AnimatePresence>
        {selectedMood > 0 && selectedEnergy > 0 && !saved && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4 p-4 bg-primary/5 rounded-2xl border border-primary/10"
          >
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">✨ AI Insight</p>
            <p className="text-xs text-foreground font-medium">
              {selectedMood >= 4 && selectedEnergy >= 4
                ? "You're at peak performance! Great time to tackle your hardest tasks first."
                : selectedMood >= 3 && selectedEnergy >= 3
                ? "Solid energy today. Focus on medium-priority tasks and keep momentum going."
                : selectedMood <= 2 || selectedEnergy <= 2
                ? "Take it easy today. Start with small wins to build momentum, and remember to take breaks."
                : "Good state of mind. Mix challenging and easy tasks to stay engaged."}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        onClick={handleSave}
        disabled={!selectedMood || !selectedEnergy || saved}
        className="w-full py-3 rounded-2xl bg-primary text-white text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
      >
        {saved ? `✓ Mood logged — ${currentMood?.emoji} ${currentMood?.label}` : "Log Today's Mood (+5 XP)"}
      </button>
    </div>
  );
}
