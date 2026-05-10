import React from 'react';
import { FileText, Moon, Sun } from 'lucide-react';
import { Separator } from '@/components/ui/separator/Separator';
import { SidebarItem } from './SidebarItem';
import { useApp } from '@/providers/AppProvider';
import { useSearchControl } from '../hooks/useSearchControl';
import { cn } from '@/lib/utils';
import { useQuickNotesStore } from '@/stores/quick-notes.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store'; // اضافه کن
import { useQuickNotesControl } from '../hooks/useQuickNotesControl';
import { useSettingsControl } from '../hooks/useSettingsControl';
import { NotificationBell } from '@/components/notifications/NotificationBell';

interface SidebarToolsSectionProps {
  variant?: 'icon-only' | 'full';
}

export const SidebarToolsSection: React.FC<SidebarToolsSectionProps> = ({ variant = 'icon-only' }) => {
  const { isDarkMode, toggleDarkMode } = useApp();
  const { SearchIcon, isSearchOpen, isSearchMinimized, handleSearchClick, searchLabel } = useSearchControl();

  const handleNotificationClick = () => {
    useSidebarEngineStore.getState().open('notification-center');
  };

  const { 
    QuickNotesIcon, 
    isQuickNotesOpen, 
    isQuickNotesMinimized, 
    handleQuickNotesClick, 
    quickNotesLabel 
  } = useQuickNotesControl();
  const { 
    SettingsIcon, 
    isSettingsOpen, 
    isSettingsMinimized, 
    handleSettingsClick, 
    settingsLabel 
  } = useSettingsControl();

  return (
    <div className={cn(
      'mx-auto gap-2 mb-4',
      variant === 'full' ? 'px-3 w-full' : ''
    )}>
      
      <SidebarItem
        id="quick-notes"
        icon={<QuickNotesIcon size={variant === 'full' ? 20 : 22} />}
        label={quickNotesLabel}
        isDarkMode={isDarkMode}
        isActive={isQuickNotesOpen}
        onClick={handleQuickNotesClick}
        variant={variant}
        className={cn(
          'text-gray-400',
          isQuickNotesOpen
            ? ''
            : isQuickNotesMinimized
              ? isDarkMode
                ? 'ring-1 hover:text-gray-200 hover:bg-gray-800 bg-gray-800/30 ring-gray-500'
                : 'ring-1 hover:text-gray-700 hover:bg-gray-100 bg-gray-100/50 ring-gray-400'
              : isDarkMode
                ? 'hover:text-gray-200 hover:bg-gray-800'
                : 'hover:text-gray-700 hover:bg-gray-100'
        )}
      />
      
      <SidebarItem
        id="search"
        icon={<SearchIcon size={variant === 'full' ? 20 : 22} />}
        label={searchLabel}
        isDarkMode={isDarkMode}
        isActive={isSearchOpen}
        onClick={handleSearchClick}
        variant={variant}
        className={cn(
          'text-gray-400',
          isSearchOpen
            ? ''
            : isSearchMinimized
              ? isDarkMode
                ? 'ring-1 hover:text-gray-200 hover:bg-gray-800 bg-gray-800/30 ring-gray-500'
                : 'ring-1 hover:text-gray-700 hover:bg-gray-100 bg-gray-100/50 ring-gray-400'
              : isDarkMode
                ? 'hover:text-gray-200 hover:bg-gray-800'
                : 'hover:text-gray-700 hover:bg-gray-100'
        )}
      />
      <NotificationBell
        onClick={handleNotificationClick}
        isDarkMode={isDarkMode}
        size={variant === 'full' ? 20 : 22}
      />
      
      {/* Settings */}
      <SidebarItem
        id="settings"
        icon={<SettingsIcon className='group-hover:rotate-90 transition-all duration-200' size={variant === 'full' ? 20 : 22} />}
        label={settingsLabel}
        isDarkMode={isDarkMode}
        isActive={isSettingsOpen}
        onClick={handleSettingsClick}
        variant={variant}
        className={cn(
          'text-gray-400',
          isSettingsOpen
            ? ''
            : isSettingsMinimized
              ? isDarkMode
                ? 'ring-1 hover:text-gray-200 hover:bg-gray-800 bg-gray-800/30 ring-gray-500'
                : 'ring-1 hover:text-gray-700 hover:bg-gray-100 bg-gray-100/50 ring-gray-400'
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