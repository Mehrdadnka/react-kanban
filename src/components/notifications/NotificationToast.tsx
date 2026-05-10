// components/notifications/NotificationToast.tsx
import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { XPNotification, NOTIFICATION_TYPES } from '@/stores/notifications/xp-notifications.store';

interface NotificationToastProps {
  notification: XPNotification;
  onDismiss: () => void;
  autoHideDuration?: number;
  isDarkMode?: boolean;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onDismiss,
  autoHideDuration = 4000,
  isDarkMode = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const typeConfig = NOTIFICATION_TYPES[notification.type];

  useEffect(() => {
    // Animate in
    requestAnimationFrame(() => setIsVisible(true));

    // Auto dismiss
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 300); // Wait for animation
    }, autoHideDuration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={cn(
        'fixed bottom-4 right-4 z-[9999] max-w-sm w-full',
        'transform transition-all duration-300 ease-out',
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      )}
    >
      <div className={cn(
        'rounded-xl shadow-2xl border p-4',
        'backdrop-blur-xl',
        isDarkMode
          ? 'bg-gray-900/95 border-gray-700'
          : 'bg-white/95 border-gray-200'
      )}>
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl',
            typeConfig.bgColor
          )}>
            {notification.icon}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <h4 className={cn(
              'text-sm font-semibold',
              isDarkMode ? 'text-gray-200' : 'text-gray-900'
            )}>
              {notification.title}
            </h4>
            <p className={cn(
              'text-xs mt-0.5',
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            )}>
              {notification.message}
            </p>
          </div>
          
          {/* Close */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(onDismiss, 300);
            }}
            className={cn(
              'p-1 rounded-lg transition-colors',
              isDarkMode ? 'hover:bg-gray-800 text-gray-500' : 'hover:bg-gray-100 text-gray-400'
            )}
          >
            <X size={16} />
          </button>
        </div>
        
        {/* Progress bar */}
        <div className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full animate-shrink', typeConfig.color)}
            style={{ 
              animation: `shrink ${autoHideDuration}ms linear forwards`,
              width: '100%'
            }}
          />
        </div>
      </div>
    </div>
  );
};