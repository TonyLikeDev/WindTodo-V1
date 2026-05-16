"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { useGamificationStore } from "@/store/gamificationStore";

const PLANTS = [
  { threshold: 0, emoji: "🪨", label: "Barren" },
  { threshold: 1, emoji: "🌱", label: "Seedling" },
  { threshold: 5, emoji: "🌿", label: "Sprout" },
  { threshold: 10, emoji: "🌸", label: "Blooming" },
  { threshold: 20, emoji: "🌳", label: "Tree" },
  { threshold: 40, emoji: "🌲", label: "Forest" },
  { threshold: 75, emoji: "🏡", label: "Garden" },
  { threshold: 100, emoji: "🌈", label: "Paradise" },
];

function getPlant(completed: number) {
  let plant = PLANTS[0];
  for (const p of PLANTS) {
    if (completed >= p.threshold) plant = p;
  }
  return plant;
}

function getNextPlant(completed: number) {
  for (let i = PLANTS.length - 1; i >= 0; i--) {
    if (PLANTS[i].threshold > completed && PLANTS[i - 1]?.threshold <= completed) {
      return PLANTS[i];
    }
  }
  return PLANTS[PLANTS.length - 1];
}

export default function ProductivityGarden() {
  const { totalTasksCompleted } = useGamificationStore();

  const plant = useMemo(() => getPlant(totalTasksCompleted), [totalTasksCompleted]);
  const nextPlant = useMemo(() => getNextPlant(totalTasksCompleted), [totalTasksCompleted]);

  // Mini garden decorations based on completion
  const decorations = useMemo(() => {
    const items: string[] = [];
    if (totalTasksCompleted >= 1) items.push("🌱");
    if (totalTasksCompleted >= 3) items.push("🌸");
    if (totalTasksCompleted >= 7) items.push("🦋");
    if (totalTasksCompleted >= 15) items.push("🐝");
    if (totalTasksCompleted >= 25) items.push("🌻");
    if (totalTasksCompleted >= 50) items.push("🦜");
    return items;
  }, [totalTasksCompleted]);

  const progressToNext = nextPlant.threshold > plant.threshold
    ? Math.round(((totalTasksCompleted - plant.threshold) / (nextPlant.threshold - plant.threshold)) * 100)
    : 100;

  return (
    <div className="glass rounded-[2.5rem] p-6 border-white/40 overflow-hidden relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/40 to-primary/5 pointer-events-none" />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-2xl bg-green-100/60 flex items-center justify-center text-lg border border-green-200/50">
              🌿
            </div>
            <div>
              <h3 className="text-sm font-black text-foreground">Productivity Garden</h3>
              <p className="text-[10px] text-muted-foreground font-medium">Your garden grows with every task!</p>
            </div>
          </div>
        </div>

        {/* Main Plant Display */}
        <div className="flex items-center justify-center py-6">
          <div className="relative">
            <motion.div
              key={plant.emoji}
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-7xl filter drop-shadow-lg"
            >
              {plant.emoji}
            </motion.div>

            {/* Floating decorations */}
            {decorations.map((d, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -8, 0],
                  x: [0, i % 2 === 0 ? 4 : -4, 0],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.3,
                }}
                className="absolute text-2xl"
                style={{
                  top: `${20 + (i * 25) % 60}%`,
                  left: i % 2 === 0 ? `${-50 - i * 10}%` : `${110 + i * 10}%`,
                }}
              >
                {d}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Plant Status */}
        <div className="text-center mb-4">
          <p className="text-base font-black text-foreground">{plant.label}</p>
          <p className="text-[10px] font-bold text-muted-foreground">{totalTasksCompleted} tasks completed</p>
        </div>

        {/* Progress to next */}
        {nextPlant.threshold > plant.threshold && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                Next: {nextPlant.emoji} {nextPlant.label}
              </span>
              <span className="text-[9px] font-bold text-primary">
                {nextPlant.threshold - totalTasksCompleted} tasks away
              </span>
            </div>
            <div className="w-full h-2 bg-white/40 rounded-full overflow-hidden border border-white/40">
              <motion.div
                className="h-full bg-gradient-to-r from-green-400 to-primary rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressToNext}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        )}
        {nextPlant.threshold <= plant.threshold && (
          <div className="text-center py-2">
            <p className="text-xs font-black text-primary">🎉 Maximum garden unlocked!</p>
          </div>
        )}
      </div>
    </div>
  );
}
