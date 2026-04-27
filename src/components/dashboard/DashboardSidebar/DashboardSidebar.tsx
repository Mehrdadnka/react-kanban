// components/dashboard/DashboardSidebar/DashboardSidebar.tsx
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, CheckSquare, Clock, CheckCircle2, 
  ListTodo, Flag, TrendingUp, Activity,
  ArrowRight, AlertTriangle, ExternalLink
} from 'lucide-react';
import { useDashboardSidebarStore, DashboardWidgetType } from '@/stores/dashboard-sidebar.store';
import { useApp } from '@/providers/AppProvider';
import { useRouter } from '@/router';
import { Breadcrumb } from '@/components/board/TaskSidebar/Breadcrumb';
import { Badge } from '@/components/ui/badge/Badge';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
import { Task } from '@/stores/task.store';

// تایپ‌های مشخص برای priorityColors
const priorityColors: Record<Task['priority'], string> = {
  low: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  high: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

// تایپ‌های مشخص برای statusLabels
const statusLabels: Record<Task['status'], string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const widgetConfig: Record<DashboardWidgetType, {
  title: string;
  icon: React.ElementType;
  breadcrumbs: { label: string; onClick?: () => void }[];
}> = {
  'task-overview': {
    title: 'Task Overview',
    icon: CheckSquare,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }],
  },
  'total-tasks': {
    title: 'All Tasks',
    icon: ListTodo,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'All Tasks' }],
  },
  'in-progress': {
    title: 'Tasks In Progress',
    icon: Clock,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'In Progress' }],
  },
  'completed': {
    title: 'Completed Tasks',
    icon: CheckCircle2,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'Completed' }],
  },
  'todo': {
    title: 'Todo Tasks',
    icon: ListTodo,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Task Overview' }, { label: 'Todo' }],
  },
  'recent-tasks': {
    title: 'Recent Tasks',
    icon: Clock,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Recent Tasks' }],
  },
  'priority-breakdown': {
    title: 'Priority Breakdown',
    icon: Flag,
    breadcrumbs: [{ label: 'Dashboard' }, { label: 'Priorities' }],
  },
};

// تایپ‌های مشخص برای filterLabels و filterRoutes
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

export const DashboardSidebar: React.FC = () => {
  const { isDarkMode } = useApp();
  const { navigate } = useRouter();
  const {
    isOpen,
    activeWidget,
    widgetData,
    closeSidebar,
  } = useDashboardSidebarStore();
  
  const config = activeWidget ? widgetConfig[activeWidget] : null;
  const Icon = config?.icon || Activity;

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeSidebar();
    };
    
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }
  }, [isOpen, closeSidebar]);

  // رندر کردن لیست تسک‌های فیلتر شده
  const renderTaskList = (tasks: Task[], emptyMessage: string) => {
    if (!tasks || tasks.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
          <ListTodo size={32} className="mx-auto mb-3 opacity-50" />
          <p>{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {tasks.map((task: Task) => (
          <button
            key={task.id}
            onClick={() => {
              navigate(`/tasks/${task.id}`);
              closeSidebar();
            }}
            className={cn(
              'w-full text-left p-4 rounded-xl transition-all duration-200',
              'hover:shadow-md group border',
              isDarkMode
                ? 'bg-gray-800/50 hover:bg-gray-700/50 border-gray-700 hover:border-gray-600'
                : 'bg-gray-50 hover:bg-gray-100 border-gray-100 hover:border-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                task.status === 'done' ? 'bg-green-500' :
                task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
              )} />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="font-medium truncate">{task.title}</h4>
                  <ExternalLink 
                    size={14} 
                    className="opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1 text-gray-400" 
                  />
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2 line-clamp-2">
                    {task.description}
                  </p>
                )}
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={cn('text-xs', priorityColors[task.priority])}>
                    {task.priority}
                  </Badge>
                  <span className="text-xs text-gray-400">
                    {statusLabels[task.status]}
                  </span>
                  <span className="text-xs text-gray-400">
                    {new Date(task.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (!activeWidget) return null;

    // ویجت‌هایی که لیست تسک فیلتر شده دارند
    if (activeWidget === 'total-tasks' || activeWidget === 'in-progress' || 
        activeWidget === 'completed' || activeWidget === 'todo') {
      
      // حالا TypeScript می‌داند activeWidget یکی از این چهار نوع است
      const currentFilterLabel = filterLabels[activeWidget] || 'tasks';
      const currentFilterRoute = filterRoutes[activeWidget] || '/tasks';
      const filteredTasksCount = widgetData.filteredTasks?.length || 0;

      return (
        <div className="space-y-6">
          {/* Summary Stats */}
          <div className={cn(
            'p-4 rounded-xl',
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
          )}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-lg">
                {filteredTasksCount} {currentFilterLabel}
              </h3>
            </div>
            <div className="flex gap-4 text-sm text-gray-500">
              <span>Total: {widgetData.totalTasks}</span>
              <span>•</span>
              <span>Completion Rate: {widgetData.completionRate}%</span>
            </div>
          </div>

          {/* Task List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500">
                Tasks List
              </h3>
            </div>
            {widgetData.filteredTasks && 
              renderTaskList(
                widgetData.filteredTasks,
                `No ${currentFilterLabel} found`
              )
            }
          </div>

          {/* Action Button */}
          <Button
            onClick={() => {
              navigate(currentFilterRoute);
              closeSidebar();
            }}
            className="w-full flex items-center justify-center gap-2"
            variant="outline"
          >
            View in Board
            <ExternalLink size={16} />
          </Button>
        </div>
      );
    }

    // بقیه ویجت‌ها
    switch (activeWidget) {
      case 'task-overview':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <StatDetailCard
                icon={ListTodo}
                label="Total Tasks"
                value={widgetData.totalTasks}
                color="text-blue-600"
                bgColor="bg-blue-50 dark:bg-blue-900/30"
                onClick={() => navigate('/tasks')}
              />
              <StatDetailCard
                icon={Clock}
                label="In Progress"
                value={widgetData.inProgressCount}
                color="text-yellow-600"
                bgColor="bg-yellow-50 dark:bg-yellow-900/30"
                onClick={() => navigate('/tasks?filter=in-progress')}
              />
              <StatDetailCard
                icon={CheckCircle2}
                label="Completed"
                value={widgetData.completedCount}
                color="text-green-600"
                bgColor="bg-green-50 dark:bg-green-900/30"
                onClick={() => navigate('/tasks?filter=done')}
              />
              <StatDetailCard
                icon={ListTodo}
                label="Todo"
                value={widgetData.todoCount}
                color="text-gray-600"
                bgColor="bg-gray-50 dark:bg-gray-700/30"
                onClick={() => navigate('/tasks?filter=todo')}
              />
            </div>

            <div className={cn(
              'p-4 rounded-xl',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'
            )}>
              <div className="flex items-center gap-2 mb-4">
                <Activity size={18} className="text-blue-600" />
                <h3 className="font-semibold">Progress Overview</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Completion Rate</span>
                    <span className="font-semibold text-blue-600">{widgetData.completionRate}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                      style={{ width: `${widgetData.completionRate}%` }}
                    />
                  </div>
                </div>

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
                    <Clock size={16} className="mx-auto mb-1 text-yellow-500" />
                    <div className="text-xs">Active</div>
                    <div className="text-lg font-bold text-yellow-600">{widgetData.inProgressCount}</div>
                  </div>
                </div>
              </div>
            </div>

            <Button
              onClick={() => navigate('/tasks')}
              className="w-full flex items-center justify-center gap-2"
            >
              View All Tasks
              <ArrowRight size={16} />
            </Button>
          </div>
        );

      case 'recent-tasks':
        return (
          <div className="space-y-3">
            {widgetData.recentTasks.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Clock size={32} className="mx-auto mb-3 opacity-50" />
                <p>No recent tasks</p>
              </div>
            ) : (
              widgetData.recentTasks.map((task: Task) => (
                <button
                  key={task.id}
                  onClick={() => {
                    navigate(`/tasks/${task.id}`);
                    closeSidebar();
                  }}
                  className={cn(
                    'w-full text-left p-4 rounded-xl transition-all duration-200',
                    'hover:shadow-md group',
                    isDarkMode
                      ? 'bg-gray-800/50 hover:bg-gray-700/50'
                      : 'bg-gray-50 hover:bg-gray-100'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-2 h-2 rounded-full mt-2 flex-shrink-0',
                      task.status === 'done' ? 'bg-green-500' :
                      task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                    )} />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium mb-2 truncate">{task.title}</h4>
                      {task.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                          {task.description.slice(0, 100)}
                          {task.description.length > 100 ? '...' : ''}
                        </p>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge className={cn('text-xs', priorityColors[task.priority])}>
                          {task.priority}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {new Date(task.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                    </div>
                    <ArrowRight 
                      size={16} 
                      className="opacity-0 group-hover:opacity-100 transition-all mt-2 flex-shrink-0" 
                    />
                  </div>
                </button>
              ))
            )}
            <Button
              onClick={() => navigate('/tasks')}
              variant="outline"
              className="w-full flex items-center justify-center gap-2 mt-4"
            >
              View All Tasks
              <ArrowRight size={16} />
            </Button>
          </div>
        );

      case 'priority-breakdown': {
        const total = widgetData.totalTasks;
        const priorities = [
          { 
            key: 'high' as const, 
            label: 'High Priority', 
            count: widgetData.priorityData.high,
            color: 'from-red-500 to-red-600',
            textColor: 'text-red-600',
            Icon: AlertTriangle,
          },
          { 
            key: 'medium' as const, 
            label: 'Medium Priority', 
            count: widgetData.priorityData.medium,
            color: 'from-yellow-500 to-yellow-600',
            textColor: 'text-yellow-600',
            Icon: Flag,
          },
          { 
            key: 'low' as const, 
            label: 'Low Priority', 
            count: widgetData.priorityData.low,
            color: 'from-green-500 to-green-600',
            textColor: 'text-green-600',
            Icon: Flag,
          },
        ];

        return (
          <div className="space-y-6">
            {priorities.map((priority) => {
              const percentage = total > 0 ? (priority.count / total) * 100 : 0;
              
              return (
                <div key={priority.key} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <priority.Icon size={20} className={priority.textColor} />
                      <span className="font-medium">{priority.label}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{priority.count}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                        priority.color
                      )}
                      style={{ width: `${Math.max(percentage, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}

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

            <Button
              onClick={() => navigate('/tasks')}
              className="w-full flex items-center justify-center gap-2"
            >
              Manage Priorities
              <ArrowRight size={16} />
            </Button>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && config && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />
          
          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{
              type: 'spring',
              damping: 25,
              stiffness: 200,
              mass: 0.8,
            }}
            className={cn(
              'fixed top-0 right-0 h-full w-full max-w-lg z-50',
              'shadow-2xl border-l',
              isDarkMode
                ? 'bg-gray-900 border-gray-800 text-gray-100'
                : 'bg-white border-gray-200 text-gray-900'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'p-2 rounded-lg',
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
                )}>
                  <Icon size={20} />
                </div>
                <h2 className="text-lg font-semibold">
                  {config.title}
                </h2>
              </div>
              <button
                onClick={closeSidebar}
                className={cn(
                  'p-1.5 rounded-lg transition-colors',
                  isDarkMode
                    ? 'hover:bg-gray-800 text-gray-400 hover:text-gray-200'
                    : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
                )}
              >
                <X size={20} />
              </button>
            </div>

            {/* Breadcrumb */}
            <Breadcrumb items={config.breadcrumbs} isDarkMode={isDarkMode} />

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-130px)] p-6">
              {renderContent()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper component for stat cards in sidebar
interface StatDetailCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  onClick: () => void;
}

const StatDetailCard: React.FC<StatDetailCardProps> = ({ 
  icon: Icon, label, value, color, bgColor, onClick 
}) => (
  <button
    onClick={onClick}
    className={cn(
      'p-4 rounded-xl transition-all duration-200 hover:shadow-md text-left',
      'border border-transparent hover:border-gray-200 dark:hover:border-gray-700',
      bgColor
    )}
  >
    <Icon size={20} className={cn(color, 'mb-2')} />
    <div className="text-2xl font-bold">{value}</div>
    <div className="text-xs text-gray-500 mt-1">{label}</div>
  </button>
);