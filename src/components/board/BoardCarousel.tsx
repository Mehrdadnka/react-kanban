// components/board/BoardCarousel.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { Settings, CheckCircle2, Circle, GripVertical, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Board } from '@/stores/board.store';
import { BoardCard } from './BoardCard';
import { useApp } from '@/providers/AppProvider';
import * as Popover from '@radix-ui/react-popover';
import { CarouselProvider, CarouselSlides, CarouselDots, CarouselControls } from '@/components/ui/carousel';


interface BoardCarouselProps {
  boards: Board[];
  onBoardClick: (board: Board) => void;
}

const STORAGE_KEY = 'board-carousel-selection';
const MAX_BOARDS = 10;

export const BoardCarousel: React.FC<BoardCarouselProps> = ({ boards, onBoardClick }) => {
  const { isDarkMode } = useApp();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        return ids.filter((id: string) => boards.some(b => b.id === id));
      }
    } catch {}
    return boards.slice(0, Math.min(5, boards.length)).map(b => b.id);
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const carouselBoards = boards.filter(b => selectedIds.includes(b.id));

  const toggleBoardSelection = useCallback((boardId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(boardId)) {
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== boardId);
      }
      if (prev.length >= MAX_BOARDS) return prev;
      return [...prev, boardId];
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(boards.slice(0, MAX_BOARDS).map(b => b.id));
  }, [boards]);

  const deselectAll = useCallback(() => {
    if (boards.length > 0) {
      setSelectedIds([boards[0].id]);
    }
  }, [boards]);

  if (boards.length === 0) return null;

  return (
    <div className="relative group">
      {/* Top Bar */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {carouselBoards.length} of {boards.length} boards
        </span>
        
        <Popover.Root open={isSelectorOpen} onOpenChange={setIsSelectorOpen}>
          <Popover.Trigger asChild>
            <button
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium',
                'transition-all duration-200',
                'hover:bg-gray-100 dark:hover:bg-gray-800',
                'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300',
                isSelectorOpen && 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              )}
            >
              <Settings size={13} />
              <span>Configure</span>
            </button>
          </Popover.Trigger>

          <Popover.Portal>
            <Popover.Content
              align="end"
              sideOffset={8}
              className={cn(
                'w-72 rounded-xl border shadow-2xl z-50 p-4',
                isDarkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
              )}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">
                  Carousel Boards
                </h4>
                <Popover.Close asChild>
                  <button
                    className={cn(
                      'p-1 rounded-lg transition-colors',
                      'hover:bg-gray-100 dark:hover:bg-gray-800',
                      'text-gray-400'
                    )}
                  >
                    <X size={14} />
                  </button>
                </Popover.Close>
              </div>

              {/* Info */}
              <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3">
                Select up to {MAX_BOARDS} boards to display in the carousel.
                Selected: <span className="font-semibold">{selectedIds.length}/{MAX_BOARDS}</span>
              </p>

              {/* Quick Actions */}
              <div className="flex items-center gap-2 mb-3">
                <button
                  onClick={selectAll}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-md font-medium transition-colors',
                    'bg-blue-50 text-blue-600 hover:bg-blue-100',
                    'dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50'
                  )}
                >
                  Select All
                </button>
                <button
                  onClick={deselectAll}
                  className={cn(
                    'text-[10px] px-2 py-1 rounded-md font-medium transition-colors',
                    'bg-gray-100 text-gray-600 hover:bg-gray-200',
                    'dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                  )}
                >
                  Deselect All
                </button>
              </div>

              {/* Board List */}
              <div className="space-y-0.5 max-h-64 overflow-y-auto">
                {boards.map((board) => {
                  const isSelected = selectedIds.includes(board.id);
                  const isDisabled = !isSelected && selectedIds.length >= MAX_BOARDS;
                  
                  return (
                    <button
                      key={board.id}
                      onClick={() => !isDisabled && toggleBoardSelection(board.id)}
                      disabled={isDisabled}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-2 py-2 rounded-lg text-left transition-all',
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        isDisabled && 'opacity-40 cursor-not-allowed',
                        isSelected && 'bg-blue-50/50 dark:bg-blue-900/20'
                      )}
                    >
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
                      ) : (
                        <Circle size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: board.color }}
                      />
                      
                      <span className={cn(
                        'text-sm truncate flex-1',
                        isSelected 
                          ? 'font-medium text-gray-900 dark:text-gray-100' 
                          : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {board.title}
                      </span>

                      {isSelected && (
                        <GripVertical size={12} className="text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-3 text-center">
                Changes are saved automatically
              </p>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Carousel with Fixed Structure */}
      <CarouselProvider
        totalSlides={carouselBoards.length}
        autoPlayInterval={carouselBoards.length > 1 ? 3000 : 0}
        transitionDuration={500}
      >
        <CarouselSlides className="rounded-2xl">
          {carouselBoards.map((board) => (
            <div key={board.id} className="px-1">
              <BoardCard board={board} onClick={onBoardClick} />
            </div>
          ))}
        </CarouselSlides>

        {carouselBoards.length > 1 && (
          <div className="flex items-center justify-between mt-4 px-2">
            <CarouselDots />
            <CarouselControls />
          </div>
        )}
      </CarouselProvider>
    </div>
  );
};