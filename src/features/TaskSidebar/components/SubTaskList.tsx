// ──── src/features/TaskSidebar/SubTaskList.tsx ────

import React, { useState } from 'react';
import { Plus, Trash2, CheckCircle2, Circle, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

export interface SubTaskItem {
  id: string;
  title: string;
  completed: boolean;
}

interface SubTaskListProps {
  items: SubTaskItem[];
  onAdd: (title: string) => void;
  onRemove: (id: string) => void;
  onToggle: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

export const SubTaskList: React.FC<SubTaskListProps> = ({
  items,
  onAdd,
  onRemove,
  onToggle,
  disabled = false,
  className,
}) => {
  const { isDarkMode } = useApp();
  const [newTitle, setNewTitle] = useState('');

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    onAdd(newTitle.trim());
    setNewTitle('');
  };

  const completedCount = items.filter(i => i.completed).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Progress bar */}
      {items.length > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>
              {completedCount} of {items.length} completed
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

      {/* Add input */}
      {!disabled && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="Add sub-task..."
            className={cn(
              'flex-1 px-3 py-1.5 rounded-lg border text-xs',
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
                : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-400'
            )}
          />
          <button
            type="button"
            onClick={handleAdd}
            disabled={!newTitle.trim()}
            className={cn(
              'px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors',
              'bg-blue-500 text-white hover:bg-blue-600',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            <Plus size={14} />
          </button>
        </div>
      )}

      {/* Items */}
      {items.length === 0 && disabled && (
        <p className="text-xs text-gray-400 text-center py-4">No sub-tasks</p>
      )}
      
      <div className="space-y-1">
        {items.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center gap-2 px-2 py-1.5 rounded-lg group transition-colors',
              isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
            )}
          >
            <button
              type="button"
              onClick={() => onToggle(item.id)}
              disabled={disabled}
              className="flex-shrink-0"
            >
              {item.completed ? (
                <CheckCircle2 size={16} className="text-green-500" />
              ) : (
                <Circle size={16} className="text-gray-400" />
              )}
            </button>
            <span
              className={cn(
                'flex-1 text-xs',
                item.completed && 'line-through opacity-50',
                isDarkMode ? 'text-gray-200' : 'text-gray-700'
              )}
            >
              {item.title}
            </span>
            {!disabled && (
              <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
              >
                <Trash2 size={12} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

SubTaskList.displayName = 'SubTaskList';