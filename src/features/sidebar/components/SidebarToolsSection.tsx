// src/features/sidebar/components/SidebarToolsSection.tsx
import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { Separator } from '@/components/ui/separator/Separator';
import { SidebarItem } from './SidebarItem';
import { useApp } from '@/providers/AppProvider';
import { useSearchControl } from '../hooks/useSearchControl';
import { cn } from '@/lib/utils';

interface SidebarToolsSectionProps {
  variant?: 'icon-only' | 'full';
}

export const SidebarToolsSection: React.FC<SidebarToolsSectionProps> = ({ variant = 'icon-only' }) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const { SearchIcon, isSearchOpen, isSearchMinimized, handleSearchClick, searchLabel } = useSearchControl();

  return (
    <div className={cn(
      'mx-auto gap-2 mb-4',
      variant === 'full' ? 'px-3 w-full' : ''
    )}>
      <SidebarItem
        id="search"
        icon={<SearchIcon size={variant === 'full' ? 20 : 22} />}
        label={searchLabel}
        isDarkMode={isDarkMode}
        isActive={isSearchOpen}
        onClick={handleSearchClick}
        variant={variant}
        className={cn(
          'text-gray-400 ring-1',
          isSearchOpen
            ? ''
            : isSearchMinimized
              ? isDarkMode
                ? 'hover:text-gray-200 hover:bg-gray-800 bg-gray-800/30 ring-gray-500'
                : 'hover:text-gray-700 hover:bg-gray-100 bg-gray-100/50 ring-gray-400'
              : isDarkMode
                ? 'hover:text-gray-200 hover:bg-gray-800'
                : 'hover:text-gray-700 hover:bg-gray-100'
        )}
      />

      <Separator isDarkMode={isDarkMode} className={cn(
        'mx-auto',
        variant === 'full' ? 'w-full' : 'w-10'
      )} size='2' />

      <SidebarItem
        id="theme"
        icon={isDarkMode ? <Sun size={variant === 'full' ? 20 : 20} /> : <Moon size={variant === 'full' ? 20 : 20} />}
        label={isDarkMode ? 'Light Mode' : 'Dark Mode'}
        isDarkMode={isDarkMode}
        onClick={toggleDarkMode}
        variant={variant}
        className={
          isDarkMode
            ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        }
      />
    </div>
  );
};