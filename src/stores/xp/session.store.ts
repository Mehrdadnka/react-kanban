// stores/xp/session.store.ts
import { create } from 'zustand';
import { useEventBus } from '@/stores/core/event-bus.store';
import { useEffect } from 'react';

interface SessionState {
  sessionXP: number;
  sessionTasks: number;
  sessionStartTime: Date;
  
  resetSession: () => void;
  addToSession: (xp: number) => void;
}

export const useSessionStore = create<SessionState>()((set, get) => ({
  sessionXP: 0,
  sessionTasks: 0,
  sessionStartTime: new Date(),
  
  resetSession: () => {
    set({ sessionXP: 0, sessionTasks: 0, sessionStartTime: new Date() });
  },
  
  addToSession: (xp) => {
    set(state => ({
      sessionXP: state.sessionXP + xp,
      sessionTasks: state.sessionTasks + 1,
    }));
  },
}));

// Auto-track session
export const useSessionTracker = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState();
    const session = useSessionStore.getState();
    
    // Reset on boot
    session.resetSession();
    
    const listeners = [
      eventBus.on('xp:gained', ({ amount }) => {
        session.addToSession(amount);
      }, { priority: 100 }),
    ];
    
    return () => listeners.forEach(id => eventBus.off(id));
  }, []);
}