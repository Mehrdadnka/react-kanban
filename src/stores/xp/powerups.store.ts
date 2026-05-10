import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useXPStore } from './xp.store';
import { useEventBus } from '@/stores/core/event-bus.store';

export interface PowerUp {
  id: string;
  name: string;
  description: string;
  icon: string;
  effect: {
    type: 'multiplier' | 'streak_freeze' | 'xp_boost' | 'instant_xp';
    value: number;
  };
  duration: number; // ms (0 = instant)
  cooldown: number; // ms (0 = one-time use)
  quantity: number;
  unlocked: boolean;
  unlockRequirement: {
    level?: number;
    achievement?: string;
  };
}

interface PowerUpState {
  powerups: PowerUp[];
  
  usePowerUp: (powerUpId: string) => boolean;
  purchasePowerUp: (powerUpId: string) => boolean;
  getAvailablePowerUps: () => PowerUp[];
  checkUnlocks: () => void;
}

// Power-up definitions
const POWERUP_DEFINITIONS: Omit<PowerUp, 'quantity'>[] = [
  {
    id: 'double-xp-1h',
    name: 'Double XP Boost',
    description: '2× XP for 1 hour',
    icon: '⚡',
    effect: { type: 'multiplier', value: 2.0 },
    duration: 3600000, // 1 hour
    cooldown: 7200000, // 2 hour cooldown
    unlocked: false,
    unlockRequirement: { level: 5 },
  },
  {
    id: 'xp-bomb',
    name: 'XP Bomb',
    description: 'Instantly gain 100 XP',
    icon: '💣',
    effect: { type: 'instant_xp', value: 100 },
    duration: 0, // instant
    cooldown: 0,
    unlocked: false,
    unlockRequirement: { level: 3 },
  },
  {
    id: 'streak-shield',
    name: 'Streak Shield',
    description: 'Protects your streak if you miss a day',
    icon: '🛡️',
    effect: { type: 'streak_freeze', value: 1 },
    duration: 86400000, // 24 hours
    cooldown: 259200000, // 3 day cooldown
    unlocked: false,
    unlockRequirement: { achievement: 'streak-7' },
  },
  {
    id: 'triple-xp-30m',
    name: 'Triple XP Shot',
    description: '3× XP for 30 minutes',
    icon: '🔥',
    effect: { type: 'multiplier', value: 3.0 },
    duration: 1800000, // 30 min
    cooldown: 14400000, // 4 hour cooldown
    unlocked: false,
    unlockRequirement: { level: 15 },
  },
  {
    id: 'xp-magnet',
    name: 'XP Magnet',
    description: '+25% bonus XP on all actions for 2 hours',
    icon: '🧲',
    effect: { type: 'xp_boost', value: 0.25 },
    duration: 7200000, // 2 hours
    cooldown: 21600000, // 6 hour cooldown
    unlocked: false,
    unlockRequirement: { level: 10 },
  },
  {
    id: 'mega-xp-bomb',
    name: 'Mega XP Bomb',
    description: 'Instantly gain 500 XP',
    icon: '💥',
    effect: { type: 'instant_xp', value: 500 },
    duration: 0,
    cooldown: 0,
    unlocked: false,
    unlockRequirement: { level: 20 },
  },
];

export const usePowerUpStore = create<PowerUpState>()(
  persist(
    (set, get) => ({
      powerups: POWERUP_DEFINITIONS.map(p => ({ ...p, quantity: 0 })),
      
      usePowerUp: (powerUpId) => {
        const powerup = get().powerups.find(p => p.id === powerUpId);
        if (!powerup || powerup.quantity <= 0 || !powerup.unlocked) return false;
        
        const xpStore = useXPStore.getState();
        
        switch (powerup.effect.type) {
          case 'multiplier':
            xpStore.activateMultiplier(powerUpId, powerup.effect.value, powerup.duration);
            break;
            
          case 'xp_boost':
            xpStore.activateMultiplier(powerUpId, 1 + powerup.effect.value, powerup.duration);
            break;
            
          case 'instant_xp':
            xpStore.addXP('milestone:reached', {
              taskId: powerUpId,
              boardId: 'powerups',
            });
            // Add bonus XP equal to the effect value
            for (let i = 0; i < powerup.effect.value / 50; i++) {
              xpStore.addXP('milestone:reached', {
                taskId: `${powerUpId}-${i}`,
                boardId: 'powerups',
              });
            }
            break;
            
          case 'streak_freeze':
            // Streak freeze logic is handled by streak system
            localStorage.setItem('streak-frozen', 'true');
            break;
        }
        
        // Decrease quantity
        set(state => ({
          powerups: state.powerups.map(p =>
            p.id === powerUpId
              ? { ...p, quantity: p.quantity - 1 }
              : p
          ),
        }));
        
        // Emit event
        useEventBus.getState().emit('powerup:used', {
          powerUpId,
          effect: powerup.effect,
        });
        
        return true;
      },
      
      purchasePowerUp: (powerUpId) => {
        const powerup = get().powerups.find(p => p.id === powerUpId);
        if (!powerup || !powerup.unlocked) return false;
        
        // TODO: Add currency system
        // For now, just add quantity for testing
        set(state => ({
          powerups: state.powerups.map(p =>
            p.id === powerUpId
              ? { ...p, quantity: p.quantity + 1 }
              : p
          ),
        }));
        
        return true;
      },
      
      getAvailablePowerUps: () => {
        return get().powerups.filter(p => p.unlocked && p.quantity > 0);
      },
      
      checkUnlocks: () => {
        const xpStore = useXPStore.getState();
        const currentLevel = xpStore.currentLevel;
        const achievements = xpStore.getAchievements();
        // const { level, achievements } = xpStore;
        
        set(state => ({
          powerups: state.powerups.map(p => {
            let unlocked = p.unlocked;
            
            if (!unlocked) {
              const req = p.unlockRequirement;
              
              if (req.level && currentLevel >= req.level) {
                unlocked = true;
              }
              
              if (req.achievement) {
                const ach = achievements.find(a => a.id === req.achievement);
                if (ach?.completed) {
                  unlocked = true;
                }
              }
              
              // Grant 1 free quantity on first unlock
              if (unlocked && !p.unlocked) {
                useEventBus.getState().emit('powerup:unlocked', {
                  powerUpId: p.id,
                  name: p.name,
                });
                
                return { ...p, unlocked: true, quantity: p.quantity + 1 };
              }
            }
            
            return { ...p, unlocked };
          }),
        }));
      },
    }),
    {
      name: 'powerups-store',
      partialize: (state) => ({
        powerups: state.powerups,
      }),
    }
  )
);

if (typeof window !== 'undefined') {
  (window as any).__powerUpStore = usePowerUpStore;
}