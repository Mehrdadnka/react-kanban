import React from 'react';
import { useCarousel } from './Carousel';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface CarouselNavigationProps {
  className?: string;
  /** Custom render function for prev button */
  renderPrev?: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
  /** Custom render function for next button */
  renderNext?: (props: { onClick: () => void; disabled: boolean }) => React.ReactNode;
  /** Custom render function for pause/play button */
  renderPausePlay?: (props: { isPaused: boolean; onClick: () => void }) => React.ReactNode;
  /** Show only when multiple slides @default true */
  hideOnSingle?: boolean;
}

export const CarouselNavigation: React.FC<CarouselNavigationProps> = ({
  className,
  renderPrev,
  renderNext,
  renderPausePlay,
  hideOnSingle = true,
}) => {
  const { nextSlide, prevSlide, isPaused, togglePause, totalSlides, isTransitioning } = useCarousel();

  if (hideOnSingle && totalSlides <= 1) return null;

  const isDisabled = isTransitioning || totalSlides <= 1;

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {/* Prev Button */}
      {renderPrev ? (
        renderPrev({ onClick: prevSlide, disabled: isDisabled })
      ) : (
        <button
          onClick={prevSlide}
          disabled={isDisabled}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'text-gray-600 dark:text-gray-400',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
      )}

      {/* Pause/Play Button */}
      {renderPausePlay ? (
        renderPausePlay({ isPaused, onClick: togglePause })
      ) : (
        <button
          onClick={togglePause}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'text-gray-600 dark:text-gray-400'
          )}
          aria-label={isPaused ? 'Play auto-play' : 'Pause auto-play'}
        >
          {isPaused ? <Play size={16} /> : <Pause size={16} />}
        </button>
      )}

      {/* Next Button */}
      {renderNext ? (
        renderNext({ onClick: nextSlide, disabled: isDisabled })
      ) : (
        <button
          onClick={nextSlide}
          disabled={isDisabled}
          className={cn(
            'p-2 rounded-full transition-colors',
            'hover:bg-gray-100 dark:hover:bg-gray-800',
            'text-gray-600 dark:text-gray-400',
            'disabled:opacity-40 disabled:cursor-not-allowed'
          )}
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      )}
    </div>
  );
};