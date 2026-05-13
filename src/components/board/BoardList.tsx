// components/board/BoardList.tsx - GAMIFIED VERSION WITH FIXED LAYOUT
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Search, Sparkles, TrendingUp, Calendar, CheckCircle2, Layout,
  Zap, Trophy, Flame, Target, Star, Crown, Swords, Shield,
  ChevronRight, Gift, Award, Clock3, BarChart3, ChevronDown,
  X, ArrowUpRight, Timer, Activity
} from 'lucide-react';
import * as Popover from '@radix-ui/react-popover';
import { Board, useBoardEventListeners, useBoardStore } from '@/stores/board.store';
import { BoardCard } from './BoardCard';
import { BoardCarousel } from './BoardCarousel';
import { BoardTable } from './BoardTable';
import { useApp } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import { useBoardSidebarStore } from '@/stores/sidebar-engine/board-sidebar.store';
import { useXPStore } from '@/stores/xp/xp.store';
import { XPProgressRing } from '@/components/xp/XPProgressRing';
import { Tab, TabItem } from '@/components/ui/tab/Tab';
import BoardListStaticSidebar from './BoardListStaticSidebar';
import { useColumnStore } from '@/stores/column.store';

// ──── Level Detail Popover ────
export interface LevelDetailPopoverProps {
  isDarkMode: boolean;
  currentLevel: number;
  levelProgress: number;
  totalXP: number;
  xpToNextLevel: number;
  streak: { current: number; longest: number };
  achievements: any[];
  events: any[];
}

export const LevelDetailPopover: React.FC<LevelDetailPopoverProps> = ({
  isDarkMode,
  currentLevel,
  levelProgress,
  totalXP,
  xpToNextLevel,
  streak,
  achievements,
  events,
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const unlockedCount = achievements.filter(a => a.completed).length;
  const recentEvents = events.slice(-8).reverse();

  const tabItems: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Activity size={14} />,
      content: (
        <div className="space-y-4">
          {/* Level Progress Detail */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">Level Progress</span>
              <span className="text-xs font-bold">{levelProgress}%</span>
            </div>
            <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${levelProgress}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-[10px] text-gray-400">Level {currentLevel}</span>
              <span className="text-[10px] text-gray-400">
                {formatXP(totalXP)} / {formatXP(totalXP + (xpToNextLevel * (100 - levelProgress) / 100))} XP
              </span>
              <span className="text-[10px] text-gray-400">Level {currentLevel + 1}</span>
            </div>
          </div>

          {/* XP Breakdown */}
          <div className="grid grid-cols-2 gap-2">
            <div className={cn(
              'rounded-lg p-3',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            )}>
              <div className="text-lg font-bold text-blue-500">{formatXP(totalXP)}</div>
              <div className="text-[10px] text-gray-400">Total XP</div>
            </div>
            <div className={cn(
              'rounded-lg p-3',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            )}>
              <div className="text-lg font-bold text-orange-500">{streak.current}</div>
              <div className="text-[10px] text-gray-400">Day Streak</div>
            </div>
            <div className={cn(
              'rounded-lg p-3',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            )}>
              <div className="text-lg font-bold text-yellow-500">{unlockedCount}/{achievements.length}</div>
              <div className="text-[10px] text-gray-400">Achievements</div>
            </div>
            <div className={cn(
              'rounded-lg p-3',
              isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'
            )}>
              <div className="text-lg font-bold text-purple-500">{streak.longest}</div>
              <div className="text-[10px] text-gray-400">Best Streak</div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h4 className="text-xs font-semibold mb-2 flex items-center gap-1.5">
              <Timer size={12} className="text-gray-400" />
              Recent Activity
            </h4>
            <div className="space-y-1.5 max-h-[180px] overflow-y-auto scrollbar-thin">
              {recentEvents.map((event, i) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, x: -5 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="flex items-center justify-between text-xs py-1"
                >
                  <div className="flex items-center gap-1.5">
                    <span>{getActionEmoji(event.action)}</span>
                    <span className="text-gray-500">{formatActionName(event.action)}</span>
                  </div>
                  <span className="text-[10px] font-bold text-yellow-600 dark:text-yellow-400">
                    +{event.finalAmount}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Trophy size={14} />,
      content: (
        <div className="space-y-3 max-h-[300px] overflow-y-auto scrollbar-thin pr-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {unlockedCount}/{achievements.length} unlocked
            </span>
          </div>
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={cn(
                'flex items-center gap-3 p-2 rounded-lg transition-all',
                ach.completed
                  ? isDarkMode
                    ? 'bg-yellow-500/10 border border-yellow-500/20'
                    : 'bg-yellow-50 border border-yellow-200'
                  : isDarkMode
                    ? 'bg-gray-800/30 border border-gray-700/50 opacity-60'
                    : 'bg-gray-50 border border-gray-200 opacity-60'
              )}
            >
              <span className={cn(
                'text-2xl flex-shrink-0',
                !ach.completed && 'grayscale'
              )}>
                {ach.icon}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    'text-xs font-medium truncate',
                    ach.completed ? 'text-gray-900 dark:text-gray-100' : 'text-gray-400'
                  )}>
                    {ach.completed ? ach.name : '???'}
                  </span>
                  {ach.completed && (
                    <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                  )}
                </div>
                {!ach.completed && (
                  <div className="mt-1.5">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-0.5">
                      <span>{ach.currentCount}/{ach.requiredCount}</span>
                      <span>{Math.round((ach.currentCount / ach.requiredCount) * 100)}%</span>
                    </div>
                    <div className="h-1 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-blue-500 transition-all"
                        style={{ width: `${(ach.currentCount / ach.requiredCount) * 100}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ),
    },
    {
      id: 'stats',
      label: 'Stats',
      icon: <BarChart3 size={14} />,
      content: (
        <div className="space-y-4">
          {/* Level Timeline if available */}
          <div>
            <h4 className="text-xs font-semibold mb-2">Level Titles</h4>
            <div className="space-y-1.5">
              {[
                { max: 5, title: '🌱 Beginner' },
                { max: 10, title: '📚 Learner' },
                { max: 20, title: '⚡ Practitioner' },
                { max: 35, title: '🎯 Expert' },
                { max: 50, title: '🏆 Master' },
                { max: 75, title: '👑 Grandmaster' },
                { max: 100, title: '🌟 Legend' },
                { max: Infinity, title: '🔮 Transcendent' },
              ].map((tier) => {
                const isUnlocked = currentLevel >= tier.max;
                const isCurrent = currentLevel <= tier.max && 
                  (tier.max === Infinity || currentLevel > (tier.max > 5 ? tier.max - 5 : 0));
                
                return (
                  <div
                    key={tier.max}
                    className={cn(
                      'flex items-center gap-2 text-xs py-1 px-2 rounded',
                      isCurrent && (isDarkMode ? 'bg-blue-500/10' : 'bg-blue-50'),
                      isUnlocked ? 'opacity-100' : 'opacity-40'
                    )}
                  >
                    <span>{tier.title}</span>
                    {isCurrent && <ArrowUpRight size={10} className="text-blue-500" />}
                    <span className="text-[10px] text-gray-400 ml-auto">
                      Lv.{tier.max === Infinity ? '100+' : tier.max}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Popover.Content
      align="start"
      sideOffset={12}
      className={cn(
        'w-80 rounded-2xl border shadow-2xl z-50 p-5',
        isDarkMode
          ? 'bg-gray-900 border-gray-700'
          : 'bg-white border-gray-200'
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <motion.span 
          className="text-3xl"
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          {getLevelEmoji(currentLevel)}
        </motion.span>
        <div>
          <h3 className="font-bold text-base">
            {getLevelTitle(currentLevel)}
          </h3>
          <p className="text-xs text-gray-500">
            Level {currentLevel} • {formatXP(totalXP)} XP
          </p>
        </div>
        <Popover.Close asChild>
          <button className={cn(
            'ml-auto p-1 rounded-lg transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'text-gray-400'
          )}>
            <X size={14} />
          </button>
        </Popover.Close>
      </div>

      {/* Tabs */}
      <Tab
        items={tabItems}
        defaultValue="overview"
        value={activeTab}
        onValueChange={setActiveTab}
        isDarkMode={isDarkMode}
        size="sm"
        variant="underline"
      />
    </Popover.Content>
  );
};

// ──── Main BoardList Component ────
export const BoardList: React.FC = () => {
  const { isDarkMode } = useApp();
  const { boards, setActiveBoard, deleteBoard } = useBoardStore();
  const openCreateBoard = useBoardSidebarStore((state) => state.openCreateBoard);
  const openEditBoard = useBoardSidebarStore((state) => state.openEditBoard);
  
  const { 
    totalXP, currentLevel, levelProgress, xpToNextLevel,
    streak, achievements, events 
  } = useXPStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [showAchievementsDropdown, setShowAchievementsDropdown] = useState(false);
  const [levelPopoverOpen, setLevelPopoverOpen] = useState(false);

  const filteredBoards = boards.filter(
    (board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = useMemo(() => {
    let total = 0, done = 0, todo = 0, doing = 0;
    let lastUpdated: Date | null = null;

    boards.forEach((board) => {
      const s = useBoardStore.getState().getBoardStats(board.id);
      total += s.total;
      done += s.done;
      todo += s.todo;
      doing += s.doing;
      if (!lastUpdated || board.updatedAt > lastUpdated) lastUpdated = board.updatedAt;
    });

    return { total, done, todo, doing, lastUpdated };
  }, [boards]);

  const completionRate = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const unlockedAchievements = achievements.filter(a => a.completed);
  const recentEvents = events.slice(-5).reverse();

  const handleViewBoard = (board: Board) => setActiveBoard(board.id);
  const handleEditBoard = (board: Board) => openEditBoard(board.id);
  const handleDeleteBoard = (board: Board) => {
    if (confirm(`Are you sure you want to delete "${board.title}"?`)) {
      deleteBoard(board.id);
    }
  };

  useEffect(() => {
    const boards = useBoardStore.getState().boards;
    const columnStore = useColumnStore.getState();
    
    boards.forEach(board => {
      columnStore.ensureDefaultColumns(board.id);
    });
  }, []);

  const taskBreakdown = useMemo(() => {
    if (boards.length === 0) return [];
    
    const columnMap = new Map<string, { id: string; title: string; color: string; count: number }>();
    
    boards.forEach(board => {
      const stats = useBoardStore.getState().getBoardStats(board.id);
      stats.columns.forEach(col => {
        const existing = columnMap.get(col.id);
        if (existing) {
          existing.count += col.count;
        } else {
          columnMap.set(col.id, { 
            id: col.id,        // ← اینو اضافه کن
            title: col.title, 
            color: col.color, 
            count: col.count 
          });
        }
      });
    });
    
    return Array.from(columnMap.values()).filter(c => c.count > 0);
  }, [boards]);
  useBoardEventListeners();
  


  return (
    <div className="h-full flex overflow-hidden">

      <BoardListStaticSidebar
        boardsLength={boards.length}
        queryValue={searchQuery}
        totalTasks={stats.total}
        todoTasks={stats.todo}
        inProgressTasks={stats.doing}
        completedTasks={stats.done}
        completionRate={completionRate}
        onQueryChange={(e) => setSearchQuery(e.target.value)}
        onCreateBoardClick={openCreateBoard}
        lastUpdated={stats.lastUpdated}
        // ──── جدید: XP Props ────
        totalXP={totalXP}
        currentLevel={currentLevel}
        levelProgress={levelProgress}
        streak={streak}
        taskBreakdown={taskBreakdown}
        achievementCount={{
          unlocked: achievements.filter(a => a.completed).length,
          total: achievements.length
        }}
        recentXPEvents={events.slice(-8).reverse().map(e => ({
          action: e.action,
          amount: e.finalAmount,
          id: e.id,
        }))}
      />

      {/* ========== MAIN CONTENT - Fixed height grid ========== */}
      <main className="flex-1 overflow-hidden flex flex-col h-full">
        <div className="p-4 md:p-6 lg:p-8 flex flex-col h-full gap-4 overflow-hidden">
          {/* ===== BOARDS SECTION (Scrollable) ===== */}
          <div className="flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin">
            {/* Featured Boards Carousel */}
            {boards.length > 0 && (
              <section className="flex-shrink-0">
                <div className="grid h-fit mb-2  grid-cols-1 lg:grid-cols-2 gap-4">
                  <BoardCarousel
                    boards={filteredBoards}
                    onBoardClick={handleViewBoard}
                  />
                  
                  {/* Create New Board Card */}
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={() => openCreateBoard()}
                    className={cn(
                      'group relative rounded-2xl border-2 mt-10 mb-6 border-dashed transition-all duration-300 min-h-[200px]',
                      'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                      'flex flex-col items-center justify-center gap-2 p-8',
                      isDarkMode ? 'border-gray-700' : 'border-gray-300'
                    )}
                  >
                    <motion.div
                      animate={{ rotate: [0, 90, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      className={cn(
                        'w-12 h-12 rounded-2xl flex items-center justify-center',
                        'bg-gradient-to-br from-blue-500/10 to-purple-500/10'
                      )}
                    >
                      <Plus size={20} className="text-blue-500" />
                    </motion.div>
                    <span className="text-sm font-medium text-gray-500 group-hover:text-blue-500 transition-colors">
                      Create New Board
                    </span>
                    <span className="text-[10px] text-yellow-600 dark:text-yellow-400 font-medium">
                      +30 XP Bonus
                    </span>
                  </motion.button>
                </div>
              </section>
            )}

            {/* All Boards Table */}
            <section>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Layout size={16} className="text-purple-500" />
                  <h2 className="text-sm font-semibold">All Boards</h2>
                  <span className={cn(
                    'text-[10px] px-1.5 py-0.5 rounded-full',
                    isDarkMode ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-500'
                  )}>
                    {boards.length}
                  </span>
                </div>
              </div>

              {boards.length > 0 ? (
                <BoardTable
                  boards={filteredBoards}
                  onViewBoard={handleViewBoard}
                  onEditBoard={handleEditBoard}
                  progressPercent={completionRate}
                  onDeleteBoard={handleDeleteBoard}
                />
              ) : (
                /* Empty State - Gamified */
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center py-16"
                >
                  <div className="text-center max-w-md">
                    {searchQuery ? (
                      <>
                        <Search className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <h3 className="text-base font-semibold text-gray-500 mb-1">No boards found</h3>
                        <p className="text-xs text-gray-400">
                          Try different keywords or clear the search.
                        </p>
                      </>
                    ) : (
                      <>
                        <motion.div
                          animate={{ y: [0, -8, 0], rotate: [0, 5, -5, 0] }}
                          transition={{ duration: 3, repeat: Infinity }}
                          className="mb-4"
                        >
                          <Sparkles className="w-12 h-12 mx-auto text-yellow-400" />
                        </motion.div>
                        
                        <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300 mb-1">
                          Begin Your Journey
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Create your first board and earn
                        </p>
                        
                        <div className="flex items-center justify-center gap-1.5 mb-4">
                          <Zap size={16} className="text-yellow-500" />
                          <span className="text-xl font-bold bg-gradient-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
                            +30 XP
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-3 mb-6 text-[10px] text-gray-400">
                          <div className="flex items-center gap-1">
                            <Trophy size={10} className="text-yellow-500" />
                            <span>Achievements</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Flame size={10} className="text-orange-500" />
                            <span>Streaks</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Crown size={10} className="text-purple-500" />
                            <span>Level Up</span>
                          </div>
                        </div>
                        
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => openCreateBoard()}
                          className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl 
                                   hover:shadow-lg hover:shadow-purple-500/25 transition-all text-sm font-medium"
                        >
                          <span className="flex items-center gap-1.5">
                            <Plus size={16} />
                            Create Your First Board
                          </span>
                        </motion.button>
                      </>
                    )}
                  </div>
                </motion.div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

// ──── Helper Functions ────

export function getLevelEmoji(level: number): string {
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

export function formatXP(xp: number): string {
  if (xp >= 1000000) return `${(xp / 1000000).toFixed(1)}M`;
  if (xp >= 1000) return `${(xp / 1000).toFixed(1)}K`;
  return xp.toString();
}

export function getActionEmoji(action: string): string {
  const emojis: Record<string, string> = {
    'task:created': '📝',
    'task:completed': '✅',
    'task:completed_early': '⏰',
    'task:completed_on_time': '🎯',
    'task:completed_overdue': '😅',
    'task:moved_to_progress': '🚀',
    'task:priority_urgent_completed': '🔥',
    'task:priority_high_completed': '⚡',
    'subtask:completed': '✔️',
    'board:created': '📋',
    'board:streak_daily': '🔥',
    'board:streak_weekly': '💪',
    'milestone:reached': '🏆',
  };
  return emojis[action] || '✨';
}

export function formatActionName(action: string): string {
  return action
    .split(':')
    .pop()
    ?.replace(/_/g, ' ')
    .replace(/\b\w/g, c => c.toUpperCase()) || action;
}