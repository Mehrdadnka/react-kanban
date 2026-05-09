// components/AppInitializer.tsx
import React, { useEffect } from 'react';
import { useBoardEventListeners } from '@/stores/board.store';
import { useXPEventHandlers } from '@/stores/xp/xp-event-handlers';
import { useEventBus } from '@/stores/core/event-bus.store';

export const AppInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Setup ALL event listeners - order matters!
  useBoardEventListeners();  // Priority: HIGH
  useXPEventHandlers();      // Priority: NORMAL
  
  useEffect(() => {
    const eventBus = useEventBus.getState();
    
    // Boot event
    eventBus.emit('system:boot');
    console.log('🚀 TaskFlow booted successfully');
    
    // Daily streak check
    const checkDaily = () => {
      const lastCheck = localStorage.getItem('last-daily-check');
      const today = new Date().toDateString();
      
      if (lastCheck !== today) {
        localStorage.setItem('last-daily-check', today);
        eventBus.emit('system:daily_check');
      }
    };
    
    checkDaily();
    
    // Check every hour for day change
    const interval = setInterval(checkDaily, 3600000);
    
    // Debug: Log event bus status periodically
    const debugInterval = process.env.NODE_ENV === 'development' 
      ? setInterval(() => {
          const debug = eventBus.debug();
          console.log('📊 EventBus:', `${debug.historyCount} events, ${Object.keys(debug.listeners).length} listener types`);
        }, 60000)
      : null;
    
    return () => {
      clearInterval(interval);
      if (debugInterval) clearInterval(debugInterval);
    };
  }, []);
  
  return <>{children}</>;
};