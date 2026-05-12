import React, { createContext, useContext, useCallback, useRef, useState, useEffect } from 'react';
import { CarouselContextType, CarouselProps } from './types';

const CarouselContext = createContext<CarouselContextType | null>(null);

export const useCarousel = () => {
  const ctx = useContext(CarouselContext);
  if (!ctx) throw new Error('useCarousel must be used within <Carousel>');
  return ctx;
};

export const CarouselProvider: React.FC<CarouselProps> = ({
  children,
  totalSlides,
  autoPlayInterval = 3000,
  transitionDuration = 500,
  pauseOnHover = true,
  defaultIndex = 0,
  onSlideChange,
  className,
}) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const autoPlayTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Navigation with transition lock
  const goToSlide = useCallback((index: number) => {
    if (isTransitioning || totalSlides <= 1 || index === currentIndex) return;
    
    setIsTransitioning(true);
    setCurrentIndex(index);
    setProgress(0);
    onSlideChange?.(index);
    
    if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [isTransitioning, totalSlides, transitionDuration, currentIndex, onSlideChange]);

  const nextSlide = useCallback(() => {
    goToSlide((currentIndex + 1) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  const prevSlide = useCallback(() => {
    goToSlide((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, totalSlides, goToSlide]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Progress tracking
  useEffect(() => {
    if (isPaused || totalSlides <= 1 || !autoPlayInterval) return;
    
    const startTime = Date.now();
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / autoPlayInterval) * 100);
      setProgress(pct);
    }, 50);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentIndex, isPaused, autoPlayInterval, totalSlides]);

  // Auto-play
  useEffect(() => {
    if (isPaused || totalSlides <= 1 || !autoPlayInterval) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }
    
    autoPlayTimerRef.current = setInterval(nextSlide, autoPlayInterval);
    
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isPaused, nextSlide, autoPlayInterval, totalSlides]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, []);

  const contextValue: CarouselContextType = {
    currentIndex,
    totalSlides,
    isPaused,
    isTransitioning,
    transitionDuration,
    progress,
    goToSlide,
    nextSlide,
    prevSlide,
    togglePause,
    setIsPaused,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label={`Slide ${currentIndex + 1} of ${totalSlides}`}
        className={className}
        onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};