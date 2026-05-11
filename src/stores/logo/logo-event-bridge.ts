// stores/logo/logo-event-bridge.ts
import { useEffect } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';
import { useLogoStore, getSparkColor } from './logo-store';
import { useXPStore } from '@/stores/xp/xp.store';
import { useTaskStore } from '@/stores/task.store';
import type { EventName } from '@/stores/core/event-bus.types';

const NODE_COUNT = 8;

const randomNode = () => Math.floor(Math.random() * NODE_COUNT);
const randomPair = () => {
  let from = randomNode();
  let to = randomNode();
  while (to === from) to = randomNode();
  return { from, to };
};

const COLUMN_COLORS: Record<string, '#3B82F6' | '#EAB308' | '#22C55E'> = {
  'todo': '#3B82F6',
  'in-progress': '#EAB308',
  'done': '#22C55E',
};

export const useLogoEventBridge = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState();
    const logoStore = useLogoStore.getState();
    const xpStore = useXPStore.getState();
    const taskStore = useTaskStore.getState();

    const handlers = [
      // === System Boot ===
      eventBus.on('system:boot', () => {
        logoStore.setBooted();
        logoStore.setRotationSpeed(0.8); // Fast initial rotation
        
        // Create multiple boot sparks
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            const { from, to } = randomPair();
            logoStore.addSpark('system:boot', from, to, getSparkColor('system:boot'));
          }, i * 200);
        }
        
        // Slow down after boot
        setTimeout(() => logoStore.setRotationSpeed(0.15), 3000);
        
        // Add welcome orb
        logoStore.addOrb({
          type: 'xp_amount',
          title: 'Synapse Online',
          subtitle: 'System initialized',
          icon: 'Zap',
        }, [0, 3, 0], 4000);
      }, { priority: 0 }),

      // === Task Created ===
      eventBus.on('task:created', ({ title, columnId }) => {
        const { from, to } = randomPair();
        const color = columnId ? (COLUMN_COLORS[columnId] || '#3B82F6') : '#3B82F6';
        
        const sparkId = logoStore.addSpark('task:created', from, to, color);
        logoStore.setPulseIntensity(0.3);

        // Add orb with task info
        if (Math.random() < 0.3) { // 30% chance to show orb
          logoStore.addOrb({
            type: 'task_card',
            title: title,
            subtitle: 'New Task Created',
            icon: 'Plus',
          });
        }
      }, { priority: 50 }),

      // === Task Moved ===
      eventBus.on('task:moved', ({ from, to, boardId }) => {
        const color = COLUMN_COLORS[to] || '#EAB308';
        const nodeFrom = from === 'todo' ? 0 : from === 'in-progress' ? 2 : 4;
        const nodeTo = to === 'todo' ? 1 : to === 'in-progress' ? 3 : 5;
        
        logoStore.addSpark('task:moved', nodeFrom, nodeTo, color);
        logoStore.setPulseIntensity(0.2);
        
        // Higher pulse for "in-progress" moves
        if (to === 'in-progress') {
          logoStore.setPulseIntensity(0.5);
        }
      }, { priority: 50 }),

      // === Task Completed ===
      eventBus.on('task:completed', ({ id, boardId }) => {
        const task = taskStore.getTaskById(id);
        
        // Multiple green sparks for completion
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const { from, to } = randomPair();
            logoStore.addSpark('task:completed', from, to, '#22C55E');
          }, i * 100);
        }
        
        logoStore.setPulseIntensity(0.7);
        logoStore.triggerCameraShake(0.3);
        
        // Show task completion orb
        logoStore.addOrb({
          type: 'task_card',
          title: task?.title || 'Task Completed',
          subtitle: '✅ Done!',
          icon: 'CheckCircle2',
        }, [0, 2.5, 0], 4000);
      }, { priority: 50 }),

      // === XP Gained ===
      eventBus.on('xp:gained', ({ action, amount, totalXP, level, levelProgress }) => {
        const { from, to } = randomPair();
        logoStore.addSpark('xp:gained', from, to, '#8B5CF6');
        logoStore.setPulseIntensity(0.2);
        
        // Show XP orb for larger gains
        if (amount >= 50) {
          logoStore.addOrb({
            type: 'xp_amount',
            title: `+${amount} XP`,
            subtitle: action.replace('task:', '').replace('_', ' '),
            value: amount,
            icon: 'Zap',
          }, [1, 2, 1], 3000);
        }
      }, { priority: 100 }),

      // === Level Up ===
      eventBus.on('xp:level_up', ({ oldLevel, newLevel, title }) => {
        // Burst of sparks from all nodes
        for (let i = 0; i < 12; i++) {
          setTimeout(() => {
            const to = (i % NODE_COUNT);
            logoStore.addSpark('xp:level_up', NODE_COUNT - 1, to, '#6366F1');
          }, i * 80);
        }
        
        logoStore.setPulseIntensity(1);
        logoStore.triggerCameraShake(1);
        logoStore.setRotationSpeed(0.5);
        setTimeout(() => logoStore.setRotationSpeed(0.15), 2500);
        
        // Big level up orb
        logoStore.addOrb({
          type: 'level_up',
          title: `Level ${newLevel}!`,
          subtitle: title,
          value: newLevel,
          icon: 'Trophy',
        }, [0, 3.5, 0], 6000);
      }, { priority: 100 }),

      // === Achievement Unlocked ===
      eventBus.on('xp:achievement_unlocked', ({ achievementId, name, rewards }) => {
        // Golden spark burst
        for (let i = 0; i < 5; i++) {
          setTimeout(() => {
            const { from, to } = randomPair();
            logoStore.addSpark('achievement_unlocked', from, to, '#F59E0B');
          }, i * 150);
        }
        
        logoStore.setPulseIntensity(0.8);
        logoStore.triggerCameraShake(0.5);
        
        // Achievement orb with badge
        logoStore.addOrb({
          type: 'achievement',
          title: name,
          subtitle: rewards.badge ? `Badge: ${rewards.badge}` : 'Achievement Unlocked!',
          icon: 'Award',
          value: rewards.xp,
        }, [0, 3, -1], 6000);
      }, { priority: 100 }),

      // === PowerUp Used ===
      eventBus.on('powerup:used', ({ powerUpId, effect }) => {
        const { from, to } = randomPair();
        logoStore.addSpark('xp:gained', from, to, '#EC4899');
        logoStore.setPulseIntensity(0.6);
        
        logoStore.addOrb({
          type: 'xp_amount',
          title: 'PowerUp!',
          subtitle: `${powerUpId} activated`,
          icon: 'Zap',
        }, [0, 2, 1], 3000);
      }, { priority: 50 }),

      // === Challenge Completed ===
      eventBus.on('challenge:completed', ({ title, reward }) => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            const { from, to } = randomPair();
            logoStore.addSpark('achievement_unlocked', from, to, '#F59E0B');
          }, i * 100);
        }
        
        logoStore.addOrb({
          type: 'achievement',
          title: 'Challenge Done!',
          subtitle: title,
          value: reward,
          icon: 'Target',
        }, [0, 2.5, 0], 4000);
      }, { priority: 50 }),

      // === System Error (negative visual) ===
      eventBus.on('system:error', ({ error }) => {
        logoStore.setPulseIntensity(0.8);
        // Red pulse
        for (let i = 0; i < 2; i++) {
          const { from, to } = randomPair();
          logoStore.addSpark('system:boot', from, to, '#EF4444' as any);
        }
      }, { priority: 0 }),
    ];

    return () => {
      handlers.forEach(id => eventBus.off(id));
    };
  }, []);
};