// stores/xp/challenge-event-handlers.ts
import { useEffect } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';
import { useChallengeStore } from './challenges.store';
import type { XPAction } from './xp.types';
import type { EventName } from '@/stores/core/event-bus.types';

export const useChallengeEventHandlers = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState();
    const challengeStore = useChallengeStore.getState();
    
    // Generate challenges on boot
    challengeStore.generateDailyChallenges();
    
    // Setup midnight regeneration
    const setupMidnightRegen = () => {
      const now = new Date();
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      
      const msUntilMidnight = tomorrow.getTime() - now.getTime();
      
      setTimeout(() => {
        challengeStore.generateDailyChallenges();
        // Then repeat every 24 hours
        setInterval(() => {
          challengeStore.generateDailyChallenges();
        }, 86400000);
      }, msUntilMidnight);
    };
    
    setupMidnightRegen();
    
    // Listen to XP actions to update challenge progress
    const actionEvents: Array<{ event: EventName; action: XPAction }> = [
      { event: 'task:completed', action: 'task:completed' },
      { event: 'task:created', action: 'task:created' },
      { event: 'board:created', action: 'board:created' },
      { event: 'task:time_logged', action: 'time:logged' },
    ];
    
    const listeners = actionEvents.map(({ event, action }) =>
      eventBus.on(event, () => {
        challengeStore.updateProgress(action);
      }, { priority: 100 }) // Low priority - after XP is awarded
    );
    
    // Listen to daily check for regeneration
    const dailyListener = eventBus.on('system:daily_check', () => {
      // Check if challenges are expired
      const active = challengeStore.getActiveChallenges();
      if (active.length === 0) {
        challengeStore.generateDailyChallenges();
      }
    }, { priority: 100 });
    
    return () => {
      listeners.forEach(id => eventBus.off(id));
      eventBus.off(dailyListener);
    };
  }, []);
};