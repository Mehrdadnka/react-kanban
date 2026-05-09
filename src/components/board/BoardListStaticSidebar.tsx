import { cn } from '@/lib/utils'
import { BarChart3, Calendar, Clock, Layout, Plus, Search, TrendingUp } from 'lucide-react'
import React from 'react'

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
  isDarkMode: boolean;

}

const BoardListStaticSidebar: React.FC<BoardListStaticSidebarProps> = ({
  boardsLength,
  queryValue,
  totalTasks,
  todoTasks,
  inProgressTasks,
  completedTasks,
  completionRate,
  lastUpdated,
  onCreateBoardClick,
  onQueryChange,
  isDarkMode
}) => {
  return (
    <aside 
      className={cn(
        'w-80 lg:w-96 flex-shrink-0 border-r overflow-y-auto',
        isDarkMode ? 'bg-gray-900/50 border-gray-800' : 'bg-gray-50/80 border-gray-200',
        'backdrop-blur-sm'
      )}
    >
      <div className="p-6 space-y-8">
        {/* Brand / Header */}
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-600/10 to-purple-600/10 border border-blue-500/20">
              <Layout size={14} className="text-blue-500" />
                <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                  {/* {boards.length} {boards.length === 1 ? 'Board' : 'Boards'} */}
                  {boardsLength} {boardsLength === 1 ? 'Board' : 'Boards'}
                    
                </span>
                <h1 className={cn(
                    'text-3xl lg:text-4xl font-bold',
                    'bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600',
                    'bg-clip-text text-transparent'
                )}>
                  Your Boards
                </h1>
              </div>
            </div>
    
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={queryValue}
                  onChange={onQueryChange}
                  // value={searchQuery}
                  // onChange={(e) => setSearchQuery(e.target.value)}
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
                    isDarkMode ? 'bg-gradient-to-br from-blue-900/20 to-blue-800/10 border-blue-900/30' : 'bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200'
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold text-blue-600">{boardsLength}</div>
                      <div className="text-xs text-blue-500 mt-1">Active Projects</div>
                      </div>
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        'bg-blue-500/10'
                      )}>
                        <TrendingUp className="w-6 h-6 text-blue-500" />
                      </div>
                    </div>
                  </div>
    
                  {/* Total Tasks */}
                  <div className={cn(
                    'rounded-xl p-4 border transition-all hover:scale-[1.02] cursor-default',
                    isDarkMode ? 'bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-900/30' : 'bg-gradient-to-br from-purple-50 to-purple-100/50 border-purple-200'
                  )}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-3xl font-bold text-purple-600">{totalTasks}</div>
                        <div className="text-xs text-purple-500 mt-1">Total Tasks</div>
                      </div>
                      <div className={cn(
                        'w-12 h-12 rounded-xl flex items-center justify-center',
                        'bg-purple-500/10'
                      )}>
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
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
    
                {/* Quick Actions */}
                <button
                  onClick={onCreateBoardClick}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl',
                    'bg-gradient-to-r from-blue-600 to-purple-600 text-white',
                    'hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]',
                    'transition-all duration-200 font-medium text-sm'
                  )}
                >
                  <Plus size={18} />
                  Create New Board
                </button>
              </div>
            </aside>
  )
}

export default BoardListStaticSidebar