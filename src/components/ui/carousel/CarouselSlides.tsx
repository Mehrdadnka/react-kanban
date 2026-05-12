// components/ui/carousel/CarouselSlides.tsx
import React, { ReactNode } from 'react';
import { useCarousel } from './CarouselProvider';

interface CarouselSlidesProps {
  children: ReactNode;
  className?: string;
  /** Render each slide with custom wrapper */
  renderSlide?: (children: ReactNode, index: number, isActive: boolean) => ReactNode;
}

export const CarouselSlides: React.FC<CarouselSlidesProps> = ({
  children,
  className,
  renderSlide,
}) => {
  const { currentIndex, isTransitioning, transitionDuration } = useCarousel();
  const slides = React.Children.toArray(children);

  if (slides.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No slides available
      </div>
    );
  }

  return (
    <div className={`overflow-hidden ${className || ''}`}>
      <div
        className="flex transition-transform ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transitionDuration: `${transitionDuration}ms`,
          transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
          transitionProperty: isTransitioning ? 'transform' : 'none',
        }}
      >
        {slides.map((slide, index) => (
          <div
            key={index}
            className="w-full flex-shrink-0"
            aria-hidden={index !== currentIndex}
            role="tabpanel"
          >
            {renderSlide ? renderSlide(slide, index, index === currentIndex) : slide}
          </div>
        ))}
      </div>
    </div>
  );
};