import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useNotificationStore } from '@/stores/notifications/xp-notifications.store';

interface NotificationBellProps {
  onClick: () => void;
  isDarkMode?: boolean;
  className?: string;
  size?: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  onClick,
  isDarkMode = false,
  className,
  size = 22,
}) => {
  const unreadCount = useNotificationStore(state => state.unreadCount);
  const [isPulsing, setIsPulsing] = useState(false);
  
  // Pulse animation when new notification arrives
  useEffect(() => {
    if (unreadCount > 0) {
      setIsPulsing(true);
      const timer = setTimeout(() => setIsPulsing(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [unreadCount]);

  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-200',
        isDarkMode
          ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700',
        isPulsing && 'animate-pulse',
        className
      )}
      aria-label={`Notifications (${unreadCount} unread)`}
    >
      <Bell size={size} />
      
      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span className={cn(
          'absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center',
          'rounded-full text-[11px] font-bold px-1.5',
          'bg-red-500 text-white shadow-lg',
          'animate-in zoom-in-50 duration-200'
        )}>
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};