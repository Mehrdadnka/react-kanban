// stores/xp/xp.types.ts
export type XPAction = 
  | 'task:created'
  | 'task:completed'
  | 'task:completed_early'
  | 'task:completed_on_time'
  | 'task:completed_overdue'
  | 'task:moved_to_progress'
  | 'task:priority_urgent_completed'
  | 'task:priority_high_completed'
  | 'subtask:completed'
  | 'board:created'
  | 'board:streak_daily'
  | 'board:streak_weekly'
  | 'label:organized'
  | 'attachment:added'
  | 'time:logged'
  | 'milestone:reached'
  | 'collaboration:assigned';

export const XP_VALUES: Record<XPAction, number> = {
  'task:created': 5,
  'task:completed': 25,
  'task:completed_early': 50,
  'task:completed_on_time': 35,
  'task:completed_overdue': 10,
  'task:moved_to_progress': 15,
  'task:priority_urgent_completed': 75,
  'task:priority_high_completed': 50,
  'subtask:completed': 10,
  'board:created': 30,
  'board:streak_daily': 20,
  'board:streak_weekly': 100,
  'label:organized': 5,
  'attachment:added': 5,
  'time:logged': 5,
  'milestone:reached': 50,
  'collaboration:assigned': 10,
};

export const LEVEL_TITLES = [
  { max: 5, title: '🌱 Beginner' },
  { max: 10, title: '📚 Learner' },
  { max: 20, title: '⚡ Practitioner' },
  { max: 35, title: '🎯 Expert' },
  { max: 50, title: '🏆 Master' },
  { max: 75, title: '👑 Grandmaster' },
  { max: 100, title: '🌟 Legend' },
  { max: Infinity, title: '🔮 Transcendent' },
];

export interface XPEvent {
  id: string;
  action: XPAction;
  amount: number;
  multiplier: number;
  finalAmount: number;
  context: {
    taskId?: string;
    boardId?: string;
    taskPriority?: string;
    timestamp: Date;
  };
  timestamp: Date;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requiredAction: XPAction;
  requiredCount: number;
  currentCount: number;
  completed: boolean;
  completedAt?: Date;
  rewards: {
    xp: number;
    badge?: string;
    perk?: string;
  };
}

export interface XPState {
  totalXP: number;
  currentLevel: number;
  xpToNextLevel: number;
  levelProgress: number;
  levelTitle: string;
  events: XPEvent[];
  activeMultipliers: Map<string, number>;
  streak: {
    current: number;
    longest: number;
    lastActiveDate: Date | null;
  };
  achievements: Achievement[];
  dailyXP: Map<string, number>;
  
  addXP: (action: XPAction, context?: Partial<XPEvent['context']>) => void;
  getAchievements: () => Achievement[];
  activateMultiplier: (id: string, factor: number, durationMs?: number) => void;
  deactivateMultiplier: (id: string) => void;
 
  resetXP: () => void;
  calculateLevel: (totalXP: number) => {
    level: number;
    currentXP: number;
    xpToNextLevel: number;
    progress: number;
    title: string;
  };
    getLevelInfo: () => { level: number; progress: number; title: string; nextLevelXP: number }
}
