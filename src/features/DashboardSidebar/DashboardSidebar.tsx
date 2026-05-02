import React, { memo, useMemo } from 'react';

import { useDashboardSidebarStore } from '@/stores/sidebar-engine/dashboard-sidebar.store';
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
import { WIDGET_ICONS } from '@/config/panel-icons.config';

// ============ Main Content ============
export const DashboardSidebar: React.FC<PanelProps> = memo(({ isOpen, onClose, panelId, isDarkMode }) => {
  const { navigate } = useRouter();
  const { activeWidget, widgetData, closeSidebar } = useDashboardSidebarStore();

  const config = activeWidget ? widgetConfig[activeWidget] : null;
  const position = usePanelPosition(panelId); 

  const icon = useMemo(() => {

    if (!activeWidget) {
      const panelIcon = WIDGET_ICONS['dashboard-sidebar' as keyof typeof WIDGET_ICONS];
      if (panelIcon) {
        const Icon = panelIcon.icon;
        return <Icon size={20} />;
      }
      return null;
    }
    
    const widgetIcon = WIDGET_ICONS[activeWidget as keyof typeof WIDGET_ICONS];
  
    if (widgetIcon) {
      const Icon = widgetIcon.icon;
      return <Icon size={20} />;
    }
    
    return null;
  }, [activeWidget]);

  const title = useMemo(() => {
    if (config) return config.title;
    
    // Fallback
    const panelIcon = WIDGET_ICONS['dashboard-sidebar' as keyof typeof WIDGET_ICONS];
    return panelIcon?.label || 'Dashboard';
  }, [config]);
  

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
      isDarkMode={isDarkMode}
      panelId={panelId} 
      title={title}
      icon={icon}
      breadcrumbs={config?.breadcrumbs}
    >
      {renderContent()}
    </SidebarShell>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';