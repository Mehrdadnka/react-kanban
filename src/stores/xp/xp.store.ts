// stores/xp/xp.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useEventBus } from '@/stores/core/event-bus.store';
import { XPState, XPAction, XPEvent, Achievement, XP_VALUES, LEVEL_TITLES } from './xp.types';

// ──── Achievement Definitions ────
const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    requiredAction: 'task:completed' as XPAction,
    requiredCount: 1,
    rewards: { xp: 50, badge: 'beginner' },
  },
  {
    id: 'task-master-10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⭐',
    requiredAction: 'task:completed' as XPAction,
    requiredCount: 10,
    rewards: { xp: 150, badge: 'productive' },
  },
  {
    id: 'task-warrior-50',
    name: 'Task Warrior',
    description: 'Complete 50 tasks',
    icon: '⚔️',
    requiredAction: 'task:completed' as XPAction,
    requiredCount: 50,
    rewards: { xp: 500, perk: 'double-xp-1h' },
  },
  {
    id: 'task-legend-100',
    name: 'Legendary',
    description: 'Complete 100 tasks',
    icon: '👑',
    requiredAction: 'task:completed' as XPAction,
    requiredCount: 100,
    rewards: { xp: 2000, badge: 'legend', perk: 'custom-theme' },
  },
  {
    id: 'board-creator-5',
    name: 'Board Architect',
    description: 'Create 5 boards',
    icon: '🏗️',
    requiredAction: 'board:created' as XPAction,
    requiredCount: 5,
    rewards: { xp: 300 },
  },
  {
    id: 'early-bird-10',
    name: 'Early Bird',
    description: 'Complete 10 tasks before due date',
    icon: '🐦',
    requiredAction: 'task:completed_early' as XPAction,
    requiredCount: 10,
    rewards: { xp: 400, badge: 'efficient' },
  },
];

// ──── Level Calculator ────
const calculateLevel = (totalXP: number) => {
  let level = 1;
  let xpRequired = 0;
  let xpForCurrentLevel = 100;
  
  while (totalXP >= xpRequired + xpForCurrentLevel) {
    xpRequired += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = level * 100 + (level - 1) * 50;
  }
  
  const currentLevelXP = totalXP - xpRequired;
  const progress = Math.min(100, Math.round((currentLevelXP / xpForCurrentLevel) * 100));
  const title = LEVEL_TITLES.find(t => level <= t.max)?.title || '🌱 Beginner';
  
  return {
    level,
    currentXP: currentLevelXP,
    xpToNextLevel: xpForCurrentLevel,
    progress,
    title,
  };
};

// ──── Multiplier Calculator ────
const calculateMultiplier = (activeMultipliers: Map<string, number>, action: XPAction): number => {
  let multiplier = 1.0;
  
  // Apply active multipliers
  activeMultipliers.forEach((factor) => {
    multiplier *= factor;
  });
  
  // Bonus for urgent/high priority (handled in context)
  if (action.includes('urgent')) multiplier *= 1.5;
  if (action.includes('high')) multiplier *= 1.25;
  
  return multiplier;
};

// ──── XP Store ────
export const useXPStore = create<XPState>()(
  persist(
    (set, get) => ({
      totalXP: 0,
      currentLevel: 1,
      xpToNextLevel: 100,
      levelProgress: 0,
      levelTitle: '🌱 Beginner',
      events: [],
      activeMultipliers: new Map(),
      
      streak: {
        current: 0,
        longest: 0,
        lastActiveDate: null,
      },
      
      achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
        ...def,
        currentCount: 0,
        completed: false,
      })),
      
      dailyXP: new Map(),
      
      addXP: (action, context = {}) => {
        const state = get();
        const baseXP = XP_VALUES[action];
        const multiplier = calculateMultiplier(state.activeMultipliers, action);
        const finalAmount = Math.round(baseXP * multiplier);
        
        // Create XP event
        const event: XPEvent = {
          id: uuidv4(),
          action,
          amount: baseXP,
          multiplier,
          finalAmount,
          context: {
            ...context,
            timestamp: new Date(),
          },
          timestamp: new Date(),
        };
        
        const newTotalXP = state.totalXP + finalAmount;
        const levelInfo = calculateLevel(newTotalXP);
        
        // Update daily XP
        const today = new Date().toDateString();
        const newDailyXP = new Map(state.dailyXP);
        newDailyXP.set(today, (newDailyXP.get(today) || 0) + finalAmount);
        
        // Check achievements
        const updatedAchievements = state.achievements.map(achievement => {
          if (achievement.completed || achievement.requiredAction !== action) {
            return achievement;
          }
          
          const newCount = achievement.currentCount + 1;
          const completed = newCount >= achievement.requiredCount;
          
          if (completed && !achievement.completed) {
            // Grant achievement XP bonus
            setTimeout(() => {
              const xpStore = get();
              xpStore.addXP('milestone:reached', { 
                taskId: achievement.id,
                boardId: 'system'
              });
              
              useEventBus.getState().emit('xp:achievement_unlocked', {
                achievementId: achievement.id,
                name: achievement.name,
                rewards: achievement.rewards,
              });
            }, 100);
          }
          
          return {
            ...achievement,
            currentCount: newCount,
            completed,
            completedAt: completed ? new Date() : achievement.completedAt,
          };
        });
        
        set({
          totalXP: newTotalXP,
          currentLevel: levelInfo.level,
          xpToNextLevel: levelInfo.xpToNextLevel,
          levelProgress: levelInfo.progress,
          levelTitle: levelInfo.title,
          events: [...state.events, event].slice(-500),
          achievements: updatedAchievements,
          dailyXP: newDailyXP,
        });
        
        // Emit XP gained event
        useEventBus.getState().emit('xp:gained', {
          action,
          amount: finalAmount,
          totalXP: newTotalXP,
          level: levelInfo.level,
          levelProgress: levelInfo.progress,
        });
        
        // Check level up
        if (levelInfo.level > state.currentLevel) {
          useEventBus.getState().emit('xp:level_up', {
            oldLevel: state.currentLevel,
            newLevel: levelInfo.level,
            title: levelInfo.title,
          });
          
          // Celebrate with confetti (optional)
          console.log(`🎉 LEVEL UP! ${levelInfo.title} (Level ${levelInfo.level})`);
        }
      },
      
      getAchievements: () => get().achievements,
      
      calculateLevel: (totalXP) => {
        let level = 1;
        let xpRequired = 0;
        let xpForCurrentLevel = 100;
        
        while (totalXP >= xpRequired + xpForCurrentLevel) {
          xpRequired += xpForCurrentLevel;
          level++;
          xpForCurrentLevel = level * 100 + (level - 1) * 50;
        }
        
        const currentLevelXP = totalXP - xpRequired;
        const progress = Math.min(100, Math.round((currentLevelXP / xpForCurrentLevel) * 100));
        const title = LEVEL_TITLES.find(t => level <= t.max)?.title || '🌱 Beginner';
        
        return {
          level,
          currentXP: currentLevelXP,
          xpToNextLevel: xpForCurrentLevel,
          progress,
          title,
        };
      },
      
      getLevelInfo: () => {
        const { currentLevel, levelProgress, levelTitle, xpToNextLevel } = get();
        return {
          level: currentLevel,
          progress: levelProgress,
          title: levelTitle,
          nextLevelXP: xpToNextLevel,
        };
      },
      
      activateMultiplier: (id, factor, durationMs) => {
        set((state) => {
          const newMultipliers = new Map(state.activeMultipliers);
          newMultipliers.set(id, factor);
          return { activeMultipliers: newMultipliers };
        });
        
        if (durationMs) {
          setTimeout(() => {
            get().deactivateMultiplier(id);
          }, durationMs);
        }
        
        console.log(`⚡ Multiplier activated: ${factor}x for ${durationMs ? durationMs/1000 + 's' : 'permanent'}`);
      },
      
      deactivateMultiplier: (id) => {
        set((state) => {
          const newMultipliers = new Map(state.activeMultipliers);
          newMultipliers.delete(id);
          return { activeMultipliers: newMultipliers };
        });
      },
      
      resetXP: () => {
        set({
          totalXP: 0,
          currentLevel: 1,
          xpToNextLevel: 100,
          levelProgress: 0,
          levelTitle: '🌱 Beginner',
          events: [],
          activeMultipliers: new Map(),
          streak: { current: 0, longest: 0, lastActiveDate: null },
          achievements: ACHIEVEMENT_DEFINITIONS.map(def => ({
            ...def,
            currentCount: 0,
            completed: false,
          })),
          dailyXP: new Map(),
        });
      },
    }),
    {
      name: 'xp-store',
      version: 1,
      partialize: (state) => ({
        totalXP: state.totalXP,
        currentLevel: state.currentLevel,
        xpToNextLevel: state.xpToNextLevel,
        levelProgress: state.levelProgress,
        levelTitle: state.levelTitle,
        achievements: state.achievements,
        streak: state.streak,
        dailyXP: Array.from(state.dailyXP.entries()),
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as any),
        dailyXP: new Map((persisted as any)?.dailyXP || []),
        activeMultipliers: new Map(),
        events: [],
      }),
    }
  )
);
if (typeof window !== 'undefined') {
  (window as any).__xpStore = useXPStore;
  console.log('✅ XP Store ready at window.__xpStore');
}
