// components/board/BoardList.tsx
import React, { useMemo, useState } from 'react';
import { Plus, Search, Sparkles, TrendingUp, Calendar, CheckCircle2, Layout } from 'lucide-react';
import { Board, useBoardStore } from '@/stores/board.store';
import { BoardCard } from './BoardCard';
import { BoardCarousel } from './BoardCarousel';
import { BoardTable } from './BoardTable';
import { useApp } from '@/providers/AppProvider';
import { cn } from '@/lib/utils';
import { useBoardSidebarStore } from '@/stores/sidebar-engine/board-sidebar.store';
import BoardListStaticSidebar from './BoardListStaticSidebar';

export const BoardList: React.FC = () => {
  const { isDarkMode } = useApp();
  const { boards, setActiveBoard, deleteBoard } = useBoardStore();
  const openCreateBoard = useBoardSidebarStore((state) => state.openCreateBoard);
  const openEditBoard = useBoardSidebarStore((state) => state.openEditBoard);

  const [searchQuery, setSearchQuery] = useState('');

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

  const handleViewBoard = (board: Board) => {
    setActiveBoard(board.id);
  };

  const handleEditBoard = (board: Board) => {
    openEditBoard(board.id);
  };

  const handleDeleteBoard = (board: Board) => {
    if (confirm(`Are you sure you want to delete "${board.title}"?`)) {
      deleteBoard(board.id);
    }
  };

  return (
    <div className="h-full flex overflow-hidden">
      {/* ========== SIDEBAR ========== */}
      <BoardListStaticSidebar
        boardsLength={boards.length}
        queryValue={searchQuery}
        totalTasks={stats.total}
        todoTasks={stats.todo}
        inProgressTasks={stats.doing}
        completedTasks={stats.done}
        completionRate={stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0}
        onQueryChange={(e) => setSearchQuery(e.target.value)}
        onCreateBoardClick={openCreateBoard}
        lastUpdated={stats.lastUpdated}
      />

      {/* ========== MAIN CONTENT ========== */}
      <main className="flex-1 overflow-auto">
        <div className="p-6 flex flex-col justify-between space-y-8">
          {/* Section 1: Carousel (when boards exist) */}
          {boards.length > 0 && (
            <section className='mb-6'>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp size={20} className="text-blue-500" />
                  <h2 className="text-lg font-semibold">Featured Boards</h2>
                </div>
              </div>

              <div className='grid grid-cols-2 gap-4 h-fit'>
                <BoardCarousel
                  boards={filteredBoards}
                  onBoardClick={handleViewBoard}
                />
              {/* Create New Board Card */}
              <button
                onClick={() => openCreateBoard()}
                className={cn(
                  'group relative rounded-2xl border-2 border-dashed transition-all duration-300',
                  'hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20',
                  'min-h-[200px] mt-10 flex flex-col items-center justify-center gap-3',
                  isDarkMode ? 'border-gray-800' : 'border-gray-300'
                )}
              >
                <div className={cn(
                  'w-14 group h-14 rounded-2xl flex items-center justify-center transition-all',
                  'bg-gray-100 dark:bg-gray-800 group-hover:scale-110 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30'
                )}>
                  <Plus size={20} className="sm:size-24 group-hover:rotate-90 transition-transform duration-300" />
                  
                  {/* <Plus className="w-16 h-16 text-gray-400 group-hover:text-blue-500 transition-colors" /> */}
                </div>
                <span className="text-sm font-medium text-gray-500 group-hover:text-blue-500 transition-colors">
                  Create New Board
                </span>
              </button>
              </div>
            </section>
          )}

          {/* Section 2: Table View */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Layout size={20} className="text-purple-500" />
                <h2 className="text-lg font-semibold">All Boards</h2>
              </div>
            </div>

            {boards.length > 0 ? (
              <BoardTable
                boards={filteredBoards}
                onViewBoard={handleViewBoard}
                onEditBoard={handleEditBoard}
                onDeleteBoard={handleDeleteBoard}
              />
            ) : (
              /* Empty State */
              <div className="flex items-center justify-center min-h-[40vh]">
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
          </section>
        </div>
      </main>
    </div>
  );
};