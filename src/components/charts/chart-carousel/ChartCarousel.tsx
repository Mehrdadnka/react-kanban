// components/charts/chart-carousel/ChartCarousel.tsx
import React from 'react';
import { CarouselProvider, CarouselSlides, CarouselDots, CarouselControls, CarouselProps } from '@/components/ui/carousel';
import { ChartConfig } from './types';
import { cn } from '@/lib/utils';

interface ChartCarouselProps extends Partial<CarouselProps> {
  charts: ChartConfig[];
  chartHeight?: number;
  showControls?: boolean;
  showDots?: boolean;
  renderCustomSlide?: (chart: ChartConfig, index: number) => React.ReactNode;
}

export const ChartCarousel: React.FC<ChartCarouselProps> = ({
  charts,
  chartHeight = 280,
  showControls = true,
  showDots = true,
  renderCustomSlide,
  autoPlayInterval = 5000,
  transitionDuration = 600,
  className,
  onSlideChange,
}) => {
  return (
    <CarouselProvider
      totalSlides={charts.length}
      autoPlayInterval={charts.length > 1 ? autoPlayInterval : 0}
      transitionDuration={transitionDuration}
      pauseOnHover={true}
      onSlideChange={onSlideChange}
      className={cn('relative w-full', className)}
    >
      <CarouselSlides className="rounded-xl">
        {charts.map((chart, index) => (
          <div
            key={chart.id}
            className="p-4 h-full bg-white dark:bg-gray-900 border dark:border-gray-800 rounded-xl"
            style={{ minHeight: `${chartHeight}px` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                  {chart.title}
                </h4>
                {chart.subtitle && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {chart.subtitle}
                  </p>
                )}
              </div>
              {chart.icon && (
                <span className="text-lg opacity-60">{chart.icon}</span>
              )}
            </div>
            
            {/* Chart Content */}
            <div style={{ height: `${chartHeight - 68}px` }}>
              {renderCustomSlide ? (
                renderCustomSlide(chart, index)
              ) : chart.customRenderer ? (
                chart.customRenderer
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <span className="text-sm">{chart.type} chart</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </CarouselSlides>

      {charts.length > 1 && showControls && (
        <div className="flex items-center justify-between mt-3 px-2">
          <CarouselDots />
          <CarouselControls />
        </div>
      )}
    </CarouselProvider>
  );
};