// features/TaskSidebars/view/components/tabs/RelatedTasksTab.tsx
import React from 'react';
import { Link2, ArrowRight, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { SectionHeader } from '../shared/SectionHeader';
import { EmptyState } from '../shared/EmptyState';
import { useTaskStore } from '@/stores/task.store';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { Badge } from '@/components/ui/badge/Badge';
import { PriorityColors } from '@/components/ui/PriorityColors';

interface RelatedTasksTabProps {
  task: Task;
  isDarkMode?: boolean;
}

export const RelatedTasksTab: React.FC<RelatedTasksTabProps> = ({ task, isDarkMode }) => {
  const { tasks, removeRelatedTask } = useTaskStore();
  const { openViewSidebar } = useTaskSidebarStore();

  const relatedTasks = task.relatedTasks
    .map(id => tasks.find(t => t.id === id))
    .filter(Boolean) as Task[];

  if (relatedTasks.length === 0) {
    return (
      <EmptyState
        icon={Link2}
        title="No related tasks"
        description="Link related tasks to show dependencies and connections"
        isDarkMode={isDarkMode}
      />
    );
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'completed': 'bg-green-500',
      'active': 'bg-blue-500',
      'on-hold': 'bg-yellow-500',
      'archived': 'bg-gray-400',
    };
    return colors[status] || 'bg-gray-400';
  };

  return (
    <div className="space-y-4">
      <SectionHeader
        icon={Link2}
        title="Related Tasks"
        description={`${relatedTasks.length} linked task${relatedTasks.length > 1 ? 's' : ''}`}
        isDarkMode={isDarkMode}
      />

      <div className="space-y-2">
        {relatedTasks.map((relatedTask) => (
          <div
            key={relatedTask.id}
            className={cn(
              "group flex items-center gap-3 p-3 rounded-xl border transition-all duration-200",
              "cursor-pointer hover:shadow-sm",
              isDarkMode
                ? "bg-gray-800/50 border-gray-700 hover:border-gray-600 hover:bg-gray-800"
                : "bg-gray-50 border-gray-200 hover:border-gray-300 hover:bg-gray-100"
            )}
            onClick={() => openViewSidebar(relatedTask)}
          >
            {/* Status Indicator */}
            <div className={cn(
              "w-2.5 h-2.5 rounded-full flex-shrink-0",
              getStatusColor(relatedTask.status)
            )} />

            {/* Task Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className={cn(
                  "text-sm font-medium truncate",
                  isDarkMode ? "text-gray-200" : "text-gray-800"
                )}>
                  {relatedTask.title}
                </h4>
                <Badge
                  className={cn(
                    "text-[10px] px-1.5 py-0",
                    PriorityColors[relatedTask.priority]
                  )}
                >
                  {relatedTask.priority}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-500"}>
                  {relatedTask.columnId}
                </span>
                {relatedTask.dueDate && (
                  <>
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                    <span className={isDarkMode ? "text-gray-500" : "text-gray-400"}>
                      Due {new Date(relatedTask.dueDate).toLocaleDateString()}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openViewSidebar(relatedTask);
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  isDarkMode
                    ? "hover:bg-gray-700 text-gray-400"
                    : "hover:bg-gray-200 text-gray-500"
                )}
                title="View task"
              >
                <ArrowRight size={14} />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeRelatedTask(task.id, relatedTask.id);
                }}
                className={cn(
                  "p-1.5 rounded-lg transition-colors",
                  "hover:bg-red-100 dark:hover:bg-red-900/30",
                  "text-red-400 hover:text-red-600"
                )}
                title="Remove relation"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className={cn(
        "p-4 rounded-xl mt-4",
        isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50"
      )}>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              {relatedTasks.filter(t => t.status === 'completed').length}
            </p>
            <p className="text-xs text-gray-400">Completed</p>
          </div>
          <div>
            <p className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              {relatedTasks.filter(t => t.status === 'active').length}
            </p>
            <p className="text-xs text-gray-400">Active</p>
          </div>
          <div>
            <p className={cn(
              "text-2xl font-bold",
              isDarkMode ? "text-gray-200" : "text-gray-800"
            )}>
              {relatedTasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date()).length}
            </p>
            <p className="text-xs text-gray-400">Overdue</p>
          </div>
        </div>
      </div>
    </div>
  );
};