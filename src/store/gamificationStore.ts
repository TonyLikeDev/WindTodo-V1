import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: Date;
}

const ACHIEVEMENTS: Achievement[] = [
  { id: 'first_task', title: 'First Step', description: 'Complete your first task', icon: '🌱' },
  { id: 'streak_3', title: 'On Fire', description: '3-day streak', icon: '🔥' },
  { id: 'streak_7', title: 'Week Warrior', description: '7-day streak', icon: '⚡' },
  { id: 'streak_30', title: 'Iron Will', description: '30-day streak', icon: '💎' },
  { id: 'tasks_10', title: 'Getting Things Done', description: 'Complete 10 tasks', icon: '✅' },
  { id: 'tasks_50', title: 'Productivity Pro', description: 'Complete 50 tasks', icon: '🚀' },
  { id: 'tasks_100', title: 'Century Club', description: 'Complete 100 tasks', icon: '🏆' },
  { id: 'focus_5', title: 'Deep Work', description: 'Complete 5 Pomodoro sessions', icon: '🧘' },
  { id: 'mood_happy', title: 'Good Vibes', description: 'Log a happy mood', icon: '😊' },
  { id: 'level_5', title: 'Rising Star', description: 'Reach Level 5', icon: '⭐' },
  { id: 'level_10', title: 'Productivity Master', description: 'Reach Level 10', icon: '👑' },
];

export const XP_PER_LEVEL = 100;

export function getLevel(xp: number) {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function getXpProgress(xp: number) {
  return xp % XP_PER_LEVEL;
}

export function getLevelTitle(level: number) {
  if (level < 3) return 'Seedling';
  if (level < 6) return 'Explorer';
  if (level < 10) return 'Achiever';
  if (level < 15) return 'Pro Planner';
  if (level < 20) return 'Flow Master';
  if (level < 30) return 'Productivity Sage';
  return 'Legendary';
}

interface GamificationState {
  xp: number;
  totalTasksCompleted: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  unlockedAchievements: string[];
  pomodoroSessions: number;
  newAchievement: Achievement | null;

  addXP: (amount: number) => void;
  completeTask: () => void;
  completePomodoro: () => void;
  dismissNewAchievement: () => void;
  checkAndUpdateStreak: () => void;
}

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xp: 0,
      totalTasksCompleted: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastActivityDate: null,
      unlockedAchievements: [],
      pomodoroSessions: 0,
      newAchievement: null,

      addXP: (amount) => {
        set((state) => ({ xp: state.xp + amount }));
      },

      checkAndUpdateStreak: () => {
        const today = new Date().toDateString();
        const state = get();
        if (state.lastActivityDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = state.lastActivityDate === yesterday.toDateString();

        const newStreak = wasYesterday ? state.currentStreak + 1 : 1;
        const longest = Math.max(newStreak, state.longestStreak);

        set({ currentStreak: newStreak, longestStreak: longest, lastActivityDate: today });

        // Check streak achievements
        const unlocked = [...state.unlockedAchievements];
        let newAch: Achievement | null = null;
        if (newStreak >= 3 && !unlocked.includes('streak_3')) {
          unlocked.push('streak_3');
          newAch = ACHIEVEMENTS.find(a => a.id === 'streak_3')!;
        }
        if (newStreak >= 7 && !unlocked.includes('streak_7')) {
          unlocked.push('streak_7');
          newAch = ACHIEVEMENTS.find(a => a.id === 'streak_7')!;
        }
        if (newStreak >= 30 && !unlocked.includes('streak_30')) {
          unlocked.push('streak_30');
          newAch = ACHIEVEMENTS.find(a => a.id === 'streak_30')!;
        }
        set({ unlockedAchievements: unlocked, newAchievement: newAch });
      },

      completeTask: () => {
        const state = get();
        const newTotal = state.totalTasksCompleted + 1;
        const newXP = state.xp + 15;
        const newLevel = getLevel(newXP);
        const unlocked = [...state.unlockedAchievements];
        let newAch: Achievement | null = null;

        if (!unlocked.includes('first_task')) {
          unlocked.push('first_task');
          newAch = ACHIEVEMENTS.find(a => a.id === 'first_task')!;
        }
        if (newTotal >= 10 && !unlocked.includes('tasks_10')) {
          unlocked.push('tasks_10');
          newAch = ACHIEVEMENTS.find(a => a.id === 'tasks_10')!;
        }
        if (newTotal >= 50 && !unlocked.includes('tasks_50')) {
          unlocked.push('tasks_50');
          newAch = ACHIEVEMENTS.find(a => a.id === 'tasks_50')!;
        }
        if (newTotal >= 100 && !unlocked.includes('tasks_100')) {
          unlocked.push('tasks_100');
          newAch = ACHIEVEMENTS.find(a => a.id === 'tasks_100')!;
        }
        if (newLevel >= 5 && !unlocked.includes('level_5')) {
          unlocked.push('level_5');
          newAch = ACHIEVEMENTS.find(a => a.id === 'level_5')!;
        }
        if (newLevel >= 10 && !unlocked.includes('level_10')) {
          unlocked.push('level_10');
          newAch = ACHIEVEMENTS.find(a => a.id === 'level_10')!;
        }

        set({
          xp: newXP,
          totalTasksCompleted: newTotal,
          unlockedAchievements: unlocked,
          newAchievement: newAch,
        });
        get().checkAndUpdateStreak();
      },

      completePomodoro: () => {
        const state = get();
        const newSessions = state.pomodoroSessions + 1;
        const unlocked = [...state.unlockedAchievements];
        let newAch: Achievement | null = null;
        if (newSessions >= 5 && !unlocked.includes('focus_5')) {
          unlocked.push('focus_5');
          newAch = ACHIEVEMENTS.find(a => a.id === 'focus_5')!;
        }
        set({
          pomodoroSessions: newSessions,
          xp: state.xp + 25,
          unlockedAchievements: unlocked,
          newAchievement: newAch,
        });
      },

      dismissNewAchievement: () => set({ newAchievement: null }),
    }),
    { name: 'skytodo-gamification' }
  )
);

export { ACHIEVEMENTS };
