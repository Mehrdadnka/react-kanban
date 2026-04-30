// features/activity-heatmap/components/HeatmapLegend.tsx
import React, { useCallback, useMemo, memo } from 'react';
import { cn } from '@/lib/utils';
import { COLORS, LEVELS } from '../constants';
import { ActivityLevel } from '../types';
import { useApp } from '@/providers/AppProvider';

interface LegendItemProps {
  level: ActivityLevel;
  color: string;
  isActive: boolean;
  onHover: (level: ActivityLevel | null) => void;
}

const LegendItem = memo<LegendItemProps>(({ level, color, isActive, onHover }) => {
  const handleMouseEnter = useCallback(() => onHover(level), [onHover, level]);
  const handleMouseLeave = useCallback(() => onHover(null), [onHover]);

  return (
    <div
      className={cn(
        'w-[10px] h-[10px] rounded-[3px] cursor-pointer transition-all duration-200',
        isActive && 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500'
      )}
      style={{ backgroundColor: color }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
});

LegendItem.displayName = 'LegendItem';

interface HeatmapLegendProps {
  highlightLevel: ActivityLevel | null;
  onHover: (level: ActivityLevel | null) => void;
}

export const HeatmapLegend: React.FC<HeatmapLegendProps> = React.memo(({
  highlightLevel,
  onHover,
}) => {
  const { isDarkMode } = useApp();
  
  // Memoize colors to prevent recreation
  const colors = useMemo(
    () => isDarkMode ? COLORS.dark : COLORS.light,
    [isDarkMode]
  );
  
  const legendItems = useMemo(
    () => LEVELS.map((level) => (
      <LegendItem
        key={level}
        level={level}
        color={colors[level]}
        isActive={highlightLevel === level}
        onHover={onHover}
      />
    )),
    [colors, highlightLevel, onHover]
  );

  return (
    <div className="flex justify-end mt-2">
      <div className="flex items-center gap-[2px] text-[10px] text-gray-500 dark:text-gray-400">
        <span className="mr-1">Less</span>
        {legendItems}
        <span className="ml-1">More</span>
      </div>
    </div>
  );
});

HeatmapLegend.displayName = 'HeatmapLegend';