// src/features/sidebar/components/SidebarClock.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SidebarClockProps {
  variant?: 'icon-only' | 'full';
}

export const SidebarClock: React.FC<SidebarClockProps> = ({ variant = 'icon-only' }) => {
  const { isDarkMode, time } = useApp();
  const isFull = variant === 'full';

  return (
    <div className={cn(
      'w-full pb-4',
      isFull ? 'px-3' : 'px-2'
    )}>
      <div className={cn(
        'rounded-lg transition-all duration-300',
        isFull
          ? 'flex flex-row items-center justify-between px-4 py-3'
          : 'text-center py-3 lg:py-1.5',
        isDarkMode
          ? 'bg-gray-800/50 border border-gray-700/50'
          : 'bg-gray-100/50 border border-gray-200/50'
      )}>
        {/* Time */}
        <div className={cn(
          'font-mono font-bold tracking-tight',
          isFull ? 'text-sm' : 'text-xs whitespace-nowrap'
        )}>
          {time.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>

        {/* Date - always show, but different layout per variant */}
        <div className={cn(
          'font-mono',
          isFull
            ? 'text-xs'
            : 'text-[10px]',
          isDarkMode ? 'text-gray-500' : 'text-gray-400',
          !isFull && 'mt-0.5'
        )}>
          {time.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};