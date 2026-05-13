import { useState } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { 
  BarChart3, Clock,  Plus, Search, Sparkles
} from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { motion} from 'framer-motion';

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
  // ──── Optional XP Props for gamification ────
  totalXP?: number;
  currentLevel?: number;
  levelProgress?: number;
  streak?: { current: number; longest: number };
  achievementCount?: { unlocked: number; total: number };
  recentXPEvents?: Array<{ action: string; amount: number; id: string }>;
  taskBreakdown: Array<{ id: string; title: string; color: string; count: number }>;
}

const BoardListStaticSidebar: React.FC<BoardListStaticSidebarProps> = ({
  boardsLength = 0,
  queryValue,
  taskBreakdown,
  totalTasks,
  todoTasks,
  inProgressTasks,
  completedTasks,
  completionRate,
  lastUpdated,
  onCreateBoardClick,
  onQueryChange,
  // Gamification props with defaults
  totalXP = 0,
  currentLevel = 1,
  levelProgress = 0,
  streak = { current: 0, longest: 0 },
  achievementCount = { unlocked: 0, total: 0 },
  recentXPEvents = [],
}) => {
  const { isDarkMode } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showXPDetails, setShowXPDetails] = useState(false);

  const levelEmoji = getLevelEmoji(currentLevel);
  const levelTitle = getLevelTitle(currentLevel);

  // ──── Shared Content ────
  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* ──── FIXED TOP SECTION (No Scroll) ──── */}
      <div className="flex-shrink-0 p-4 md:p-5 space-y-4 border-b border-gray-200 dark:border-gray-700">
        
        {/* Brand / Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className={cn(
              'text-xl md:text-2xl font-bold',
              'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
              'bg-clip-text text-transparent'
            )}>
              TaskFlow
            </h1>
            <p className="text-[10px] text-gray-400 mt-0.5">Your Gamified Workspace</p>
          </div>
          
          {/* Create Board Button - Compact */}
          <Tooltip.Root delayDuration={300}>
            <Tooltip.Trigger asChild>
              <button
                onClick={onCreateBoardClick}
                className={cn(
                  'w-9 h-9 rounded-xl flex items-center justify-center transition-all',
                  'bg-gradient-to-br from-blue-500 to-purple-600 text-white',
                  'hover:shadow-lg hover:shadow-purple-500/25 hover:scale-105',
                  'active:scale-95'
                )}
              >
                <Plus size={18} />
              </button>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content 
                side="bottom" 
                sideOffset={8}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                  isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                )}
              >
                Create Board (+30 XP)
                <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </div>

        {/* Search - Compact */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
          <input
            type="text"
            value={queryValue}
            onChange={onQueryChange}
            placeholder="Search boards..."
            className={cn(
              'w-full pl-9 pr-3 py-2 rounded-lg border text-xs transition-all',
              'focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500',
              'placeholder:text-gray-400',
              isDarkMode
                ? 'bg-gray-800 border-gray-700 text-gray-100'
                : 'bg-white border-gray-300 text-gray-900'
            )}
          />
        </div>
      </div>

      {/* ──── SCROLLABLE MIDDLE SECTION ──── */}
      <div className="flex-1 min-h-0 max-h-[calc(70vh-10px)] overflow-y-auto p-4 md:p-5 space-y-4 scrollbar-thin">

        {/* ──── STATS CARDS (Compact Grid) ──── */}
        <div className="space-y-5">
          <h3 className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <BarChart3 size={12} />
            Overview
          </h3>

          {/* 2x2 Stats Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Boards Count */}
            <div className={cn(
              'rounded-xl p-6 border transition-all cursor-default',
              isDarkMode 
                ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-900/30' 
                : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
            )}>
              <div className="text-lg font-bold text-blue-600">{boardsLength}</div>
              <div className="text-[10px] text-blue-500 mt-0.5">Boards</div>
            </div>
            
            {/* In Progress */}
            <div className={cn(
              'rounded-xl p-6 border transition-all hover:scale-[1.02] cursor-default',
              isDarkMode 
                ? 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-900/30' 
                : 'bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-yellow-200'
            )}>
              <div className="text-lg font-bold text-yellow-600">{inProgressTasks}</div>
              <div className="text-[10px] text-yellow-500 mt-0.5">In Progress</div>
            </div>

            {/* Total Tasks */}
            <div className={cn(
              'rounded-xl p-6 border transition-all hover:scale-[1.02] cursor-default',
              isDarkMode 
                ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-900/30' 
                : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200'
            )}>
              <div className="text-lg font-bold text-purple-600">{totalTasks}</div>
              <div className="text-[10px] text-purple-500 mt-0.5">Total Tasks</div>
            </div>

            {/* Completion Rate */}
            <div className={cn(
              'rounded-xl p-6 border transition-all hover:scale-[1.02] cursor-default',
              isDarkMode 
                ? 'bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-900/30' 
                : 'bg-gradient-to-br from-green-50 to-green-100/50 border-green-200'
            )}>
              <div className="text-lg font-bold text-green-600">{completionRate}%</div>
              <div className="text-[10px] text-green-500 mt-0.5">Completed</div>
            </div>
          </div>
        </div>

        {/* ──── TASK BREAKDOWN ──── */}
        <div className={cn(
          'rounded-xl p-3 border',
          isDarkMode ? 'bg-gray-800/30 border-gray-700' : 'bg-white/80 border-gray-200'
        )}>
          <h4 className="text-[10px] font-semibold text-gray-400 mb-2">Task Breakdown</h4>

          <div className="space-y-2 overflow-y-auto max-h-[88px] px-2">
            {taskBreakdown.map(col => (
              <div key={col.id}>
                <div className="flex items-center justify-between text-[10px] mb-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: col.color }} />
                    <span className="text-gray-500">{col.title}</span>
                  </div>
                  <span className="font-semibold text-gray-700 dark:text-gray-300">{col.count}</span>
                </div>
                <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      backgroundColor: col.color,
                      width: totalTasks > 0 ? `${(col.count / totalTasks) * 100}%` : '0%' 
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Overall Progress Ring */}
          <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="relative w-16 h-16">
              <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                <circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  className="text-gray-200 dark:text-gray-700"
                />
                <motion.circle
                  cx="32" cy="32" r="28"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="4"
                  strokeLinecap="round"
                  className={cn(
                    completionRate === 100 ? 'text-green-500' : 
                    completionRate > 50 ? 'text-blue-500' : 'text-amber-500'
                  )}
                  strokeDasharray={`${2 * Math.PI * 28}`}
                  initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                  animate={{ 
                    strokeDashoffset: 2 * Math.PI * 28 * (1 - completionRate / 100) 
                  }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className={cn(
                  'text-xs font-bold',
                  completionRate === 100 ? 'text-green-500' : 
                  completionRate > 50 ? 'text-blue-500' : 'text-amber-500'
                )}>
                  {completionRate}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ──── FIXED BOTTOM SECTION ──── */}
      <div className="flex-shrink-0 p-4 md:p-5 border-t border-gray-200 dark:border-gray-700">
        {/* Last Updated */}
        {lastUpdated ? (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'
          )}>
            <Clock size={12} className="text-gray-400 flex-shrink-0" />
            <div className="min-w-0">
              <div className="text-[9px] text-gray-400">Last Activity</div>
              <div className="text-[10px] font-medium text-gray-600 dark:text-gray-300 truncate">
                {new Date(lastUpdated).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/80'
          )}>
            <Sparkles size={12} className="text-purple-400 flex-shrink-0" />
            <p className="text-[10px] text-gray-400">
              Create a board to get started!
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* ================================================ */}
      {/* MOBILE: Bottom Sheet */}
      {/* ================================================ */}
      <div className="lg:hidden">
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setMobileOpen(false)}
          />
        )}

        <div className={cn(
          'fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out',
          mobileOpen 
            ? 'translate-y-0' 
            : 'translate-y-[calc(100%-3.5rem)]'
        )}>
          <div className={cn(
            'rounded-t-2xl border border-b-0 shadow-2xl max-h-[80vh] flex flex-col',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          )}>
            {/* Handle Bar */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                'w-full flex-shrink-0 flex flex-col items-center gap-1.5 px-4 py-2.5',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors rounded-t-2xl',
                mobileOpen && 'border-b border-gray-200 dark:border-gray-800'
              )}
            >
              <div className="w-8 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-500">
                  {boardsLength} {boardsLength === 1 ? 'Board' : 'Boards'}
                </span>
                <span className="text-[10px] text-gray-400">•</span>
                <span className="text-[10px] text-gray-400">
                  Lv.{currentLevel}
                </span>
              </div>
            </button>

            <div className="overflow-y-auto flex-1">
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
          'hidden lg:flex lg:flex-col w-72 xl:w-80 flex-shrink-0 border-r h-full',
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

// ──── Helper Functions ────

function getLevelEmoji(level: number): string {
  if (level >= 100) return '🔮';
  if (level >= 75) return '👑';
  if (level >= 50) return '🏆';
  if (level >= 35) return '🎯';
  if (level >= 20) return '⚡';
  if (level >= 10) return '📚';
  return '🌱';
}

function getLevelTitle(level: number): string {
  if (level >= 100) return 'Transcendent';
  if (level >= 75) return 'Grandmaster';
  if (level >= 50) return 'Master';
  if (level >= 35) return 'Expert';
  if (level >= 20) return 'Practitioner';
  if (level >= 10) return 'Learner';
  return 'Beginner';
}

function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

function formatAction(action: string): string {
  return action
    .split(':')
    .pop()
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) || action;
}

export default BoardListStaticSidebar;