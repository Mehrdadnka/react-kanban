// src/components/sidebar-ui-engine/SidebarProgressBar.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SidebarProgressBarProps {
  label: string;
  value: number;
  max?: number;
  color?: string;
  showPercentage?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const SidebarProgressBar: React.FC<SidebarProgressBarProps> = ({
  label,
  value,
  max = 100,
  color = 'from-blue-500 to-purple-500',
  showPercentage = true,
  className,
  children
}) => {
  const { isDarkMode } = useApp();
  const percentage = Math.round((value / max) * 100);

  return (
    <div className={className}>
      <div className="flex justify-between text-sm mb-2">
        <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>
          {label}
        </span>
        <div className="flex items-center gap-2">
          {children}
          {showPercentage && (
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              {percentage}%
            </span>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
        <div
          className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', color)}
          style={{ width: `${Math.max(percentage, 2)}%` }}
        />
      </div>
    </div>
  );
};

SidebarProgressBar.displayName = 'SidebarProgressBar';