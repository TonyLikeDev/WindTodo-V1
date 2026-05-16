"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useGamificationStore, getLevel, getXpProgress, getLevelTitle, XP_PER_LEVEL } from "@/store/gamificationStore";
import { Flame, Zap, Trophy, Star, X } from "lucide-react";
import { useEffect, useState } from "react";

export default function GamificationBar() {
  const {
    xp,
    currentStreak,
    totalTasksCompleted,
    unlockedAchievements,
    newAchievement,
    dismissNewAchievement,
    checkAndUpdateStreak,
  } = useGamificationStore();

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    checkAndUpdateStreak();
  }, [checkAndUpdateStreak]);

  if (!isMounted) return null;

  const level = getLevel(xp);
  const progress = getXpProgress(xp);
  const title = getLevelTitle(level);
  const progressPct = Math.round((progress / XP_PER_LEVEL) * 100);


  return (
    <>
      {/* Gamification Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-[2rem] px-6 py-3 flex items-center gap-6 border-white/40 shadow-lg overflow-hidden relative"
      >
        {/* Decorative glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent-lavender/5 pointer-events-none" />

        {/* Level Badge */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="relative">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/30">
              <Star size={20} className="text-white fill-white" />
            </div>
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-primary/20">
              <span className="text-[9px] font-black text-primary">{level}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
            <p className="text-xs font-bold text-foreground">Level {level}</p>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="flex-1 max-w-48">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1">
              <Zap size={10} className="text-yellow-500" /> XP
            </span>
            <span className="text-[9px] font-black text-primary">{progress}/{XP_PER_LEVEL}</span>
          </div>
          <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden border border-white/40">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPct}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {/* Streak */}
        <div className="flex items-center gap-2 px-4 py-2 bg-orange-50/60 rounded-2xl border border-orange-200/50 flex-shrink-0">
          <Flame size={18} className={currentStreak > 0 ? "text-orange-500 fill-orange-400" : "text-muted-foreground"} />
          <div>
            <p className="text-sm font-black text-orange-600">{currentStreak}</p>
            <p className="text-[9px] font-bold text-orange-400 leading-none">day streak</p>
          </div>
        </div>

        {/* Total Tasks */}
        <div className="flex items-center gap-2 px-4 py-2 bg-green-50/60 rounded-2xl border border-green-200/50 flex-shrink-0">
          <Trophy size={18} className="text-green-600" />
          <div>
            <p className="text-sm font-black text-green-700">{totalTasksCompleted}</p>
            <p className="text-[9px] font-bold text-green-500 leading-none">completed</p>
          </div>
        </div>

        {/* Achievement badges (last 3) */}
        {unlockedAchievements.length > 0 && (
          <div className="hidden xl:flex items-center gap-1 flex-shrink-0">
            {unlockedAchievements.slice(-3).map((id) => {
              const ach = [
                { id: 'first_task', icon: '🌱' }, { id: 'streak_3', icon: '🔥' },
                { id: 'streak_7', icon: '⚡' }, { id: 'streak_30', icon: '💎' },
                { id: 'tasks_10', icon: '✅' }, { id: 'tasks_50', icon: '🚀' },
                { id: 'tasks_100', icon: '🏆' }, { id: 'focus_5', icon: '🧘' },
                { id: 'mood_happy', icon: '😊' }, { id: 'level_5', icon: '⭐' },
                { id: 'level_10', icon: '👑' },
              ].find(a => a.id === id);
              return (
                <div key={id} className="w-8 h-8 rounded-xl bg-white/60 border border-white/60 flex items-center justify-center text-sm shadow-sm" title={id}>
                  {ach?.icon}
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Achievement Unlock Toast */}
      <AnimatePresence>
        {newAchievement && (
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ type: "spring", bounce: 0.4 }}
            className="fixed bottom-8 right-8 z-[200] glass rounded-[2rem] p-6 shadow-2xl border-white/60 max-w-xs"
          >
            <div className="flex items-start gap-4">
              <div className="text-4xl">{newAchievement.icon}</div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Achievement Unlocked!</p>
                <p className="text-sm font-black text-foreground">{newAchievement.title}</p>
                <p className="text-xs text-muted-foreground">{newAchievement.description}</p>
              </div>
              <button onClick={dismissNewAchievement} className="p-1 hover:bg-white/40 rounded-xl text-muted-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="mt-3 w-full h-1 bg-white/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 5, ease: "linear" }}
                onAnimationComplete={dismissNewAchievement}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
