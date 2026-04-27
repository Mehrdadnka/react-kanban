import React from 'react';
import { cn } from '@/lib/utils';

interface WidgetProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  colSpan?: 'full' | 'half' | 'third';
  fullHeight?: boolean;
}

export const Widget: React.FC<WidgetProps> = ({ 
  title, 
  icon, 
  children, 
  className,
  colSpan = 'third',
  fullHeight = false
}) => {
  const colSpanClasses = {
    full: 'md:col-span-3',
    half: 'md:col-span-2',
    third: 'md:col-span-1'
  };

  return (
    <div className={cn(
      'bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700',
      'p-4 lg:p-6 transition-all duration-200 hover:shadow-md',
      'flex flex-col',
      fullHeight ? 'h-full' : 'max-h-full',
      colSpanClasses[colSpan],
      className
    )}>
      <div className="flex items-center gap-2 mb-3 flex-shrink-0">
        {icon && <span className="text-gray-400">{icon}</span>}
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      </div>
      <div className="flex-1 min-h-0 overflow-auto">
        {children}
      </div>
    </div>
  );
};
