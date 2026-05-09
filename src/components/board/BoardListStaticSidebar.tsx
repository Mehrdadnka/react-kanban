import { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { 
  BarChart3, Calendar, Clock, Layout, Plus, Search, 
  TrendingUp, X, GripHorizontal
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { IconButton } from '@radix-ui/themes';

interface BoardListStaticSidebarProps {
  boardsLength?: number;
  queryValue: string;
  totalTasks: number;
  todoTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  completionRate: number;
  onQueryChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateBoardClick: () => void;
  lastUpdated: Date | null;
}

const BoardListStaticSidebar: React.FC<BoardListStaticSidebarProps> = ({
  boardsLength = 0,
  queryValue,
  totalTasks,
  todoTasks,
  inProgressTasks,
  completedTasks,
  completionRate,
  lastUpdated,
  onCreateBoardClick,
  onQueryChange,
}) => {
  const { isDarkMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);

  // ──── Shared Content ────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="p-6 space-y-6 flex-1 overflow-y-auto">
        {/* Brand / Header */}
        <div className="space-y-3">
          <div className='flex items-center justify-between'>
            <h1 className={cn(
              'text-3xl lg:text-4xl font-bold',
              'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
              'bg-clip-text text-transparent'
            )}>
              Your Boards
            </h1>
           <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
              <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    variant="ghost"
                    className={cn(
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'transition-all duration-200 hover:shadow-md group',
                      'w-10 h-10 md:w-12 md:h-12'
                    )}
                    onClick={onCreateBoardClick}
                  >
                    <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content 
                    side="bottom" 
                    sideOffset={10} 
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                    )}>
                      Create Board
                    <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </div>
          </div>
        </div>
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={queryValue}
            onChange={onQueryChange}
            placeholder="Search boards..."
            className={cn(
              'w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all',
              'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              'placeholder:text-gray-400',
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            )}
          />
        </div>

        {/* Stats Cards */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-2">
            <BarChart3 size={14} />
            Overview
          </h3>

          {/* Total Boards */}
          <div className={cn(
            'rounded-xl p-4 border transition-all hover:scale-[1.02] cursor-default',
            isDarkMode 
              ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-900/30' 
              : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-blue-600">{boardsLength}</div>
                <div className="text-xs text-blue-500 mt-1">Active Projects</div>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 'bg-blue-500/10')}>
                <Layout className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Total Tasks */}
          <div className={cn(
            'rounded-xl p-4 border transition-all hover:scale-[1.02] cursor-default',
            isDarkMode 
              ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-900/30' 
              : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-purple-600">{totalTasks}</div>
                <div className="text-xs text-purple-500 mt-1">Total Tasks</div>
              </div>
              <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', 'bg-purple-500/10')}>
                <Calendar className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </div>

          {/* Task Breakdown */}
          <div className={cn(
            'rounded-xl p-4 border',
            isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
          )}>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>To Do</span>
                </div>
                <span className="font-semibold">{todoTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>In Progress</span>
                </div>
                <span className="font-semibold">{inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <span className={isDarkMode ? 'text-gray-400' : 'text-gray-600'}>Completed</span>
                </div>
                <span className="font-semibold">{completedTasks}</span>
              </div>
            </div>

            {/* Mini Progress Bar */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}>Progress</span>
                <span className={cn(
                  'font-semibold',
                  completionRate === 100 ? 'text-green-500' : 'text-blue-500'
                )}>
                  {completionRate}%
                </span>
              </div>
              <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-700',
                    completionRate === 100
                      ? 'bg-gradient-to-r from-green-400 to-green-500'
                      : completionRate > 50
                        ? 'bg-gradient-to-r from-blue-400 to-blue-500'
                        : 'bg-gradient-to-r from-amber-400 to-amber-500'
                  )}
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
          </div>

          {/* Last Updated */}
          {lastUpdated && (
            <div className={cn(
              'flex items-center gap-3 px-4 py-3 rounded-xl border',
              isDarkMode ? 'bg-gray-800/50 border-gray-700' : 'bg-white border-gray-200'
            )}>
              <Clock size={16} className="text-gray-400" />
              <div>
                <div className="text-xs text-gray-400">Last Activity</div>
                <div className="text-xs font-medium">
                  {new Date(lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* ================================================ */}
      {/* MOBILE: Bottom Sheet (like FilterSidebar) */}
      {/* ================================================ */}
      <div className="lg:hidden">
        {/* Overlay */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Bottom Sheet */}
        <div className={cn(
          'fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out',
          mobileOpen 
            ? 'translate-y-0' 
            : 'translate-y-[calc(100%-4rem)]'
        )}>
          <div className={cn(
            'rounded-t-2xl border border-b-0 shadow-2xl max-h-[85vh] flex flex-col',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          )}>
            {/* Handle Bar / Toggle Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'w-full flex-shrink-0 flex flex-col items-center justify-center gap-2 px-4 py-3',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-t-2xl',
                mobileOpen && 'border-b border-gray-200 dark:border-gray-800'
              )}
            >
              {/* Handle pill */}
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              
              {/* Title row */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <Layout size={16} className="text-blue-500" />
                  <span className="text-sm font-semibold">
                    {boardsLength} {boardsLength === 1 ? 'Board' : 'Boards'}
                  </span>
                  {completionRate > 0 && (
                    <span className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full font-medium',
                      completionRate === 100 
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                    )}>
                      {completionRate}%
                    </span>
                  )}
                </div>
                
                <GripHorizontal size={16} className="text-gray-400" />
              </div>
            </button>

            {/* Scrollable Content */}
            <div className={cn(
              'overflow-y-auto flex-1',
              mobileOpen ? 'opacity-100' : 'opacity-0'
            )}>
              {sidebarContent}
            </div>
          </div>
        </div>
      </div>

      {/* ================================================ */}
      {/* DESKTOP: Static Sidebar */}
      {/* ================================================ */}
      <aside
        className={cn(
          'hidden lg:block w-80 lg:w-96 flex-shrink-0 border-r overflow-y-auto',
          isDarkMode
            ? 'bg-gray-900/50 border-gray-800'
            : 'bg-gray-50/80 border-gray-200',
          'backdrop-blur-sm'
        )}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default BoardListStaticSidebar;