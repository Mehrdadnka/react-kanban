import React, { useEffect, useState, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Board, useBoardStore } from '@/stores/board.store';
import { BoardCard } from './BoardCard';

interface BoardCarouselProps {
  boards: Board[];
  onBoardClick: (board: Board) => void;
}

export const BoardCarousel: React.FC<BoardCarouselProps> = ({ boards, onBoardClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev + 1) % boards.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [boards.length, isTransitioning]);

  const prevSlide = useCallback(() => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentIndex((prev) => (prev - 1 + boards.length) % boards.length);
    setTimeout(() => setIsTransitioning(false), 500);
  }, [boards.length, isTransitioning]);

  // Auto-play
  useEffect(() => {
    if (isPaused || boards.length === 0) return;
    
    const interval = setInterval(nextSlide, 3000);
    return () => clearInterval(interval);
  }, [isPaused, nextSlide, boards.length]);

  if (boards.length === 0) return null;

  return (
    <div 
      className="relative group min-h-[250px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Carousel Container */}
      <div className="overflow-hidden rounded-2xl">
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {boards.slice(0, 5).map((board) => (
            <div key={board.id} className="w-full flex-shrink-0 px-1">
              <BoardCard
                board={board}
                onClick={onBoardClick}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex items-center justify-between mt-4 px-2">
        {/* Dots */}
        <div className="flex items-center gap-2">
          {boards.slice(0, 5).map((_, index) => (
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
      </div>
    </div>
  );
};