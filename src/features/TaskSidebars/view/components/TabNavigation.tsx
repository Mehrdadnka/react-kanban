// features/TaskSidebars/view/components/TabNavigation.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { TabConfig } from '../hooks/useTaskViewTabs';

interface TabNavigationProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => {
  const { isDarkMode } = useApp();

  const styles = {
    activeBtn: isDarkMode
      ? 'bg-gray-800 text-white border-l-2 border-blue-500'
      : 'bg-gray-100 text-gray-900 border-l-2 border-blue-600',
    inactiveBtn: isDarkMode
      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50 border-l-2 border-transparent'
      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-l-2 border-transparent',
    badge: 'bg-blue-500 text-white',
  };

  return (
    <nav className={cn('flex flex-col', className)} aria-label="Tab navigation">
      <ol className="flex flex-col gap-0">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          const Icon = tab.icon;

          return (
            <li key={tab.id}>
              <button
                type="button"
                onClick={() => onTabChange(tab.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive ? styles.activeBtn : styles.inactiveBtn,
                  'rounded-r-lg'
                )}
              >
                <Icon size={16} />
                <span className="flex-1 text-left truncate">{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={cn(
                    'text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center',
                    styles.badge
                  )}>
                    {tab.badge}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};