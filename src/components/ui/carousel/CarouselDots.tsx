import React, { ReactNode } from 'react';
import { useCarousel } from './CarouselProvider';
import { cn } from '@/lib/utils';

interface CarouselDotsProps {
  className?: string;
  /** Custom dot renderer */
  renderDot?: (index: number, isActive: boolean) => ReactNode;
  /** Hide when only 1 slide @default true */
  hideOnSingle?: boolean;
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({
  className,
  renderDot,
  hideOnSingle = true,
}) => {
  const { currentIndex, totalSlides, goToSlide, progress, isPaused } = useCarousel();

  if (hideOnSingle && totalSlides <= 1) return null;

  return (
    <div className={cn('flex items-center gap-1.5', className)} role="tablist">
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className={cn(
            'relative rounded-full transition-all duration-300',
            index === currentIndex
              ? 'w-6 h-2 bg-blue-500'
              : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
          )}
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`Go to slide ${index + 1}`}
        >
          {renderDot ? (
            renderDot(index, index === currentIndex)
          ) : index === currentIndex && !isPaused ? (
            <div
              className="absolute inset-0 bg-white/30 rounded-full"
              style={{ width: `${progress}%` }}
            />
          ) : null}
        </button>
      ))}
    </div>
  );
};