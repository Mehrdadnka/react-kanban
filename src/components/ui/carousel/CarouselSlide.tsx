// components/ui/carousel/CarouselSlide.tsx
import React, { ReactNode, useEffect } from 'react';
import { useCarousel } from './Carousel';

interface CarouselSlideProps {
  children: ReactNode;
}

export const CarouselSlide: React.FC<CarouselSlideProps> = ({ children }) => {
  const { registerSlide } = useCarousel();

  useEffect(() => {
    const unregister = registerSlide();
    return unregister;
  }, [registerSlide]);

  return <>{children}</>;
};