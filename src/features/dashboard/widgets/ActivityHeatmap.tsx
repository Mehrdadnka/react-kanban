// features/activity-heatmap/ActivityHeatmap.tsx
import React, { useCallback, useEffect } from 'react';
import { useTaskStore } from '@/stores/task.store';
import { useHeatmapStore } from './activity-heatmap/store/heatmap.store';
import { HeatmapStats } from './activity-heatmap/components/HeatmapStats';
import { HeatmapCanvas } from './activity-heatmap/components/HeatmapCanvas';
import { HeatmapTooltip } from './activity-heatmap/components/HeatmapTooltip';
import { HeatmapLegend } from './activity-heatmap/components/HeatmapLegend';
import { calculateTooltipPosition } from './activity-heatmap/engine/tooltip-position';
import { ActivityLevel } from './activity-heatmap/types';
import * as Tooltip from '@radix-ui/react-tooltip';

export const ActivityHeatmap: React.FC = () => {
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
    calculateData(tasks);
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

  // این callback تایپ درست داره: (level: ActivityLevel | null) => void
  const handleLegendHover = useCallback((level: ActivityLevel | null) => {
    setHighlightLevel(level);
  }, [setHighlightLevel]);

  if (!heatmapData) return null;

  return (
    <div className="flex w-fit flex-col">
      <Tooltip.Provider>
        <div className="w-full h-full">
          <HeatmapStats
            totalActivity={heatmapData.totalActivity}
            activeDays={heatmapData.activeDays}
            currentStreak={heatmapData.currentStreak}
          />
          
          <div className="h-full flex flex-col justify-center">
            <HeatmapCanvas onCellHover={handleCellHover} />
            <HeatmapTooltip />
          </div>
        </div>
      </Tooltip.Provider>
      
      <HeatmapLegend
        highlightLevel={highlightLevel}
        onHover={handleLegendHover}
      />
    </div>
  );
};