// src/features/TaskSidebar/components/SubTaskList.tsx

import React from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useTaskStore } from '@/stores/task.store';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';

interface SubTaskListProps {
  parentTaskId: string;
  subTaskIds: string[];
  disabled?: boolean;
  className?: string;
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  parentTaskId,
  subTaskIds,
  disabled = false,
  className,
}) => {
  const { isDarkMode } = useApp();
  const { tasks, toggleSubTask, removeSubTask } = useTaskStore();
  const { openCreateSubTaskSidebar, openViewSidebar } = useTaskSidebarStore();

  const subTaskItems = subTaskIds.map(id => tasks.find(t => t.id === id)).filter(Boolean) as typeof tasks;

  const completedCount = subTaskItems.filter(t => t.columnId === 'done').length;
  const progress = subTaskItems.length > 0 ? Math.round((completedCount / subTaskItems.length) * 100) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress */}
      {subTaskItems.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {completedCount} of {subTaskItems.length} completed
            </span>
            <span className="font-medium text-blue-500">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Items */}
      {subTaskItems.length === 0 && !disabled && (
        <p className="text-xs text-gray-400 text-center py-4">
          No sub-tasks yet. Add one to break down this task.
        </p>
      )}

      <div className="space-y-1">
        {subTaskItems.map((st) => (
          <div
            key={st.id}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg group transition-colors',
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
            )}
          >
            <button
              type="button"
              onClick={() => toggleSubTask(st.id)}
              disabled={disabled}
              className="flex-shrink-0"
            >
              {st.columnId === 'done' ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <Circle size={16} className="text-gray-400" />
              )}
            </button>
            <span
              className={cn(
                'flex-1 text-xs cursor-pointer hover:underline',
                st.columnId === 'done' && 'line-through opacity-50',
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              )}
              onClick={() => openViewSidebar(st)}
            >
              {st.title}
            </span>
            <button
              type="button"
              onClick={() => openViewSidebar(st)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <ExternalLink size={12} className="text-gray-400" />
            </button>
            {!disabled && (
              <button
                type="button"
                onClick={() => removeSubTask(parentTaskId, st.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Add button */}
      {!disabled && (
        <button
          type="button"
          onClick={() => openCreateSubTaskSidebar(parentTaskId)}
          className={cn(
            'w-full flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium border-2 border-dashed transition-colors',
            isDarkMode
              ? 'border-gray-700 text-gray-400 hover:border-gray-600 hover:text-gray-200'
              : 'border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-700'
          )}
        >
          <Plus size={14} />
          Add Sub-task
        </button>
      )}
    </div>
  );
};

SubTaskList.displayName = 'SubTaskList';