import React, { useCallback } from 'react';
import { ChartCarousel } from '@/components/charts/chart-carousel';
import { TaskProgressRing, PriorityBreakdown, TaskVelocity, LabelSunburst } from '@/components/charts';
import { useBoardChartData } from '../../hooks/useBoardChartData';
import { ChartConfig } from '@/components/charts/chart-carousel/types';
import { cn } from '@/lib/utils';

interface BoardAnalyticsCarouselProps {
  boardId: string;
  className?: string;
}

export const BoardAnalyticsCarousel: React.FC<BoardAnalyticsCarouselProps> = ({
  boardId,
  className,
}) => {
  const {
    progressData,
    priorityData,
    velocityData,
    labelSunburstData,
    charts,
    board,
  } = useBoardChartData(boardId);

  const renderCustomSlide = useCallback((chart: ChartConfig, index: number) => {
    switch (chart.id) {
      case 'progress':
        return (
          <TaskProgressRing
            completed={progressData.done}
            total={progressData.total}
            color={board?.color || '#22c55e'}
            labelFormat="fraction"
            animate={true}
          />
        );
      
      case 'priority':
        return (
          <PriorityBreakdown
            data={priorityData}
            orientation="horizontal"
            animate={true}
          />
        );
      
      case 'velocity':
        return (
          <TaskVelocity
            data={velocityData}
            showArea={true}
            animate={true}
          />
        );
      
      case 'labels':
        return (
          <LabelSunburst
            data={labelSunburstData}
            animate={true}
          />
        );
      
      default:
        return null;
    }
  }, [progressData, priorityData, velocityData, labelSunburstData, board]);

  if (charts.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400">
        No analytics available
      </div>
    );
  }

  return (
    <ChartCarousel
      charts={charts}
      autoPlayInterval={4000}
      chartHeight={280}
      showControls={true}
      showDots={true}
      className={cn('w-full', className)}
      renderCustomSlide={renderCustomSlide}
    />
  );
};