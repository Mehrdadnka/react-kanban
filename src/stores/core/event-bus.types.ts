// stores/core/event-bus.types.ts - COMPLETE REWRITE
export type ModuleScope = 'system' | 'board' | 'task' | 'column' | 'sidebar' | 'dashboard' | 'xp';

export type Priority = 0 | 10 | 50 | 100;

// 🎯 COMPLETE EVENT CATALOG
export interface EventCatalog {
  // System Events
  'system:boot': void;
  'system:error': { error: Error; source: string };
  'system:daily_check': void;
  
  // Board Events
  'board:created': { id: string; title: string };
  'board:deleted': { id: string };
  'board:updated': { id: string; changes: Record<string, unknown> };
  
  // Task Events
  'task:created': { id: string; boardId: string; columnId: string; title: string };
  'task:completed': { id: string; boardId: string };
  'task:moved': { id: string; from: string; to: string; boardId: string };
  'task:updated': { id: string; changes: Record<string, unknown> };
  'task:deleted': { id: string; boardId: string };
  'task:bulk-moved': { taskIds: string[]; targetColumnId: string };
  'task:bulk-deleted': { taskIds: string[] };
  'task:time_logged': { taskId: string; hours: number };
  
  // Column Events
  'column:created': { id: string };
  'column:deleted': { id: string };
  'column:updated': { id: string; changes: Record<string, unknown> };
  
  // Sidebar Events
  'sidebar:opened': { panelId: string };
  'sidebar:closed': { panelId: string };
  'sidebar:open-request': { panelId: string; context?: Record<string, unknown> };
  'sidebar:close-request': { panelId: string };
  
  // XP System Events
  'xp:gained': { 
    action: string; 
    amount: number; 
    totalXP: number; 
    level: number;
    levelProgress: number;
  };
  'xp:level_up': { 
    oldLevel: number; 
    newLevel: number; 
    title: string;
  };
  'xp:achievement_unlocked': { 
    achievementId: string; 
    name: string; 
    rewards: { xp: number; badge?: string; perk?: string };
  };

  // Challenge Events
  'challenges:generated': { count: number; totalReward: number };
  'challenge:completed': { challengeId: string; title: string; reward: number };
  'challenge:claimed': { challengeId: string; reward: number };
  
  // PowerUp Events
  'powerup:used': { powerUpId: string; effect: { type: string; value: number } };
  'powerup:unlocked': { powerUpId: string; name: string };
  'powerup:purchased': { powerUpId: string; name: string; price: number }; 
}

export type EventName = keyof EventCatalog;

export interface EventEntry {
  id: string;
  name: EventName;
  payload: unknown;
  timestamp: number;
  reversible?: boolean;
}

export interface ListenerConfig<T = unknown> {
  id: string;
  priority: Priority;
  handler: (payload: T) => void | Promise<void>;
  scope?: ModuleScope;
}

export interface EventBusState {
  listeners: Map<EventName, ListenerConfig[]>;
  history: EventEntry[];
  
  on: <K extends EventName>(
    event: K,
    handler: (payload: EventCatalog[K]) => void | Promise<void>,
    options?: { priority?: Priority; scope?: ModuleScope }
  ) => string;
  
  once: <K extends EventName>(
    event: K,
    handler: (payload: EventCatalog[K]) => void | Promise<void>,
    options?: { priority?: Priority; scope?: ModuleScope }
  ) => string;
  
  off: (listenerId: string) => void;
  
  emit: <K extends EventName>(
    event: K,
    ...args: EventCatalog[K] extends void ? [] : [payload: EventCatalog[K]]
  ) => void;
  
  emitAsync: <K extends EventName>(
    event: K,
    ...args: EventCatalog[K] extends void ? [] : [payload: EventCatalog[K]]
  ) => Promise<void>;
  
  getHistory: () => EventEntry[];
  clearHistory: () => void;
  debug: () => { listeners: Record<string, number>; historyCount: number };
}