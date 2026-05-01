import React, { memo } from 'react';
import { 
  CheckSquare, Clock, CheckCircle2, 
  ListTodo, Flag, TrendingUp, Activity,
  ArrowRight, AlertTriangle,
  ClipboardList,
  Zap
} from 'lucide-react';
import { useDashboardSidebarStore, DashboardWidgetType } from '@/stores/dashboard-sidebar.store';
import { useApp } from '@/providers/AppProvider';
import { useRouter } from '@/router';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
import { PanelProps } from '@/stores/sidebar-engine/sidebar-engine.types';
import { BreadcrumbItem } from '@/stores/task-sidebar.store';

// UI Engine - All standardized components
import { SidebarShell } from '@/components/sidebar-ui-engine/SidebarShell';
import { SidebarTaskCard } from '@/components/sidebar-ui-engine/SidebarTaskCard';
import { SidebarStatsCard } from '@/components/sidebar-ui-engine/SidebarStatsCard';
import { SidebarProgressBar } from '@/components/sidebar-ui-engine/SidebarProgressBar';
import { SidebarPriorityList } from '@/components/sidebar-ui-engine/SidebarPriorityList';

// ============ Config ============

const widgetConfig: Record<DashboardWidgetType, {
  title: string;
  icon: React.ReactNode;
  breadcrumbs: BreadcrumbItem[];
}> = {
  'task-overview': {
    title: 'Task Overview',
    icon: <CheckSquare size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }],
  },
  'total-tasks': {
    title: 'All Tasks',
    icon: <ListTodo size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'All Tasks' }],
  },
  'in-progress': {
    title: 'Tasks In Progress',
    icon: <Zap size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'In Progress' }],
  },
  'completed': {
    title: 'Completed Tasks',
    icon: <CheckCircle2 size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'Completed' }],
  },
  'todo': {
    title: 'Todo Tasks',
    icon: <ClipboardList size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'Todo' }],
  },
  'recent-tasks': {
    title: 'Recent Tasks',
    icon: <Clock size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Recent Tasks' }],
  },
  'priority-breakdown': {
    title: 'Priority Breakdown',
    icon: <Flag size={20} />,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Priorities' }],
  },
};

const filterLabels: Record<string, string> = {
  'total-tasks': 'all tasks',
  'in-progress': 'in progress tasks',
  'completed': 'completed tasks',
  'todo': 'todo tasks',
};

const filterRoutes: Record<string, string> = {
  'total-tasks': '/tasks',
  'in-progress': '/tasks?filter=in-progress',
  'completed': '/tasks?filter=done',
  'todo': '/tasks?filter=todo',
};

// ============ Components ============

const TaskOverviewContent: React.FC<{
  widgetData: any;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
}> = ({ widgetData, isDarkMode, onNavigate }) => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-2 gap-4">
      <SidebarStatsCard
        icon={ListTodo}
        label="Total Tasks"
        value={widgetData.totalTasks}
        color="text-blue-600"
        bgColor="bg-blue-50 dark:bg-blue-900/30"
        onClick={() => onNavigate('/tasks')}
      />
      <SidebarStatsCard
        icon={Zap}
        label="In Progress"
        value={widgetData.inProgressCount}
        color="text-yellow-600"
        bgColor="bg-yellow-50 dark:bg-yellow-900/30"
        onClick={() => onNavigate('/tasks?filter=in-progress')}
      />
      <SidebarStatsCard
        icon={CheckCircle2}
        label="Completed"
        value={widgetData.completedCount}
        color="text-green-600"
        bgColor="bg-green-50 dark:bg-green-900/30"
        onClick={() => onNavigate('/tasks?filter=done')}
      />
      <SidebarStatsCard
        icon={ListTodo}
        label="Todo"
        value={widgetData.todoCount}
        color="text-gray-600"
        bgColor="bg-gray-50 dark:bg-gray-700/30"
        onClick={() => onNavigate('/tasks?filter=todo')}
      />
    </div>

    {/* Progress Section */}
    <div className={cn(
      'p-4 rounded-xl',
      isDarkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-blue-600" />
        <h3 className="font-semibold">Progress Overview</h3>
      </div>

      <SidebarProgressBar
        label="Completion Rate"
        value={widgetData.completionRate}
        color="from-blue-500 to-purple-500"
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          'text-center p-3 rounded-lg',
          isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
        )}>
          <TrendingUp size={16} className="mx-auto mb-1 text-green-500" />
          <div className="text-xs">Completed</div>
          <div className="text-lg font-bold text-green-600">{widgetData.completedCount}</div>
        </div>
        <div className={cn(
          'text-center p-3 rounded-lg',
          isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
        )}>
          <Zap size={16} className="mx-auto mb-1 text-yellow-500" />
          <div className="text-xs">Active</div>
          <div className="text-lg font-bold text-yellow-600">{widgetData.inProgressCount}</div>
        </div>
      </div>
    </div>

    <Button onClick={() => onNavigate('/tasks')} className="w-full flex items-center justify-center gap-2">
      View All Tasks <ArrowRight size={16} />
    </Button>
  </div>
);

const RecentTasksContent: React.FC<{
  tasks: any[];
  isDarkMode: boolean;
  onTaskClick: (taskId: string) => void;
  onNavigate: (path: string) => void;
}> = ({ tasks, onTaskClick, onNavigate }) => (
  <div className="space-y-3">
    {tasks.length === 0 ? (
      <div className="text-center py-8 text-gray-400">
        <Clock size={32} className="mx-auto mb-3 opacity-50" />
        <p>No recent tasks</p>
      </div>
    ) : (
      tasks.map((task) => (
        <SidebarTaskCard
          key={task.id}
          task={task}
          onClick={onTaskClick}
          variant="compact"
        />
      ))
    )}
    <Button onClick={() => onNavigate('/tasks')} variant="outline" className="w-full flex items-center justify-center gap-2 mt-4">
      View All Tasks <ArrowRight size={16} />
    </Button>
  </div>
);

const PriorityBreakdownContent: React.FC<{
  widgetData: any;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
}> = ({ widgetData, isDarkMode, onNavigate }) => (
  <div className="space-y-6">
    <SidebarPriorityList
      items={[
        {
          key: 'high',
          label: 'High Priority',
          count: widgetData.priorityData.high,
          total: widgetData.totalTasks,
          color: 'from-red-500 to-red-600',
          textColor: 'text-red-600',
          icon: AlertTriangle,
        },
        {
          key: 'medium',
          label: 'Medium Priority',
          count: widgetData.priorityData.medium,
          total: widgetData.totalTasks,
          color: 'from-yellow-500 to-yellow-600',
          textColor: 'text-yellow-600',
          icon: Flag,
        },
        {
          key: 'low',
          label: 'Low Priority',
          count: widgetData.priorityData.low,
          total: widgetData.totalTasks,
          color: 'from-green-500 to-green-600',
          textColor: 'text-green-600',
          icon: Flag,
        },
      ]}
    />

    {widgetData.priorityData.high > 0 && (
      <div className={cn(
        'p-4 rounded-lg border-l-4 border-red-500',
        isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
      )}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="font-medium text-red-700 dark:text-red-300">
            {widgetData.priorityData.high} high priority task{widgetData.priorityData.high !== 1 ? 's' : ''} need{widgetData.priorityData.high === 1 ? 's' : ''} attention
          </span>
        </div>
      </div>
    )}

    <Button onClick={() => onNavigate('/tasks')} className="w-full flex items-center justify-center gap-2">
      Manage Priorities <ArrowRight size={16} />
    </Button>
  </div>
);

const FilteredTaskListContent: React.FC<{
  activeWidget: string;
  widgetData: any;
  isDarkMode: boolean;
  onTaskClick: (taskId: string) => void;
  onNavigate: (path: string) => void;
}> = ({ activeWidget, widgetData, isDarkMode, onTaskClick, onNavigate }) => {
  const currentFilterLabel = filterLabels[activeWidget] || 'tasks';
  const currentFilterRoute = filterRoutes[activeWidget] || '/tasks';
  const filteredTasksCount = widgetData.filteredTasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={cn('p-4 rounded-xl', isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50')}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">
            {filteredTasksCount} {currentFilterLabel}
          </h3>
        </div>
        <SidebarProgressBar
          label="Completion Rate"
          value={widgetData.completionRate}
          color="from-blue-500 to-purple-500"
        >
          <span className="text-xs text-gray-500">Total: {widgetData.totalTasks}</span>
        </SidebarProgressBar>
      </div>

      {/* Tasks List */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Tasks List
        </h3>
        {filteredTasksCount === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No {currentFilterLabel} found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {widgetData.filteredTasks?.map((task: any) => (
              <SidebarTaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
                variant="detailed"
              />
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => onNavigate(currentFilterRoute)}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        View in Board <ArrowRight size={16} />
      </Button>
    </div>
  );
};

// ============ Main Component ============

export const DashboardSidebar: React.FC<PanelProps> = memo(({ isOpen, onClose, panelId }) => {
  const { isDarkMode } = useApp();
  const { navigate } = useRouter();
  const { activeWidget, widgetData, closeSidebar } = useDashboardSidebarStore();

  const config = activeWidget ? widgetConfig[activeWidget] : null;

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
      onClose={handleClose}
      panelId={panelId} 
      title={config?.title || ''}
      icon={config?.icon}
      breadcrumbs={config?.breadcrumbs}
    >
      {renderContent()}
    </SidebarShell>
  );
});

DashboardSidebar.displayName = 'DashboardSidebar';