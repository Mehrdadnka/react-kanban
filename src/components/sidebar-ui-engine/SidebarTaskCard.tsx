// src/components/sidebar-ui-engine/SidebarTaskCard.tsx
import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge/Badge';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { PriorityColors } from '@/components/ui/PriorityColors';
import { useApp } from '@/providers/AppProvider';

const statusLabels: Record<Task['status'], string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const statusColor: Record<Task['status'], string> = {
  'done': 'bg-green-500',
  'in-progress': 'bg-blue-500',
  'todo': 'bg-gray-400',
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

  // ========== COMMON STYLES ==========
  const textPrimary = isDarkMode ? 'text-gray-100' : 'text-gray-900';
  const textSecondary = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const textTertiary = isDarkMode ? 'text-gray-500' : 'text-gray-400';
  const bgHover = isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50';
  const borderHover = isDarkMode ? 'hover:border-gray-600' : 'hover:border-gray-200';
  const bgCard = isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50';
  const bgCardHover = isDarkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-100';
  const borderCard = isDarkMode ? 'border-gray-700' : 'border-gray-100';
  const borderCardHover = isDarkMode ? 'hover:border-gray-600' : 'hover:border-gray-200';

  // ========== COMPACT VARIANT ==========
  if (variant === 'compact') {
    return (
      <button
        onClick={() => onClick(task.id)}
        className={cn(
          'w-full text-left p-2.5 rounded-lg transition-all duration-200',
          'group flex items-center gap-2.5',
          'border border-transparent',
          bgHover,
          borderHover,
          className
        )}
      >
        {/* Status dot */}
        <div className={cn('w-2 h-2 rounded-full flex-shrink-0', statusColor[task.status])} />
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className={cn('text-sm font-medium truncate mb-1', textPrimary)}>
            {task.title}
          </h4>
          <div className="flex items-center gap-1.5">
            <Badge 
              className={cn(
                'text-[10px] px-1.5 py-0 font-medium',
                PriorityColors[task.priority]
              )}
            >
              {task.priority}
            </Badge>
            {task.description && (
              <span className={cn('text-[10px] truncate', textSecondary)}>
                {task.description.slice(0, 20)}
                {task.description.length > 20 ? '...' : ''}
              </span>
            )}
          </div>
        </div>
        
        {/* Arrow */}
        <ArrowRight 
          size={12} 
          className={cn(
            'opacity-0 group-hover:opacity-100 transition-all duration-200 flex-shrink-0',
            textTertiary
          )} 
        />
      </button>
    );
  }

  // ========== DETAILED VARIANT ==========
  return (
    <button
      onClick={() => onClick(task.id)}
      className={cn(
        'w-full text-left p-4 rounded-xl transition-all duration-200',
        'hover:shadow-md group border',
        bgCard,
        bgCardHover,
        borderCard,
        borderCardHover,
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Status dot */}
        <div className={cn('w-2 h-2 rounded-full mt-2 flex-shrink-0', statusColor[task.status])} />
        
        <div className="flex-1 min-w-0">
          {/* Title + External link */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className={cn('font-medium truncate', textPrimary)}>
              {task.title}
            </h4>
            <ExternalLink 
              size={14} 
              className={cn(
                'opacity-0 group-hover:opacity-100 transition-all flex-shrink-0 mt-1',
                textTertiary
              )} 
            />
          </div>
          
          {/* Description */}
          {task.description && (
            <p className={cn('text-sm mb-2 line-clamp-2', textSecondary)}>
              {task.description}
            </p>
          )}
          
          {/* Footer: Priority + Status + Date */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge 
              variant='secondary' 
              className={cn('text-xs capitalize', PriorityColors[task.priority])}
            >
              {task.priority}
            </Badge>
            <span className={cn('text-xs', textSecondary)}>
              {statusLabels[task.status]}
            </span>
            <span className={cn('text-xs', textTertiary)}>
              {new Date(task.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
};

SidebarTaskCard.displayName = 'SidebarTaskCard';