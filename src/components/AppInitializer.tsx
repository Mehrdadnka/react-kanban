// components/AppInitializer.tsx - UPDATED
import React, { useEffect } from 'react';
import { useBoardEventListeners } from '@/stores/board.store';
import { useXPEventHandlers } from '@/stores/xp/xp-event-handlers';
import { useChallengeEventHandlers } from '@/stores/xp/challenge-event-handlers';
import { useNotificationListeners } from '@/stores/notifications/xp-notifications.store';
import { useEventBus } from '@/stores/core/event-bus.store';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Setup ALL event listeners
  useBoardEventListeners();      // Board stats cache
  useXPEventHandlers();          // XP awarding
  useChallengeEventHandlers();   // Daily challenges
  useNotificationListeners();    // Notification center
  
  useEffect(() => {
    const eventBus = useEventBus.getState();
    
    // Boot event
    eventBus.emit('system:boot');
    console.log('🚀 TaskFlow booted with all systems');
    
    // Daily check
    const checkDaily = () => {
      const lastCheck = localStorage.getItem('last-daily-check');
      const today = new Date().toDateString();
      
      if (lastCheck !== today) {
        localStorage.setItem('last-daily-check', today);
        eventBus.emit('system:daily_check');
      }
    };
    
    checkDaily();
    const interval = setInterval(checkDaily, 3600000);
    
    return () => clearInterval(interval);
  }, []);
  
  return <>{children}</>;
};