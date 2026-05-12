// components/ui/carousel/CarouselControls.tsx
import React, { ReactNode } from 'react';
import { useCarousel } from './CarouselProvider';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

interface CarouselControlsProps {
  className?: string;
  showPause?: boolean;
  /** Custom button renderers */
  renderPrev?: (props: { onClick: () => void }) => ReactNode;
  renderNext?: (props: { onClick: () => void }) => ReactNode;
  renderPause?: (props: { isPaused: boolean; onClick: () => void }) => ReactNode;
  /** Hide when only 1 slide @default true */
  hideOnSingle?: boolean;
}

export const CarouselControls: React.FC<CarouselControlsProps> = ({
  className,
  showPause = true,
  renderPrev,
  renderNext,
  renderPause,
  hideOnSingle = true,
}) => {
  const { prevSlide, nextSlide, isPaused, togglePause, totalSlides } = useCarousel();

  if (hideOnSingle && totalSlides <= 1) return null;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {/* Prev */}
      {renderPrev ? (
        renderPrev({ onClick: prevSlide })
      ) : (
        <button
          onClick={prevSlide}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Previous slide"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Pause/Play */}
      {showPause && (
        renderPause ? (
          renderPause({ isPaused, onClick: togglePause })
        ) : (
          <button
            onClick={togglePause}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label={isPaused ? 'Play' : 'Pause'}
          >
            {isPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
        )
      )}

      {/* Next */}
      {renderNext ? (
        renderNext({ onClick: nextSlide })
      ) : (
        <button
          onClick={nextSlide}
          className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Next slide"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};