import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Moon, Sun, Search } from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from '@/router';
import { useSearchSidebarStore } from '@/stores/sidebar-engine/search-sidebar.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useShallow } from 'zustand/react/shallow';
import { Separator } from '../ui/separator/Separator';
import { PANEL_ICONS, NAV_ICONS, WIDGET_ICONS } from '@/config/panel-icons.config';
import type { LucideIcon } from 'lucide-react';

const Sidebar = () => {
  const { isDarkMode, toggleDarkMode, time } = useApp();
  const { navigate, currentPath } = useRouter();
  const { openSearch } = useSearchSidebarStore();
  
  const searchPanelState = useSidebarEngineStore(
    useShallow((state) => state.panels['search-sidebar'])
  );
  const isSearchOpen = searchPanelState?.isOpen && !searchPanelState?.isMinimized;
  const isSearchMinimized = searchPanelState?.isMinimized;
  
  const minimizedPanelIds = useSidebarEngineStore(
    useShallow((state) => 
      Object.keys(state.panels).filter(id => state.panels[id].isMinimized)
    )
  );
  
  const restorePanel = useCallback((panelId: string) => {
    useSidebarEngineStore.getState().open(panelId);
  }, []);

  const handleSearchClick = useCallback(() => {
    if (isSearchOpen) {
      useSidebarEngineStore.getState().minimize('search-sidebar');
    } else if (isSearchMinimized) {
      openSearch();
    } else {
      openSearch();
    }
  }, [isSearchOpen, isSearchMinimized, openSearch]);

  
  const searchConfig = PANEL_ICONS['search-sidebar'];
  const SearchIcon = searchConfig.icon;

  const handleNavigation = (path: string) => {
    if (path) navigate(path);
  };

  return (
    <TooltipProvider>
      <aside
        className={cn(
          'fixed left-0 top-0 h-screen w-16 transition-all duration-300 z-50',
          'flex flex-col border-r shadow-xl',
          isDarkMode
            ? 'bg-gray-900/95 border-gray-800 text-gray-300'
            : 'bg-white/95 border-gray-200 text-gray-700'
        )}
      >
        {/* Main Navigation */}
        <nav className="flex flex-col items-center gap-1 py-4">
          {Object.entries(NAV_ICONS).map(([id, config]) => {
            const Icon = config.icon;
            const path = id === 'home' ? '/' : `/${id}`;
            const isActive = currentPath === path ||
              (path !== '/' && currentPath.startsWith(path));

            return (
              <Tooltip.Root key={id} delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <button
                    onClick={() => handleNavigation(path)}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center',
                      'transition-all duration-200 relative group',
                      isActive
                        ? isDarkMode
                          ? 'bg-gray-800 text-blue-400 shadow-lg'
                          : 'bg-blue-50 text-blue-600 shadow-md'
                        : isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                    )}
                  >
                    <Icon size={22} />
                  </button>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right" sideOffset={10}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    )}
                  >
                    {config.label}
                    <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            );
          })}
        </nav>
        

{/* Minimized Panels Section */}
{minimizedPanelIds.filter(id => id !== 'search-sidebar').length > 0 && (
  <>            
    <Separator isDarkMode={isDarkMode} className='w-10 mx-auto' size='2' />
    <div className="flex flex-col items-center gap-2 mt-4">
      {minimizedPanelIds
        .filter(id => id !== 'search-sidebar') 
        .map((panelId) => {
          // ✅ گرفتن metadata برای dashboard-sidebar
          const panel = useSidebarEngineStore.getState().getPanelState(panelId);
          let icon: LucideIcon;
          let label: string;
          
          if (panelId === 'dashboard-sidebar' && panel?.metadata?.activeWidget) {
            const widgetConfig = WIDGET_ICONS[panel.metadata.activeWidget as string];
            icon = widgetConfig?.icon || PANEL_ICONS[panelId]?.icon;
            label = widgetConfig?.label || PANEL_ICONS[panelId]?.label;
          } else {
            const baseConfig = PANEL_ICONS[panelId];
            if (!baseConfig) return null;
            icon = baseConfig.icon;
            label = baseConfig.label;
          }
          
          const Icon = icon;
          
          return (
            <Tooltip.Root key={panelId} delayDuration={300}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => restorePanel(panelId)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    'transition-all duration-200 relative group',
                    isDarkMode
                      ? 'text-gray-500 hover:text-gray-200 hover:bg-gray-800 bg-gray-800/30 ring-1 ring-gray-700'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100 bg-gray-100/50 ring-1 ring-gray-200'
                  )}
                >
                  <Icon size={20} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right" sideOffset={10}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-200 text-gray-700'
                  )}
                >
                  {label} (Minimized)
                  <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          );
        })}
    </div>
  </>
)}

        <div className="flex-1" />
        
        {/* Search Button */}
        <div className="mx-auto gap-2 mb-4">
          <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
              <button
                onClick={handleSearchClick}
                className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  'transition-all duration-200 relative group',
                  isSearchOpen
                    ? isDarkMode
                      ? 'bg-gray-800 text-blue-400 shadow-lg'
                      : 'bg-blue-50 text-blue-600 shadow-md'
                    : isSearchMinimized
                      ? isDarkMode
                        ? 'text-gray-500 bg-gray-800/30 ring-1 ring-gray-700'
                        : 'text-gray-400 bg-gray-100/50 ring-1 ring-gray-200'
                      : isDarkMode
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'  
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                )}
              >
                <SearchIcon size={22} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content
                side="right" sideOffset={10}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                  isDarkMode
                    ? 'bg-gray-800 border-gray-700 text-gray-200'
                    : 'bg-white border-gray-200 text-gray-700'
                )}
              >
                {isSearchMinimized ? `${searchConfig.label} (Minimized)` : isSearchOpen ? `Close ${searchConfig.label}` : searchConfig.label}
                <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        <Separator isDarkMode={isDarkMode} className='w-10 mx-auto' size='2' />

        {/* Theme toggle */}
        <Tooltip.Root delayDuration={300}>
          <Tooltip.Trigger asChild>
            <button
              onClick={toggleDarkMode}
              className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2',
                isDarkMode
                  ? 'text-yellow-400 hover:text-yellow-300 hover:bg-gray-800'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              )}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content
              side="right" sideOffset={10}
              className={cn(
                'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                isDarkMode
                  ? 'bg-gray-800 border-gray-700 text-gray-200'
                  : 'bg-white border-gray-200 text-gray-700'
              )}
            >
              {isDarkMode ? 'Light Mode' : 'Dark Mode'}
              <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>

        {/* Clock */}
        <div className="w-full px-2 pb-4">
          <div className={cn(
            'text-center rounded-lg py-1.5',
            'transition-all duration-300',
            isDarkMode
              ? 'bg-gray-800/50 border border-gray-700/50'
              : 'bg-gray-100/50 border border-gray-200/50'
          )}>
            <div className="whitespace-nowrap text-xs font-mono font-bold tracking-tight">
              {time.toLocaleTimeString('en-US', {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
              })}
            </div>
            <div className={cn('text-[10px] font-mono', isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
              {time.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
};

export default Sidebar;