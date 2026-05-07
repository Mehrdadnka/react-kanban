// features/TaskSidebars/view/TaskViewLayout.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { BreadcrumbItem } from '@/types/sidebar.types';
import { TabConfig } from './hooks/useTaskViewTabs';
import { TabNavigation } from './components/TabNavigation';

interface TaskViewLayoutProps {
  isOpen: boolean;
  zIndex?: number;
  onClose: () => void;
  panelId?: string;
  taskTitle: string;
  icon?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  children: React.ReactNode;
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export const TaskViewLayout: React.FC<TaskViewLayoutProps> = ({
  isOpen,
  zIndex,
  onClose,
  panelId,
  taskTitle,
  icon,
  breadcrumbs,
  children,
  tabs,
  activeTab,
  onTabChange,
}) => {
  const { isDarkMode } = useApp();
  const position = usePanelPosition(panelId);

  return (
    <SidebarShell
      isOpen={isOpen}
      zIndex={zIndex}
      onClose={onClose}
      isDarkMode={isDarkMode}
      panelId={panelId}
      title={taskTitle}
      icon={icon}
      breadcrumbs={breadcrumbs}
      position={position}
      maxWidth="full"
    >
      <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 h-full max-h-full min-h-0 -mx-6 -mt-6">
        {/* Tab Navigation - جایگزین Stepper */}
        <div className="flex-shrink-0 lg:w-44 lg:border-r border-gray-200 dark:border-gray-800 lg:pr-3 pt-6 px-3 lg:px-0 lg:pl-6">
          {/* Mobile: Horizontal scroll tabs */}
          <div className="lg:hidden -mx-6 px-6 pb-2 border-b border-gray-200 dark:border-gray-800">
            <div className="flex gap-1 overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                      tab.id === activeTab
                        ? isDarkMode
                          ? 'bg-gray-800 text-white'
                          : 'bg-gray-100 text-gray-900'
                        : isDarkMode
                          ? 'text-gray-400 hover:text-gray-200'
                          : 'text-gray-500 hover:text-gray-700'
                    )}
                  >
                    <Icon size={14} />
                    {tab.label}
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className="ml-1 text-[10px] bg-blue-500 text-white px-1.5 py-0.5 rounded-full">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Desktop: Vertical tabs */}
          <div className="hidden lg:block">
            <TabNavigation
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={onTabChange}
            />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-h-0 h-full min-w-0 overflow-hidden">
          <div className="overflow-y-auto h-full">
            <div className="p-6">
              {children}
            </div>
          </div>
        </div>
      </div>
    </SidebarShell>
  );
};