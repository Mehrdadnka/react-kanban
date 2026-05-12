import { ReactNode } from 'react';

export interface CarouselContextType {
  currentIndex: number;
  totalSlides: number;
  isPaused: boolean;
  isTransitioning: boolean;
  transitionDuration: number;
  progress: number;
  
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  togglePause: () => void;
  setIsPaused: (paused: boolean) => void;
}

export interface CarouselProps {
  children: ReactNode;
  /** Number of slides */
  totalSlides: number;
  /** Auto-play interval in ms (0 = disabled) @default 3000 */
  autoPlayInterval?: number;
  /** Transition duration in ms @default 500 */
  transitionDuration?: number;
  /** Pause on hover @default true */
  pauseOnHover?: boolean;
  /** Default starting index @default 0 */
  defaultIndex?: number;
  /** Called when slide changes */
  onSlideChange?: (index: number) => void;
  /** Custom wrapper className */
  className?: string;
}