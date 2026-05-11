// components/ui/carousel/CarouselDots.tsx
import React from 'react';
import { useCarousel } from './Carousel';
import { cn } from '@/lib/utils';

interface CarouselDotsProps {
  className?: string;
  /** Custom render function for dots */
  renderDot?: (index: number, isActive: boolean) => React.ReactNode;
  /** Show only when multiple slides @default true */
  hideOnSingle?: boolean;
}

export const CarouselDots: React.FC<CarouselDotsProps> = ({
  className,
  renderDot,
  hideOnSingle = true,
}) => {
  const { currentIndex, totalSlides, goToSlide } = useCarousel();

  if (hideOnSingle && totalSlides <= 1) return null;

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="tablist"
      aria-label="Slider pagination"
    >
      {Array.from({ length: totalSlides }, (_, index) => (
        <button
          key={index}
          onClick={() => goToSlide(index)}
          className={cn(
            'transition-all duration-300 rounded-full',
            index === currentIndex
              ? 'w-6 h-2 bg-blue-500'
              : 'w-2 h-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400'
          )}
          role="tab"
          aria-selected={index === currentIndex}
          aria-label={`Go to slide ${index + 1}`}
        >
          {renderDot?.(index, index === currentIndex)}
        </button>
      ))}
    </div>
  );
};