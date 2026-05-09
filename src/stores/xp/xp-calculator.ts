// stores/xp/xp-calculator.ts
import { XPAction, XP_VALUES } from './xp.types';

// Level formula: Quadratic growth
// Level 1: 0-100 XP
// Level 2: 100-300 XP
// Level 3: 300-600 XP
// Level n: needs (n * 100) more XP than previous
export const calculateLevel = (totalXP: number) => {
  let level = 1;
  let xpRequired = 0;
  let xpForCurrentLevel = 100;
  
  while (totalXP >= xpRequired + xpForCurrentLevel) {
    xpRequired += xpForCurrentLevel;
    level++;
    xpForCurrentLevel = level * 100 + (level - 1) * 50; // Quadratic scaling
  }
  
  const currentLevelXP = totalXP - xpRequired;
  const xpToNextLevel = xpForCurrentLevel;
  const progress = Math.round((currentLevelXP / xpToNextLevel) * 100);
  
  return {
    level,
    currentXP: currentLevelXP,
    xpToNextLevel,
    totalXP,
    progress,
    title: getLevelTitle(level),
  };
};

export const getLevelTitle = (level: number): string => {
  const titles = [
    { max: 5, title: '🌱 Beginner' },
    { max: 10, title: '📚 Learner' },
    { max: 20, title: '⚡ Practitioner' },
    { max: 35, title: '🎯 Expert' },
    { max: 50, title: '🏆 Master' },
    { max: 75, title: '👑 Grandmaster' },
    { max: 100, title: '🌟 Legend' },
    { max: Infinity, title: '🔮 Transcendent' },
  ];
  
  return titles.find(t => level <= t.max)?.title || '🌱 Beginner';
};

// XP Multiplier Chain
export const calculateMultipliers = (
  activeMultipliers: Map<string, number>,
  context?: {
    taskPriority?: string;
    isEarly?: boolean;
    isOnTime?: boolean;
  }
): number => {
  let multiplier = 1.0;
  
  // Active multipliers (from power-ups, events, etc.)
  activeMultipliers.forEach((factor) => {
    multiplier *= factor;
  });
  
  // Bonus multipliers based on context
  if (context?.taskPriority === 'urgent') multiplier *= 1.5;
  if (context?.taskPriority === 'high') multiplier *= 1.25;
  if (context?.isEarly) multiplier *= 1.5;  // Early completion bonus
  if (context?.isOnTime) multiplier *= 1.2; // On-time bonus
  
  return multiplier;
};

// Achievement Definitions
export const ACHIEVEMENT_DEFINITIONS: AchievementDefinition[] = [
  {
    id: 'first-task',
    name: 'First Steps',
    description: 'Complete your first task',
    icon: '🎯',
    requiredAction: 'task:completed',
    requiredCount: 1,
    rewards: { xp: 50, badge: 'beginner' },
  },
  {
    id: 'task-master-10',
    name: 'Task Master',
    description: 'Complete 10 tasks',
    icon: '⭐',
    requiredAction: 'task:completed',
    requiredCount: 10,
    rewards: { xp: 150, badge: 'productive' },
  },
  {
    id: 'task-warrior-50',
    name: 'Task Warrior',
    description: 'Complete 50 tasks',
    icon: '⚔️',
    requiredAction: 'task:completed',
    requiredCount: 50,
    rewards: { xp: 500, perk: 'double-xp-1h' },
  },
  {
    id: 'task-legend-100',
    name: 'Legendary Completionist',
    description: 'Complete 100 tasks',
    icon: '👑',
    requiredAction: 'task:completed',
    requiredCount: 100,
    rewards: { xp: 2000, badge: 'legend', perk: 'custom-theme' },
  },
  {
    id: 'streak-7',
    name: 'Week Warrior',
    description: '7-day activity streak',
    icon: '🔥',
    requiredAction: 'board:streak_daily',
    requiredCount: 7,
    rewards: { xp: 200, badge: 'consistent' },
  },
  {
    id: 'streak-30',
    name: 'Monthly Dedication',
    description: '30-day activity streak',
    icon: '🌙',
    requiredAction: 'board:streak_daily',
    requiredCount: 30,
    rewards: { xp: 1000, perk: 'permanent-1.1x' },
  },
  {
    id: 'board-creator-5',
    name: 'Board Architect',
    description: 'Create 5 boards',
    icon: '🏗️',
    requiredAction: 'board:created',
    requiredCount: 5,
    rewards: { xp: 300 },
  },
];