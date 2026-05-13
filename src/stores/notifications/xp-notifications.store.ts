// stores/notifications/xp-notifications.store.ts - ENHANCED VERSION
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';
import { useEventBus } from '@/stores/core/event-bus.store';

export type NotificationType = 'xp_gained' | 'level_up' | 'achievement' | 'challenge' | 'powerup' | 'streak';

export interface XPNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  icon: string;
  read: boolean;
  actionUrl?: string;
  timestamp: Date;
  metadata?: Record<string, any>; // For extra data like XP amount, level, etc.
}

interface NotificationState {
  notifications: XPNotification[];
  unreadCount: number;
  
  addNotification: (notification: Omit<XPNotification, 'id' | 'read' | 'timestamp'>) => string;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
  
  // New methods
  getUnreadNotifications: () => XPNotification[];
  getNotificationsByType: (type: NotificationType) => XPNotification[];
  getRecentNotifications: (count?: number) => XPNotification[];
}

// Notification type configs
export const NOTIFICATION_TYPES: Record<NotificationType, { icon: string; color: string; bgColor: string }> = {
  xp_gained: { icon: '⚡', color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  level_up: { icon: '🏆', color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  achievement: { icon: '⭐', color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  challenge: { icon: '🎯', color: 'text-green-500', bgColor: 'bg-green-500/10' },
  powerup: { icon: '🔓', color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  streak: { icon: '🔥', color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
};

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
          notifications: [notification, ...state.notifications].slice(0, 50),
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
      
      getUnreadNotifications: () => {
        return get().notifications.filter(n => !n.read);
      },
      
      getNotificationsByType: (type) => {
        return get().notifications.filter(n => n.type === type);
      },
      
      getRecentNotifications: (count = 5) => {
        return get().notifications.slice(0, count);
      },
    }),
    {
      name: 'xp-notifications',
      partialize: (state) => ({
        notifications: state.notifications.map(n => ({
          ...n,
          timestamp: n.timestamp instanceof Date ? n.timestamp.toISOString() : n.timestamp,
        })),
        unreadCount: state.unreadCount,
      }),
      merge: (persisted: any, current) => ({
        ...current,
        notifications: (persisted.notifications || []).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        })),
        unreadCount: persisted.unreadCount || 0,
      }),
    }
  )
);

// Auto-listeners
export const useNotificationListeners = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState();
    const notifStore = useNotificationStore.getState();
    
    const listeners = [
      eventBus.on('xp:gained', ({ action, amount, totalXP, level, levelProgress }) => {
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
          icon: NOTIFICATION_TYPES.xp_gained.icon,
          metadata: { amount, totalXP, level },
        });
      }, { priority: 100 }),
      
      eventBus.on('xp:level_up', ({ oldLevel, newLevel, title }) => {
        notifStore.addNotification({
          type: 'level_up',
          title: `Level Up! 🎉`,
          message: `Level ${oldLevel} → ${newLevel} - ${title}`,
          icon: NOTIFICATION_TYPES.level_up.icon,
          actionUrl: '/xp-dashboard',
          metadata: { oldLevel, newLevel, title },
        });
      }, { priority: 100 }),
      
      eventBus.on('xp:achievement_unlocked', ({ achievementId, name, rewards }) => {
        notifStore.addNotification({
          type: 'achievement',
          title: 'Achievement Unlocked!',
          message: name,
          icon: NOTIFICATION_TYPES.achievement.icon,
          metadata: { achievementId, rewards },
        });
      }, { priority: 100 }),
      
      eventBus.on('challenge:completed', ({ challengeId, title, reward }) => {
        notifStore.addNotification({
          type: 'challenge',
          title: 'Challenge Completed!',
          message: `${title} - Claim ${reward} XP`,
          icon: NOTIFICATION_TYPES.challenge.icon,
          metadata: { challengeId, reward },
        });
      }, { priority: 100 }),
      
      eventBus.on('powerup:unlocked', ({ powerUpId, name }) => {
        notifStore.addNotification({
          type: 'powerup',
          title: 'New Power-up!',
          message: name,
          icon: NOTIFICATION_TYPES.powerup.icon,
          metadata: { powerUpId },
        });
      }, { priority: 100 }),
    ];
    
    return () => listeners.forEach(id => eventBus.off(id));
  }, []);
};

// Dev helper
if (typeof window !== 'undefined') {
  (window as any).__notificationStore = useNotificationStore;
}