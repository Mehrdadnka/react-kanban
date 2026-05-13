import { EChartsOption } from 'echarts';
import { ReactNode } from 'react';

export interface ChartConfig {
  id: string;
  title: string;
  subtitle?: string;
  type: ChartType;
  icon?: ReactNode;
  color?: string;
  size?: ChartSize;
  options: EChartsOption;
  customRenderer?: ReactNode;
}

export type ChartType = 
  | 'sparkline'
  | 'ring' 
  | 'bar'
  | 'radar'
  | 'sunburst'
  | 'area'
  | 'heatmap'
  | 'custom';

export type ChartSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ChartCarouselContextType {
  currentIndex: number;
  totalSlides: number;
  isPaused: boolean;
  isTransitioning: boolean;
  chartTheme: 'light' | 'dark';
  chartHeight: number;
  chartWidth: number;
  activeChartTypes: Set<ChartType>;
  
  // Navigation
  goToSlide: (index: number) => void;
  nextSlide: () => void;
  prevSlide: () => void;
  togglePause: () => void;
  
  // Chart controls
  toggleChartType: (type: ChartType) => void;
  setChartTheme: (theme: 'light' | 'dark') => void;
  
  // Metrics (for animations/transitions)
  progress: number; // 0-100 within current slide
}