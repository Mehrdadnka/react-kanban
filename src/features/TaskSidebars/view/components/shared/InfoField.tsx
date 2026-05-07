// features/TaskSidebars/view/components/shared/InfoField.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface InfoFieldProps {
  label: string;
  icon?: React.ElementType;
  children: React.ReactNode;
  isDarkMode?: boolean;
  className?: string;
  action?: React.ReactNode;
  highlight?: boolean;
}

export const InfoField: React.FC<InfoFieldProps> = ({
  label,
  icon: Icon,
  children,
  isDarkMode,
  className,
  action,
  highlight,
}) => {
  return (
    <div className={cn(
      "flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-3 px-1",
      "border-b border-gray-100 dark:border-gray-800 last:border-0",
      "transition-colors duration-200",
      highlight && (isDarkMode ? "bg-blue-900/10" : "bg-blue-50/50"),
      className
    )}>
      <div className="flex items-center gap-2 min-w-[140px] sm:min-w-[160px]">
        {Icon && (
          <Icon size={14} className={isDarkMode ? "text-gray-500" : "text-gray-400"} />
        )}
        <span className={cn(
          "text-xs font-medium uppercase tracking-wider",
          isDarkMode ? "text-gray-400" : "text-gray-500"
        )}>
          {label}
        </span>
      </div>
      <div className="flex-1 flex items-center justify-between min-w-0">
        <div className="flex-1 text-sm min-w-0">
          {children}
        </div>
        {action && (
          <div className="flex-shrink-0 ml-2">
            {action}
          </div>
        )}
      </div>
    </div>
  );
};