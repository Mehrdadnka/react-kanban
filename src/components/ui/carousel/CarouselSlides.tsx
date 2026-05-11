// components/ui/carousel/CarouselSlides.tsx
import React, { ReactNode } from 'react';
import { useCarousel } from './Carousel';
import { cn } from '@/lib/utils';

interface CarouselSlidesProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export const CarouselSlides: React.FC<CarouselSlidesProps> = ({
  children,
  className,
  style,
}) => {
  const { currentIndex, totalSlides } = useCarousel();

  return (
    <div
      className={cn('overflow-hidden', className)}
      role="region"
      aria-roledescription="carousel"
      aria-label={`Showing slide ${currentIndex + 1} of ${totalSlides}`}
    >
      <div
        className="flex transition-transform ease-in-out"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transitionDuration: '500ms',
          ...style,
        }}
      >
        {React.Children.map(children, (child, index) => {
          // Check if child is a valid React element
          if (React.isValidElement(child)) {
            return (
              <div
                className="w-full flex-shrink-0"
                role="group"
                aria-roledescription="slide"
                aria-label={`Slide ${index + 1} of ${totalSlides}`}
                aria-hidden={index !== currentIndex}
              >
                {child}
              </div>
            );
          }
          return child;
        })}
      </div>
    </div>
  );
};