// features/TaskSidebars/view/components/shared/EmptyState.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  isDarkMode?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  isDarkMode,
  className,
  action,
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-12 px-4 text-center rounded-xl",
      isDarkMode ? "bg-gray-800/30" : "bg-gray-50/50",
      className
    )}>
      <div className={cn(
        "p-4 rounded-full mb-4",
        isDarkMode ? "bg-gray-800" : "bg-gray-100"
      )}>
        <Icon size={32} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
      </div>
      <h4 className={cn(
        "text-sm font-medium mb-1",
        isDarkMode ? "text-gray-300" : "text-gray-600"
      )}>
        {title}
      </h4>
      {description && (
        <p className={cn(
          "text-xs max-w-xs",
          isDarkMode ? "text-gray-500" : "text-gray-400"
        )}>
          {description}
        </p>
      )}
      {action && (
        <div className="mt-4">
          {action}
        </div>
      )}
    </div>
  );
};