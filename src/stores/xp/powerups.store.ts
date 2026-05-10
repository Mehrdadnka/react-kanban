// stores/xp/powerups.store.ts - UPDATED
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
  price: number; // 🆕 XP cost
  effect: {
    type: 'multiplier' | 'streak_freeze' | 'xp_boost' | 'instant_xp';
    value: number;
  };
  duration: number;
  cooldown: number;
  quantity: number;
  unlocked: boolean;
  unlockRequirement: {
    level?: number;
    achievement?: string;
  };
}

interface PowerUpState {
  powerups: PowerUp[];
  
  // Shop
  purchasePowerUp: (powerUpId: string) => { success: boolean; message: string };
  usePowerUp: (powerUpId: string) => boolean;
  
  // Active effects
  activeBoosts: Array<{ powerUpId: string; expiresAt: Date; multiplier: number }>;
  
  // Inventory
  getAvailablePowerUps: () => PowerUp[];
  getShopPowerUps: () => PowerUp[];
  
  // Unlocks
  checkUnlocks: () => void;
}

const POWERUP_DEFINITIONS: Omit<PowerUp, 'quantity'>[] = [
  {
    id: 'xp-bomb-small',
    name: 'XP Bomb',
    description: 'Instantly gain 50 XP',
    icon: '💣',
    price: 100, // Costs 100 XP
    effect: { type: 'instant_xp', value: 50 },
    duration: 0,
    cooldown: 0,
    unlocked: true, // Available from start
    unlockRequirement: {},
  },
  {
    id: 'double-xp-30m',
    name: 'Double XP (30min)',
    description: '2× XP for 30 minutes',
    icon: '⚡',
    price: 200,
    effect: { type: 'multiplier', value: 2.0 },
    duration: 1800000, // 30 min
    cooldown: 3600000, // 1 hour cooldown
    unlocked: false,
    unlockRequirement: { level: 5 },
  },
  {
    id: 'xp-magnet-1h',
    name: 'XP Magnet',
    description: '+25% bonus XP for 1 hour',
    icon: '🧲',
    price: 300,
    effect: { type: 'xp_boost', value: 0.25 },
    duration: 3600000, // 1 hour
    cooldown: 7200000, // 2 hour cooldown
    unlocked: false,
    unlockRequirement: { level: 8 },
  },
  {
    id: 'streak-shield',
    name: 'Streak Shield',
    description: 'Protect your streak for 24h',
    icon: '🛡️',
    price: 500,
    effect: { type: 'streak_freeze', value: 1 },
    duration: 86400000, // 24 hours
    cooldown: 259200000, // 3 days
    unlocked: false,
    unlockRequirement: { achievement: 'task-master-10' },
  },
  {
    id: 'triple-xp-15m',
    name: 'Triple XP Shot',
    description: '3× XP for 15 minutes',
    icon: '🔥',
    price: 500,
    effect: { type: 'multiplier', value: 3.0 },
    duration: 900000, // 15 min
    cooldown: 7200000, // 2 hour cooldown
    unlocked: false,
    unlockRequirement: { level: 12 },
  },
  {
    id: 'mega-xp-bomb',
    name: 'Mega XP Bomb',
    description: 'Instantly gain 200 XP',
    icon: '💥',
    price: 350,
    effect: { type: 'instant_xp', value: 200 },
    duration: 0,
    cooldown: 0,
    unlocked: false,
    unlockRequirement: { level: 10 },
  },
];

export const usePowerUpStore = create<PowerUpState>()(
  persist(
    (set, get) => ({
      powerups: POWERUP_DEFINITIONS.map(p => ({ ...p, quantity: 0 })),
      activeBoosts: [],

      // Purchase with XP
      purchasePowerUp: (powerUpId) => {
        const powerup = get().powerups.find(p => p.id === powerUpId);
        if (!powerup) return { success: false, message: 'Power-up not found' };
        if (!powerup.unlocked) return { success: false, message: 'Not unlocked yet!' };
        
        const xpStore = useXPStore.getState();
        
        // Check if user has enough XP
        if (xpStore.totalXP < powerup.price) {
          return { 
            success: false, 
            message: `Need ${powerup.price - xpStore.totalXP} more XP!` 
          };
        }
        
        // Deduct XP (by adding negative... jk, we just track it)
        // Actually, let's create a spend function
        // For now: reduce XP manually
        xpStore.addXP('milestone:reached', { 
          taskId: `purchase-${powerUpId}`,
          boardId: 'shop'
        });
        
        
        const spent = xpStore.spendXP(powerup.price, `Purchased ${powerup.name}`);
        if (!spent) return { success: false, message: 'Transaction failed' };
        // Quick workaround: we'll track purchases separately
        
        set(state => ({
          powerups: state.powerups.map(p =>
            p.id === powerUpId
              ? { ...p, quantity: p.quantity + 1 }
              : p
          ),
        }));
        
        useEventBus.getState().emit('powerup:purchased', {
          powerUpId,
          name: powerup.name,
          price: powerup.price,
        });
        
        return { success: true, message: `Purchased ${powerup.name}!` };
      },

      // Use power-up
      usePowerUp: (powerUpId) => {
        const powerup = get().powerups.find(p => p.id === powerUpId);
        if (!powerup || powerup.quantity <= 0) return false;
        
        const xpStore = useXPStore.getState();
        
        switch (powerup.effect.type) {
          case 'multiplier':
          case 'xp_boost':
            const factor = powerup.effect.type === 'xp_boost' 
              ? 1 + powerup.effect.value 
              : powerup.effect.value;
            
            xpStore.activateMultiplier(powerUpId, factor, powerup.duration);
            
            // Track active boost
            set(state => ({
              activeBoosts: [...state.activeBoosts, {
                powerUpId,
                expiresAt: new Date(Date.now() + powerup.duration),
                multiplier: factor,
              }],
            }));
            break;
            
          case 'instant_xp':
            // Grant XP directly
            xpStore.addXP('milestone:reached', {
              taskId: powerUpId,
              boardId: 'shop',
            });
            // Add extra XP equal to effect value
            const bonusTimes = Math.floor(powerup.effect.value / 50);
            for (let i = 0; i < bonusTimes; i++) {
              setTimeout(() => {
                xpStore.addXP('milestone:reached', {
                  taskId: `${powerUpId}-bonus-${i}`,
                  boardId: 'shop',
                });
              }, i * 50);
            }
            break;
            
          case 'streak_freeze':
            localStorage.setItem('streak-frozen', 'true');
            localStorage.setItem('streak-frozen-expiry', 
              String(Date.now() + powerup.duration));
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
        
        useEventBus.getState().emit('powerup:used', {
          powerUpId,
          effect: powerup.effect,
        });
        
        return true;
      },

      getAvailablePowerUps: () => {
        return get().powerups.filter(p => p.quantity > 0);
      },

      getShopPowerUps: () => {
        return get().powerups.filter(p => p.unlocked);
      },

      checkUnlocks: () => {
        const xpStore = useXPStore.getState();
        const currentLevel = xpStore.currentLevel;
        const achievements = xpStore.getAchievements();
        
        set(state => ({
          powerups: state.powerups.map(p => {
            if (p.unlocked) return p;
            
            const req = p.unlockRequirement;
            let shouldUnlock = false;
            
            if (req.level && currentLevel >= req.level) {
              shouldUnlock = true;
            }
            
            if (req.achievement) {
              const ach = achievements.find(a => a.id === req.achievement);
              if (ach?.completed) {
                shouldUnlock = true;
              }
            }
            
            if (shouldUnlock) {
              useEventBus.getState().emit('powerup:unlocked', {
                powerUpId: p.id,
                name: p.name,
              });
              
              return { ...p, unlocked: true, quantity: 1 }; // Free first one!
            }
            
            return p;
          }),
        }));
      },
    }),
    {
      name: 'powerups-store-v2',
      partialize: (state) => ({
        powerups: state.powerups,
        activeBoosts: state.activeBoosts.filter(
          b => new Date(b.expiresAt) > new Date()
        ),
      }),
    }
  )
);

// 🎯 Wire checkUnlocks to level up
if (typeof window !== 'undefined') {
  (window as any).__powerUpStore = usePowerUpStore;
  
  // Listen for level ups to check unlocks
  const eventBus = useEventBus.getState();
  eventBus.on('xp:level_up', () => {
    usePowerUpStore.getState().checkUnlocks();
  }, { priority: 50 });
}