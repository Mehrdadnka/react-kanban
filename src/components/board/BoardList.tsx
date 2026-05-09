// components/board/BoardList.tsx
import React, { useState } from 'react';
import { Plus, Search, Sparkles, TrendingUp, Calendar, CheckCircle2, Layout, BarChart3, Clock, Activity } from 'lucide-react';
import { useBoardStore } from '@/stores/board.store';
import { BoardCard } from './BoardCard';
import { useApp } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import { useBoardSidebarStore } from '@/stores/sidebar-engine/board-sidebar.store';
import BoardListStaticSidebar from './BoardListStaticSidebar';

export const BoardList: React.FC = () => {
  const { isDarkMode } = useApp();
  const { boards, setActiveBoard } = useBoardStore();
  const openCreateBoard = useBoardSidebarStore((state) => state.openCreateBoard);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredBoards = boards.filter(
    (board) =>
      board.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      board.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Calculate global stats
  let totalTasks = 0;
  let completedTasks = 0;
  let todoTasks = 0;
  let inProgressTasks = 0;
  let lastUpdated: Date | null = null;
  
  boards.forEach(board => {
    const stats = useBoardStore.getState().getBoardStats(board.id);
    totalTasks += stats.total;
    completedTasks += stats.done;
    todoTasks += stats.todo;
    inProgressTasks += stats.doing;
    
    if (!lastUpdated || board.updatedAt > lastUpdated) {
      lastUpdated = board.updatedAt;
    }
  });

  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <>
      <div className="h-full flex overflow-hidden">
        {/* ========== SIDEBAR ========== */}
        <BoardListStaticSidebar
          queryValue={searchQuery} 
          totalTasks={todoTasks} 
          todoTasks={todoTasks} 
          inProgressTasks={inProgressTasks} 
          completedTasks={completedTasks} 
          completionRate={completionRate} 
          onQueryChange={(e) => setSearchQuery(e.target.value)}
          onCreateBoardClick={openCreateBoard}
          lastUpdated={lastUpdated} 
          isDarkMode={isDarkMode} 
        />

        {/* ========== MAIN CONTENT ========== */}
        <main className="flex-1 overflow-y-auto">
          {/* Header */}
          <div className={cn(
            'sticky top-0 z-10 px-6 py-4 border-b backdrop-blur-sm',
            isDarkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
          )}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold">
                  {searchQuery ? `Results for "${searchQuery}"` : 'All Boards'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {filteredBoards.length} {filteredBoards.length === 1 ? 'board' : 'boards'} found
                </p>
              </div>
              
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="text-xs text-blue-500 hover:text-blue-600 transition-colors"
                >
                  Clear search
                </button>
              )}
            </div>
          </div>

          {/* Boards Grid */}
          <div className="p-6">
            {filteredBoards.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredBoards.map((board) => (
                  <BoardCard
                    key={board.id}
                    board={board}
                    onClick={(b) => setActiveBoard(b.id)}
                  />
                ))}
                
                {/* Create New Board Card */}
                <button
                  onClick={() => openCreateBoard()}
                  className={cn(
                    'group relative rounded-2xl border-2 border-dashed transition-all duration-300',
                    'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                    'min-h-[250px] flex flex-col items-center justify-center gap-3',
                    isDarkMode ? 'border-gray-800' : 'border-gray-300'
                  )}
                >
                  <div className={cn(
                    'w-14 h-14 rounded-2xl flex items-center justify-center transition-all',
                    'bg-gray-100 dark:bg-gray-800 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                  )}>
                    <Plus className="w-7 h-7 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <span className="text-sm font-medium text-gray-500 group-hover:text-blue-500 transition-colors">
                    Create New Board
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center">
                  {searchQuery ? (
                    <>
                      <Search className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">No boards found</h3>
                      <p className="text-gray-400 max-w-md mx-auto">
                        No boards match your search criteria. Try different keywords or clear the search.
                      </p>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600" />
                      <h3 className="text-xl font-semibold text-gray-500 mb-2">Welcome to TaskFlow!</h3>
                      <p className="text-gray-400 max-w-md mx-auto mb-8">
                        You haven't created any boards yet. Start by creating your first project board.
                      </p>
                      <button
                        onClick={() => openCreateBoard()}
                        className="px-8 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-xl transition-all text-sm font-medium hover:scale-105 active:scale-95"
                      >
                        <span className="flex items-center gap-2">
                          <Plus size={20} />
                          Create Your First Board
                        </span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </>
  );
};