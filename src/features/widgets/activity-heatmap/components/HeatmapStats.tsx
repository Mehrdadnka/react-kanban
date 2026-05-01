import React from 'react';

interface HeatmapStatsProps {
  totalActivity: number;
  activeDays: number;
  currentStreak: number;
}

export const HeatmapStats: React.FC<HeatmapStatsProps> = React.memo(({
  totalActivity,
  activeDays,
  currentStreak,
}) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
    <div className="text-xs sm:text-sm">
      <span className="font-semibold text-gray-900 dark:text-gray-100">
        {totalActivity}
      </span>
      <span className="text-gray-500 dark:text-gray-400 ml-1">
        activities
      </span>
    </div>
    
    <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-green-500 flex-shrink-0" />
        <span className="whitespace-nowrap">{activeDays} days</span>
      </div>
      <div className="flex items-center gap-1">
        <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-purple-500 flex-shrink-0" />
        <span className="whitespace-nowrap">{currentStreak} streak</span>
      </div>
    </div>
  </div>
));

HeatmapStats.displayName = 'HeatmapStats';