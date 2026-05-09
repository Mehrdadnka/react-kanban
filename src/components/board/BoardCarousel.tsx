// components/board/BoardCarousel.tsx
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  ChevronLeft, ChevronRight, Pause, Play, Settings, 
  CheckCircle2, Circle, GripVertical, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Board } from '@/stores/board.store';
import { BoardCard } from './BoardCard';
import { useApp } from '@/providers/AppProvider';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';

interface BoardCarouselProps {
  boards: Board[];
  onBoardClick: (board: Board) => void;
}

const STORAGE_KEY = 'board-carousel-selection';
const MAX_BOARDS = 10;

export const BoardCarousel: React.FC<BoardCarouselProps> = ({ boards, onBoardClick }) => {
  const { isDarkMode } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // State for selected boards in carousel
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const ids = JSON.parse(stored);
        // Filter to only existing boards
        return ids.filter((id: string) => boards.some(b => b.id === id));
      }
    } catch {}
    // Default: first 5 boards or all if less
    return boards.slice(0, Math.min(5, boards.length)).map(b => b.id);
  });
  
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  // Reset index if it exceeds selected boards
  useEffect(() => {
    if (currentIndex >= selectedIds.length && selectedIds.length > 0) {
      setCurrentIndex(0);
    }
  }, [selectedIds.length, currentIndex]);

  // Filter boards by selection
  const carouselBoards = boards.filter(b => selectedIds.includes(b.id));

  const toggleBoardSelection = useCallback((boardId: string) => {
    setSelectedIds(prev => {
      if (prev.includes(boardId)) {
        // Don't allow deselecting if it's the last one
        if (prev.length <= 1) return prev;
        return prev.filter(id => id !== boardId);
      }
      // Don't allow more than MAX_BOARDS
      if (prev.length >= MAX_BOARDS) return prev;
      return [...prev, boardId];
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelectedIds(boards.slice(0, MAX_BOARDS).map(b => b.id));
  }, [boards]);

  const deselectAll = useCallback(() => {
    // Keep at least one
    if (boards.length > 0) {
      setSelectedIds([boards[0].id]);
    }
  }, [boards]);

  const nextSlide = useCallback(() => {
    if (isTransitioning || carouselBoards.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % carouselBoards.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [carouselBoards.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning || carouselBoards.length <= 1) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + carouselBoards.length) % carouselBoards.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [carouselBoards.length, isTransitioning]);

  // Auto-play
  useEffect(() => {
    if (isPaused || carouselBoards.length <= 1) return;
    
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, carouselBoards.length]);

  if (boards.length === 0) return null;

  return (
    <div 
      className="relative group max-h-[200px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Top Bar with controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
            {carouselBoards.length} of {boards.length} boards
          </span>
        </div>
        
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
                isDarkMode 
                  ? 'bg-gray-900 border-gray-700' 
                  : 'bg-white border-gray-200'
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
              <p className="text-[11px] text-gray-500 mb-3">
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
                      {/* Checkbox */}
                      {isSelected ? (
                        <CheckCircle2 size={16} className="text-blue-500 flex-shrink-0" />
                      ) : (
                        <Circle size={16} className="text-gray-400 flex-shrink-0" />
                      )}
                      
                      {/* Board Color Dot */}
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: board.color }}
                      />
                      
                      {/* Board Name */}
                      <span className={cn(
                        'text-sm truncate flex-1',
                        isSelected 
                          ? 'font-medium text-gray-900 dark:text-gray-100' 
                          : 'text-gray-600 dark:text-gray-400'
                      )}>
                        {board.title}
                      </span>

                      {/* Drag Handle (visual only) */}
                      {isSelected && (
                        <GripVertical size={12} className="text-gray-400 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <p className="text-[10px] text-gray-400 mt-3 text-center">
                Changes are saved automatically
              </p>
            </Popover.Content>
          </Popover.Portal>
        </Popover.Root>
      </div>

      {/* Carousel Container */}
      <div className="overflow-hidden rounded-2xl">
        {carouselBoards.length > 0 ? (
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {carouselBoards.map((board) => (
              <div key={board.id} className="w-full flex-shrink-0 px-1">
                <BoardCard
                  board={board}
                  onClick={onBoardClick}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className={cn(
            'min-h-[250px] flex items-center justify-center rounded-2xl',
            isDarkMode ? 'bg-gray-800/50' : 'bg-gray-100/50'
          )}>
            <p className="text-sm text-gray-400">
              No boards selected for carousel
            </p>
          </div>
        )}
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mt-4 px-2">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {carouselBoards.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                'transition-all duration-300 rounded-full',
                index === currentIndex
                  ? 'w-6 h-2 bg-blue-500'
                  : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
              )}
            />
          ))}
        </div>

        {/* Pause/Play */}
        {carouselBoards.length > 1 && (
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={cn(
              'p-1.5 rounded-lg transition-colors',
              'hover:bg-gray-100 dark:hover:bg-gray-800',
              'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            )}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )}
      </div>
    </div>
  );
};