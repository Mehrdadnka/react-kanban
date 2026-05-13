import React, { memo, useMemo } from 'react';
import { Bell, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { useNotificationStore, NOTIFICATION_TYPES, type XPNotification, type NotificationType } from '@/stores/notifications/xp-notifications.store';
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { Tab } from '@/components/ui/tab/Tab';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from '@/router';
import { useShallow } from 'zustand/react/shallow';

// ──── Notification Item ────
const NotificationItem: React.FC<{
  notification: XPNotification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
  isDarkMode?: boolean;
}> = ({ notification, onMarkRead, onDismiss, isDarkMode }) => {
  const typeConfig = NOTIFICATION_TYPES[notification.type];
  const timeAgo = formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true });
  const { navigate } = useRouter();

  const handleClick = () => {
    if (!notification.read) {
      onMarkRead(notification.id);
    }
    if (notification.actionUrl) {
      navigate(notification.actionUrl);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        'group relative flex items-start gap-3 p-3 rounded-lg transition-all duration-200 cursor-pointer',
        isDarkMode
          ? 'hover:bg-gray-800 border-gray-700'
          : 'hover:bg-gray-50 border-gray-100',
        !notification.read && (isDarkMode ? 'bg-gray-800/50' : 'bg-blue-50/50')
      )}
    >
      {/* Unread indicator */}
      {!notification.read && (
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
      )}
      
      {/* Icon */}
      <div className={cn(
        'flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-xl',
        typeConfig.bgColor
      )}>
        {notification.icon}
      </div>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className={cn(
            'text-sm font-semibold truncate',
            isDarkMode ? 'text-gray-200' : 'text-gray-900'
          )}>
            {notification.title}
          </h4>
          <span className={cn(
            'text-[10px] flex-shrink-0 mt-0.5',
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          )}>
            {timeAgo}
          </span>
        </div>
        <p className={cn(
          'text-xs mt-0.5',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          {notification.message}
        </p>
      </div>
      
      {/* Dismiss button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss(notification.id);
        }}
        className={cn(
          'opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded',
          isDarkMode ? 'hover:bg-gray-700 text-gray-500' : 'hover:bg-gray-200 text-gray-400'
        )}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// ──── Main Sidebar ────
export const NotificationSidebar: React.FC<PanelProps> = memo(({
  isOpen,
  onClose,
  panelId,
  isDarkMode,
}) => {
  const { 
    notifications, 
    unreadCount, 
    markAsRead, 
    markAllAsRead, 
    removeNotification, 
    clearAll 
  } = useNotificationStore(useShallow(state => ({
    notifications: state.notifications,
    unreadCount: state.unreadCount,
    markAsRead: state.markAsRead,
    markAllAsRead: state.markAllAsRead,
    removeNotification: state.removeNotification,
    clearAll: state.clearAll,
  })));

  // Group notifications by type for filter tabs
  const types = useMemo(() => {
    const unique = new Set(notifications.map(n => n.type));
    return Array.from(unique);
  }, [notifications]);

  const tabs = [
    {
      id: 'all',
      label: `All (${notifications.length})`,
      content: (
        <NotificationList
          notifications={notifications}
          isDarkMode={isDarkMode}
          onMarkRead={markAsRead}
          onDismiss={removeNotification}
        />
      ),
    },
    {
      id: 'unread',
      label: `Unread (${unreadCount})`,
      content: (
        <NotificationList
          notifications={notifications.filter(n => !n.read)}
          isDarkMode={isDarkMode}
          onMarkRead={markAsRead}
          onDismiss={removeNotification}
        />
      ),
    },
  ];

  return (
    <SidebarShell
      isOpen={isOpen}
      onClose={onClose}
      panelId={panelId}
      title="Notifications"
      icon={<Bell size={20} />}
      isDarkMode={isDarkMode}
      position="left"
      maxWidth="md"
    >
      {/* Actions Bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
            isDarkMode
              ? 'text-blue-400 hover:bg-blue-500/10 disabled:text-gray-600'
              : 'text-blue-600 hover:bg-blue-50 disabled:text-gray-400',
            'disabled:cursor-not-allowed'
          )}
        >
          <CheckCheck size={14} />
          Mark all read
        </button>
        
        <button
          onClick={clearAll}
          disabled={notifications.length === 0}
          className={cn(
            'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
            isDarkMode
              ? 'text-red-400 hover:bg-red-500/10 disabled:text-gray-600'
              : 'text-red-600 hover:bg-red-50 disabled:text-gray-400',
            'disabled:cursor-not-allowed'
          )}
        >
          <Trash2 size={14} />
          Clear all
        </button>
      </div>

      {/* Tabs: All / Unread */}
      <Tab
        items={tabs}
        defaultValue="all"
        isDarkMode={isDarkMode}
        variant="underline"
        size="sm"
      />
    </SidebarShell>
  );
});

// ──── Notification List ────
const NotificationList: React.FC<{
  notifications: XPNotification[];
  isDarkMode?: boolean;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
}> = ({ notifications, isDarkMode, onMarkRead, onDismiss }) => {
  if (notifications.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Bell size={48} className={cn(
          'mb-4 opacity-20',
          isDarkMode ? 'text-gray-600' : 'text-gray-400'
        )} />
        <p className={cn(
          'text-sm font-medium mb-1',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        )}>
          No notifications
        </p>
        <p className={cn(
          'text-xs',
          isDarkMode ? 'text-gray-500' : 'text-gray-400'
        )}>
          Complete tasks and earn XP to see notifications here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-1 pt-2">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          isDarkMode={isDarkMode}
          onMarkRead={onMarkRead}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

NotificationSidebar.displayName = 'NotificationSidebar';