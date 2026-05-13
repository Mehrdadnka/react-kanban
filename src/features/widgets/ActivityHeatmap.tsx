// components/charts/ActivityHeatmapChart.tsx
import React, { useCallback, useEffect } from 'react';
import { useTaskStore } from '@/stores/task.store';
import * as Tooltip from '@radix-ui/react-tooltip';
import { cn } from '@/lib/utils';
import { useHeatmapStore } from './activity-heatmap/store/heatmap.store';
import { calculateTooltipPosition } from './activity-heatmap/engine/tooltip-position';
import { ActivityLevel } from './activity-heatmap/types';
import { HeatmapStats } from './activity-heatmap/components/HeatmapStats';
import { HeatmapCanvas } from './activity-heatmap/components/HeatmapCanvas';
import { HeatmapTooltip } from './activity-heatmap/components/HeatmapTooltip';
import { HeatmapLegend } from './activity-heatmap/components/HeatmapLegend';

interface ActivityHeatmapProps {
  showStats?: boolean;
  showLegend?: boolean;
  compact?: boolean;
  className?: string;
}

export const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  showStats = true,
  showLegend = true,
  compact = false,
  className,
}) => {
  const tasks = useTaskStore(s => s.tasks);
  
  const {
    heatmapData,
    highlightLevel,
    calculateData,
    setHoveredCell,
    setTooltipData,
    setHighlightLevel,
  } = useHeatmapStore();

  useEffect(() => {
    if (tasks && tasks.length > 0) {
      calculateData(tasks);
    } else {
      calculateData([]);
    }
  }, [tasks, calculateData]);

  const handleCellHover = useCallback((
    date: string | null,
    count: number,
    clientX: number,
    clientY: number
  ) => {
    if (date) {
      const pos = calculateTooltipPosition(clientX, clientY);
      setTooltipData({
        date,
        count,
        x: pos.x,
        y: pos.y,
        arrowX: clientX - pos.x,
        arrowDirection: pos.arrowDirection,
      });
      setHoveredCell({ date, count });
    } else {
      setTooltipData(null);
      setHoveredCell(null);
    }
  }, [setTooltipData, setHoveredCell]);

  const handleLegendHover = useCallback((level: ActivityLevel | null) => {
    setHighlightLevel(level);
  }, [setHighlightLevel]);

  if (!heatmapData) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400 text-xs">
        No activity data yet
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col w-full h-full', className)}>
      <Tooltip.Provider>
        <div className="flex-1 flex flex-col">
          {showStats && (
            <HeatmapStats
              totalActivity={heatmapData.totalActivity}
              activeDays={heatmapData.activeDays}
              currentStreak={heatmapData.currentStreak}
            />
          )}
          
          <div className={cn(
            'flex-1 flex flex-col justify-center',
            compact ? 'min-h-[100px]' : 'min-h-[140px]'
          )}>
            <HeatmapCanvas onCellHover={handleCellHover} />
            <HeatmapTooltip />
          </div>
        </div>
      </Tooltip.Provider>
      
      {showLegend && (
        <HeatmapLegend
          highlightLevel={highlightLevel}
          onHover={handleLegendHover}
        />
      )}
    </div>
  );
};