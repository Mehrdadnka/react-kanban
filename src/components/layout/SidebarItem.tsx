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
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  id, 
  icon, 
  label, 
  isDarkMode = false,
  onClick,
  isActive = false,
}) => {
  return (
    <Tooltip.Root delayDuration={300}>
      <Tooltip.Trigger asChild>
        <button
          onClick={onClick}
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center',
            'transition-all duration-200 relative group',
            'hover:scale-105',
            isActive
              ? isDarkMode
                ? 'bg-gray-800 text-blue-400 shadow-lg shadow-blue-500/20'
                : 'bg-blue-50 text-blue-600 shadow-md'
              : isDarkMode
                ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
          )}
          aria-label={label}
        >
          <div className="relative flex items-center justify-center">
            {icon}
          </div>
          {isActive && (
            <div className={cn(
              'absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full',
              isDarkMode ? 'bg-blue-400' : 'bg-blue-500'
            )} />
          )}
        </button>
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

export default SidebarItem;