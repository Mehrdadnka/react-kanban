import React from 'react';
import { cn } from '@/lib/utils';

interface PriorityItem {
  key: string;
  label: string;
  count: number;
  total: number;
  color: string;
  textColor: string;
  icon: React.ElementType;
  bgColor?: string;
}

interface SidebarPriorityListProps {
  items: PriorityItem[];
  onItemClick?: (key: string) => void;
  emptyMessage?: string;
  emptyIcon?: React.ElementType;
  className?: string;
}

export const SidebarPriorityList: React.FC<SidebarPriorityListProps> = ({ 
  items, 
  onItemClick,
  emptyMessage = 'No items to show',
  emptyIcon: EmptyIcon,
  className,
}) => {
  if (items.length === 0) {
    return (
      <div className={cn("text-center py-8 text-gray-400", className)}>
        {EmptyIcon && <EmptyIcon size={32} className="mx-auto mb-3 opacity-50" />}
        <p className="text-sm">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {items.map((item) => {
        const percentage = item.total > 0 ? (item.count / item.total) * 100 : 0;
        const Icon = item.icon;

        return (
          <div 
            key={item.key} 
            className={cn(
              'space-y-2',
              onItemClick && 'cursor-pointer hover:opacity-80 transition-opacity'
            )}
            onClick={() => onItemClick?.(item.key)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Icon size={16} className={item.textColor} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.count}
                </span>
                <span className="text-xs text-gray-400">
                  ({percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                  item.color
                )}
                style={{ width: `${Math.max(percentage, 2)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

SidebarPriorityList.displayName = 'SidebarPriorityList';