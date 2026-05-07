import { cn } from '@/lib/utils';
import * as Tooltip from '@radix-ui/react-tooltip';
import React from 'react'

interface SidebarItemProps {
  id: string;
  icon: React.ReactNode;
  label: string;
  isDarkMode?: boolean;
  onClick?: () => void;
  isActive?: boolean;
  className?: string;
  variant?: 'icon-only' | 'full';
}

export const SidebarItem: React.FC<SidebarItemProps> = ({ 
  id, 
  icon, 
  label, 
  isDarkMode = false,
  onClick,
  isActive = false,
  className,
  variant = 'icon-only',
}) => {
  const isFull = variant === 'full';

  const button = (
    <button
      onClick={onClick}
      className={cn(
        'rounded-xl flex items-center transition-all duration-200 relative group',
        'hover:shadow-sm group',
        'hover:scale-[1.02]',
        isFull 
          ? 'w-full gap-3 px-3 py-2.5' 
          : 'w-10 h-10 justify-center',
        isActive
          ? isDarkMode
            ? 'bg-gray-800 text-blue-400 shadow-lg shadow-blue-500/20'
            : 'bg-blue-100 text-blue-600 shadow-md'
          : isDarkMode
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100',
        className
      )}
      aria-label={label}
    >
      <div className="relative flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      
      {isFull && (
        <span className="text-sm font-medium truncate">
          {label}
        </span>
      )}
    </button>
  );

  // Full variant: no tooltip needed, label is visible
  if (isFull) return button;

  // Icon-only: wrap in tooltip
  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        {button}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="right"
          sideOffset={10}
          className={cn(
            'rounded-lg px-3 py-1.5 text-sm font-medium',
            'shadow-lg border z-[9999]',
            'animate-in fade-in-0 zoom-in-95',
            isDarkMode
              ? 'bg-gray-800/95 border-gray-700 text-gray-200'
              : 'bg-white/95 border-gray-200 text-gray-700'
          )}
        >
          {label}
          <Tooltip.Arrow 
            className={isDarkMode ? 'fill-gray-800' : 'fill-white'}
          />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
};