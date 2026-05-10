import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';

export interface XPNotification {
  id: string;
  type: 'xp_gained' | 'level_up' | 'achievement' | 'challenge' | 'powerup' | 'streak';
  title: string;
  message: string;
  icon: string;
  read: boolean;
  actionUrl?: string;
  timestamp: Date;
}

interface NotificationState {
  notifications: XPNotification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<XPNotification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [],
      unreadCount: 0,
      
      addNotification: (input) => {
        const notification: XPNotification = {
          id: uuidv4(),
          ...input,
          read: false,
          timestamp: new Date(),
        };
        
        set(state => ({
          notifications: [notification, ...state.notifications].slice(0, 50), // Max 50
          unreadCount: state.unreadCount + 1,
        }));
        
        return notification.id;
      },
      
      markAsRead: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          if (!notification || notification.read) return state;
          
          return {
            notifications: state.notifications.map(n =>
              n.id === id ? { ...n, read: true } : n
            ),
            unreadCount: Math.max(0, state.unreadCount - 1),
          };
        });
      },
      
      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(n => ({ ...n, read: true })),
          unreadCount: 0,
        }));
      },
      
      removeNotification: (id) => {
        set(state => {
          const notification = state.notifications.find(n => n.id === id);
          return {
            notifications: state.notifications.filter(n => n.id !== id),
            unreadCount: notification?.read 
              ? state.unreadCount 
              : Math.max(0, state.unreadCount - 1),
          };
        });
      },
      
      clearAll: () => {
        set({ notifications: [], unreadCount: 0 });
      },
    }),
    {
      name: 'xp-notifications',
    }
  )
);

// Auto-listen to XP events and create notifications
export const useNotificationListeners = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState();
    const notifStore = useNotificationStore.getState();
    
    const listeners = [
      eventBus.on('xp:gained', ({ action, amount }) => {
        const actionLabels: Record<string, string> = {
          'task:completed': 'Task Completed',
          'task:completed_early': 'Early Completion',
          'task:created': 'Task Created',
          'board:created': 'Board Created',
        };
        
        notifStore.addNotification({
          type: 'xp_gained',
          title: `+${amount} XP`,
          message: actionLabels[action] || action,
          icon: '⚡',
        });
      }, { priority: 100 }),
      
      eventBus.on('xp:level_up', ({ newLevel, title }) => {
        notifStore.addNotification({
          type: 'level_up',
          title: `Level Up! 🎉`,
          message: `Reached Level ${newLevel} - ${title}`,
          icon: '🏆',
          actionUrl: '/xp-dashboard',
        });
      }, { priority: 100 }),
      
      eventBus.on('xp:achievement_unlocked', ({ name }) => {
        notifStore.addNotification({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: name,
          icon: '⭐',
        });
      }, { priority: 100 }),
      
      eventBus.on('challenge:completed', ({ title, reward }) => {
        notifStore.addNotification({
          type: 'challenge',
          title: 'Challenge Completed!',
          message: `${title} - Claim ${reward} XP`,
          icon: '🎯',
        });
      }, { priority: 100 }),
      
      eventBus.on('powerup:unlocked', ({ name }) => {
        notifStore.addNotification({
          type: 'powerup',
          title: 'New Power-up Unlocked!',
          message: name,
          icon: '🔓',
        });
      }, { priority: 100 }),
    ];
    
    return () => listeners.forEach(id => eventBus.off(id));
  }, []);
};

if (typeof window !== 'undefined') {
  (window as any).__notificationStore = useNotificationStore;
}