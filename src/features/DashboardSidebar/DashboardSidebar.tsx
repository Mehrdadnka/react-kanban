import React, { memo } from 'react';

import { useDashboardSidebarStore } from '@/stores/dashboard-sidebar.store';
import { useApp } from '@/providers/AppProvider';
import { useRouter } from '@/router';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';

// UI Engine - All standardized components
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { usePanelPosition } from '@/stores/sidebar-engine/sidebar-engine.store';
import { usePanelIconComponent } from '@/hooks/usePanelIcon';
import { widgetConfig } from './WidgetConfig';

// ============ Components ============
import TaskOverviewContent from './components/TaskOverviewContent';
import RecentTasksContent from './components/RecentTasksContent';
import PriorityBreakdownContent from './components/PriorityBreakdownContent';
import FilteredTaskListContent from './components/FilteredTaskListContent';

// ============ Main Content ============
export const DashboardSidebar: React.FC<PanelProps> = memo(({ isOpen, onClose, panelId }) => {
  const { isDarkMode } = useApp();
  const { navigate } = useRouter();
  const { activeWidget, widgetData, closeSidebar } = useDashboardSidebarStore();

  const config = activeWidget ? widgetConfig[activeWidget] : null;
  const icon = usePanelIconComponent(panelId);
  const position = usePanelPosition(panelId); 
  

  const handleClose = () => {
    closeSidebar();
    onClose();
  };

  const handleTaskClick = (taskId: string) => {
    navigate(`/tasks/${taskId}`);
    handleClose();
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    handleClose();
  };


  const renderContent = () => {
    if (!activeWidget) return null;

    // Filtered task lists
    if (['total-tasks', 'in-progress', 'completed', 'todo'].includes(activeWidget)) {
      return (
        <FilteredTaskListContent
          activeWidget={activeWidget}
          widgetData={widgetData}
          isDarkMode={isDarkMode}
          onTaskClick={handleTaskClick}
          onNavigate={handleNavigate}
        />
      );
    }

    switch (activeWidget) {
      case 'task-overview':
        return (
          <TaskOverviewContent
            widgetData={widgetData}
            isDarkMode={isDarkMode}
            onNavigate={handleNavigate}
          />
        );

      case 'recent-tasks':
        return (
          <RecentTasksContent
            tasks={widgetData.recentTasks}
            isDarkMode={isDarkMode}
            onTaskClick={handleTaskClick}
            onNavigate={handleNavigate}
          />
        );

      case 'priority-breakdown':
        return (
          <PriorityBreakdownContent
            widgetData={widgetData}
            isDarkMode={isDarkMode}
            onNavigate={handleNavigate}
          />
        );

      default:
        return null;
    }
  };

  return (
    <SidebarShell
      isOpen={isOpen}
      position={position}
      onClose={handleClose}
      panelId={panelId} 
      title={config?.title || ''}
      icon={icon}
      breadcrumbs={config?.breadcrumbs}
    >
      {renderContent()}
    </SidebarShell>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';