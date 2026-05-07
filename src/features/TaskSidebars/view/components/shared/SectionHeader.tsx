// features/TaskSidebars/view/components/shared/SectionHeader.tsx
import React from 'react';
import { cn } from '@/lib/utils';

interface SectionHeaderProps {
  icon?: React.ElementType;
  title: string;
  description?: string;
  isDarkMode?: boolean;
  className?: string;
  action?: React.ReactNode;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  icon: Icon,
  title,
  description,
  isDarkMode,
  className,
  action,
}) => {
  return (
    <div className={cn("flex items-start justify-between mb-4", className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className={cn(
            "p-2 rounded-lg",
            isDarkMode ? "bg-gray-800" : "bg-gray-100"
          )}>
            <Icon size={18} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
          </div>
        )}
        <div>
          <h3 className={cn(
            "text-base font-semibold",
            isDarkMode ? "text-gray-200" : "text-gray-800"
          )}>
            {title}
          </h3>
          {description && (
            <p className={cn(
              "text-xs mt-0.5",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}>
              {description}
            </p>
          )}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
};