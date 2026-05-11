// components/ui/carousel/Carousel.tsx
import React, {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  useState,
  ReactNode,
} from 'react';

// Types
interface CarouselContextType {
  currentIndex: number;
  totalSlides: number;
  isPaused: boolean;
  isTransitioning: boolean;
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  togglePause: () => void;
  registerSlide: () => () => void;
}

interface CarouselProps {
  children: ReactNode;
  /** Auto-play interval in ms. Set to 0 to disable. @default 3000 */
  autoPlayInterval?: number;
  /** Duration of slide transition in ms. @default 500 */
  transitionDuration?: number;
  /** Callback when slide changes */
  onSlideChange?: (index: number) => void;
  /** Default starting slide index @default 0 */
  defaultIndex?: number;
  /** Pause auto-play on hover @default true */
  pauseOnHover?: boolean;
}

// Context
const CarouselContext = createContext<CarouselContextType | null>(null);

export const useCarousel = () => {
  const context = useContext(CarouselContext);
  if (!context) {
    throw new Error('useCarousel must be used within a Carousel component');
  }
  return context;
};

// Main Component
export const Carousel: React.FC<CarouselProps> = ({
  children,
  autoPlayInterval = 3000,
  transitionDuration = 500,
  onSlideChange,
  defaultIndex = 0,
  pauseOnHover = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(defaultIndex);
  const [isPaused, setIsPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [totalSlides, setTotalSlides] = useState(0);
  
  const slidesRef = useRef<Set<() => void>>(new Set());
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);
  const transitionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Register/Unregister slides
  const registerSlide = useCallback(() => {
    const unregister = () => {
      slidesRef.current.delete(unregister);
      setTotalSlides(slidesRef.current.size);
    };
    slidesRef.current.add(unregister);
    setTotalSlides(slidesRef.current.size);
    return unregister;
  }, []);

  // Navigation with transition lock
  const navigateTo = useCallback((newIndex: number) => {
    if (isTransitioning || totalSlides <= 1) return;
    
    setIsTransitioning(true);
    setCurrentIndex(newIndex);
    onSlideChange?.(newIndex);

    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
    }
    transitionTimerRef.current = setTimeout(() => {
      setIsTransitioning(false);
    }, transitionDuration);
  }, [isTransitioning, totalSlides, transitionDuration, onSlideChange]);

  const nextSlide = useCallback(() => {
    navigateTo((currentIndex + 1) % totalSlides);
  }, [currentIndex, totalSlides, navigateTo]);

  const prevSlide = useCallback(() => {
    navigateTo((currentIndex - 1 + totalSlides) % totalSlides);
  }, [currentIndex, totalSlides, navigateTo]);

  const goToSlide = useCallback((index: number) => {
    if (index === currentIndex) return;
    navigateTo(index);
  }, [currentIndex, navigateTo]);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (!autoPlayInterval || isPaused || totalSlides <= 1) {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
      return;
    }

    autoPlayTimerRef.current = setInterval(nextSlide, autoPlayInterval);
    
    return () => {
      if (autoPlayTimerRef.current) {
        clearInterval(autoPlayTimerRef.current);
      }
    };
  }, [autoPlayInterval, isPaused, nextSlide, totalSlides]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      if (transitionTimerRef.current) clearTimeout(transitionTimerRef.current);
    };
  }, []);

  const contextValue: CarouselContextType = {
    currentIndex,
    totalSlides,
    isPaused,
    isTransitioning,
    goToSlide,
    nextSlide,
    prevSlide,
    togglePause,
    registerSlide,
  };

  return (
    <CarouselContext.Provider value={contextValue}>
      <div
        role="region"
        aria-roledescription="carousel"
        aria-label="Carousel"
        onMouseEnter={pauseOnHover ? () => setIsPaused(true) : undefined}
        onMouseLeave={pauseOnHover ? () => setIsPaused(false) : undefined}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
};