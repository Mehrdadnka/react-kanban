import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Moon, Sun, Home, CheckSquare, Search, ListTodo } from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { useRouter } from '@/router';
import { SearchDialog } from './SearchDialog';

interface NavItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  path?: string;
  isActive?: boolean;
}

const Sidebar = () => {
  const { isDarkMode, toggleDarkMode, time } = useApp();
  const { navigate, currentPath } = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);

  const mainNavItems: NavItem[] = [
    { id: 'home', icon: <Home size={22} />, path: '/', label: 'Home' },
    { id: 'tasks', icon: <ListTodo size={22} />, path: '/tasks', label: 'Tasks' },
  ];

  const handleNavigation = (path: string) => {
    if (path) {
      navigate(path);
    }
  };

  return (
    <>
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
            {mainNavItems.map((item) => {
              const isActive =
                currentPath === item.path ||
                (item.path !== '/' && currentPath.startsWith(item.path as string));

              return (
                <Tooltip.Root key={item.id} delayDuration={300}>
                  <Tooltip.Trigger asChild>
                    <button
                      onClick={() => handleNavigation(item.path as string)}
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
                      {item.icon}
                    </button>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content
                      side="right"
                      sideOffset={10}
                      className={cn(
                        'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                        isDarkMode
                          ? 'bg-gray-800 border-gray-700 text-gray-200'
                          : 'bg-white border-gray-200 text-gray-700'
                      )}
                    >
                      {item.label}
                      <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              );
            })}

            {/* Search Button - Inside nav */}
            <Tooltip.Root delayDuration={300}>
              <Tooltip.Trigger asChild>
                <button
                  onClick={() => setSearchOpen(true)}
                  className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center mt-1',
                    isDarkMode
                      ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                      : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <Search size={22} />
                </button>
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="right"
                  sideOffset={10}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-200 text-gray-700'
                  )}
                >
                  Search
                  <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </nav>

          <div className="flex-1" /> {/* Spacer to push theme and clock to bottom */}

          <div className={cn('w-8 h-px mx-auto my-2', isDarkMode ? 'bg-gray-700' : 'bg-gray-200')} />

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
                side="right"
                sideOffset={10}
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

          {/* Clock Display */}
          <div className="w-full px-2 pb-4">
            <div
              className={cn(
                'text-center',
                'transition-all duration-300',
                isDarkMode
                  ? 'bg-gray-800/50 border border-gray-700/50'
                  : 'bg-gray-100/50 border border-gray-200/50'
              )}
            >
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

      {/* Search Dialog - Rendered outside aside */}
      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
};

export default Sidebar;