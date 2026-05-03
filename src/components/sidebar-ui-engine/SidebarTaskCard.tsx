import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';

import { Badge } from '@/components/ui/badge/Badge';
import { PriorityColors } from '@/components/ui/PriorityColors';
import { useApp } from '@/providers/AppProvider';
import { Task } from '@/types/task.types';
import { cn } from '@/lib/utils';

const STATUS_LABELS: Record<string, string> = {
  todo: 'To Do',
  'in-progress': 'In Progress',
  done: 'Done',
};

const STATUS_COLORS: Record<string, string> = {
  done: 'bg-green-500',
  'in-progress': 'bg-blue-500',
  todo: 'bg-gray-400',
};

interface SidebarTaskCardProps {
  task: Task;
  onClick: (taskId: string) => void;
  variant?: 'compact' | 'detailed';
  className?: string;
}

export const SidebarTaskCard: React.FC<SidebarTaskCardProps> = ({
  task,
  onClick,
  variant = 'detailed',
  className,
}) => {
  const { isDarkMode } = useApp();

  const styles = {
    textPrimary: isDarkMode ? 'text-gray-100' : 'text-gray-900',
    textSecondary: isDarkMode ? 'text-gray-400' : 'text-gray-500',
    textTertiary: isDarkMode ? 'text-gray-500' : 'text-gray-400',
  };

  const compactStyles = {
    bgHover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50',
    borderHover: isDarkMode ? 'hover:border-gray-600' : 'hover:border-gray-200',
  };

  const detailedStyles = {
    bgCard: isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50',
    bgCardHover: isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100',
    borderCard: isDarkMode ? 'border-gray-700' : 'border-gray-100',
    borderCardHover: isDarkMode ? 'hover:border-gray-600' : 'hover:border-gray-200',
  };

  const handleClick = () => {
    onClick(task.id);
  };

const formatDate = (date: Date | string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

  const truncateText = (text: string, maxLength: number) => {
    return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
  };

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        className={cn(
          'w-full text-left p-2.5 rounded-lg transition-all duration-200',
          'group flex items-center gap-2.5',
          'border border-transparent',
          compactStyles.bgHover,
          compactStyles.borderHover,
          className
        )}
      >
        <div
          className={cn(
            'w-2 h-2 rounded-full flex-shrink-0',
            STATUS_COLORS[task.columnId] || 'bg-gray-400'
          )}
        />

        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-medium truncate mb-1', styles.textPrimary)}>
            {task.title}
          </h4>
          <div className="flex items-center gap-1.5">
            <Badge
              className={cn('text-[10px] px-1.5 py-0 font-medium', PriorityColors[task.priority])}
            >
              {task.priority}
            </Badge>
            {task.description && (
              <span className={cn('text-[10px] truncate', styles.textSecondary)}>
                {truncateText(task.description, 20)}
              </span>
            )}
          </div>
        </div>

        <ArrowRight
          size={12}
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0',
            styles.textTertiary
          )}
        />
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full text-left p-4 rounded-xl transition-all duration-200',
        'hover:shadow-md group border',
        detailedStyles.bgCard,
        detailedStyles.bgCardHover,
        detailedStyles.borderCard,
        detailedStyles.borderCardHover,
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            'w-2 h-2 rounded-full mt-2 flex-shrink-0',
            STATUS_COLORS[task.columnId] || 'bg-gray-400'
          )}
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn('font-medium truncate', styles.textPrimary)}>{task.title}</h4>
            <ExternalLink
              size={14}
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1',
                styles.textTertiary
              )}
            />
          </div>

          {task.description && (
            <p className={cn('text-sm mb-2 line-clamp-2', styles.textSecondary)}>
              {task.description}
            </p>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className={cn('text-xs capitalize', PriorityColors[task.priority])}
            >
              {task.priority}
            </Badge>
            <span className={cn('text-xs', styles.textSecondary)}>
              {STATUS_LABELS[task.columnId] || task.columnId}
            </span>
            <span className={cn('text-xs', styles.textTertiary)}>
              {formatDate(task.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

SidebarTaskCard.displayName = 'SidebarTaskCard';