import React, { useMemo } from 'react';
import { useTaskStore } from '@/stores/task.store';
import { Widget } from '../Widget';
import { Clock, ArrowRight } from 'lucide-react';
import { useRouter } from '@/router';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge/Badge';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useDashboardSidebarStore } from '@/stores/dashboard-sidebar.store';
import { PriorityColors } from '@/components/ui/PriorityColors';

export const RecentTasksWidget: React.FC = () => {
  const tasks = useTaskStore(state => state.tasks);
  const { navigate } = useRouter();

  const recentTasks = useMemo(() => {
    return [...tasks]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 4);
  }, [tasks]);

  const openDashboardSidebar = () => {
    
    useDashboardSidebarStore.getState().openSidebar('recent-tasks', {
      totalTasks: tasks.length,
      inProgressCount: tasks.filter(t => t.status === 'in-progress').length,
      completedCount: tasks.filter(t => t.status === 'done').length,
      todoCount: tasks.filter(t => t.status === 'todo').length,
      completionRate: tasks.length > 0 
        ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
        : 0,
      recentTasks: [...tasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
      priorityData: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
      filteredTasks: [],
      activeFilter: 'all',
    });

    useSidebarEngineStore.getState().open('dashboard-sidebar');
  };

  return (
    <Widget 
      title="Recent Tasks" 
      icon={<Clock size={16} />}
      className="h-80"
      onClick={openDashboardSidebar} 
    >
      <div className="space-y-1.5">
        {recentTasks.length === 0 ? (
          <div className="text-center py-6 text-gray-400 dark:text-gray-500">
            <Clock size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks yet</p>
          </div>
        ) : (
          recentTasks.map((task) => (
            <button
              key={task.id}
              onClick={(e: React.MouseEvent) => { 
                e.stopPropagation(); 
                navigate(`/tasks/${task.id}`)
              }}
              className={cn(
                'w-full text-left p-2.5 rounded-lg transition-all duration-200',
                'hover:bg-gray-50 dark:hover:bg-gray-700/50',
                'group flex items-center gap-2.5',
                'border border-transparent hover:border-gray-200 dark:hover:border-gray-600'
              )}
            >
              <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
                <div className={cn(
                  'w-2 h-2 rounded-full',
                  task.status === 'done' ? 'bg-green-500' : 
                  task.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-400'
                )} />
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate mb-1">
                  {task.title}
                </h4>
                <div className="flex items-center gap-1.5">
                  <Badge className={cn(
                    'text-[10px] px-1.5 py-0 font-medium',
                    PriorityColors[task.priority]
                  )}>
                    {task.priority}
                  </Badge>
                  {task.description && (
                    <span className="text-[10px] text-gray-400 dark:text-gray-500 truncate">
                      {task.description.slice(0, 20)}
                      {task.description.length > 20 ? '...' : ''}
                    </span>
                  )}
                </div>
              </div>
              
              <ArrowRight 
                size={12} 
                className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 flex-shrink-0" 
              />
            </button>
          ))
        )}
      </div>
    </Widget>
  );
};