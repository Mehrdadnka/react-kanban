import React, { useMemo, useState, memo, useCallback } from 'react';
import { useTaskStore } from '@/stores/task.store';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import * as Tooltip from '@radix-ui/react-tooltip';

// Types
interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface MonthData {
  label: string;
  weekIndex: number;
}

// Constants
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const;
const LEVELS = [0, 1, 2, 3, 4] as const;

const TOTAL_DAYS = 364;
const CELL_SIZE = 10;
const CELL_GAP = 2;
const CELL_UNIT = CELL_SIZE + CELL_GAP;

// Helper functions (hoisted outside component)
const getDateString = (date: Date): string => date.toISOString().split('T')[0];

const formatTooltipDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

const getActivityLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
  if (count === 0) return 0;
  if (count < 3) return 1;
  if (count < 6) return 2;
  if (count < 10) return 3;
  return 4;
};

// Color schemes
const COLORS = {
  dark: [
    'bg-[#1a2332]',
    'bg-[#0d3b66]',
    'bg-[#1a56db]',
    'bg-[#06b6d4]',
    'bg-[#22d3ee]',
  ],
  light: [
    'bg-[#f0f9ff]',
    'bg-[#bae6fd]',
    'bg-[#7dd3fc]',
    'bg-[#a5b4fc]',
    'bg-[#6366f1]',
  ],
} as const;

// Memoized sub-components
const LegendItem = memo<{
  level: number;
  color: string;
  isActive: boolean;
  onHover: (level: number | null) => void;
}>(({ level, color, isActive, onHover }) => {
  const handleMouseEnter = useCallback(() => onHover(level), [onHover, level]);
  const handleMouseLeave = useCallback(() => onHover(null), [onHover]);

  return (
    <div
      className={cn(
        'w-[10px] h-[10px] rounded-[3px] cursor-pointer transition-all duration-200',
        color,
        isActive && 'opacity-80 scale-110'
      )}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
});
LegendItem.displayName = 'LegendItem';

const DayCell = memo<{
  day: DayActivity;
  isHighlighted: boolean;
  cellColor: string;
  isDarkMode: boolean;
}>(({ day, isHighlighted, cellColor, isDarkMode }) => {
  const tooltipContent = useMemo(() => (
    <div className="text-center">
      <div className="font-semibold">
        {day.count} {day.count === 1 ? 'activity' : 'activities'}
      </div>
      <div className="text-[10px] opacity-75">
        {formatTooltipDate(day.date)}
      </div>
    </div>
  ), [day.count, day.date]);

  return (
    <Tooltip.Root delayDuration={100}>
      <Tooltip.Trigger asChild>
        <div
          className={cn(
            'w-[10px] h-[10px] rounded-[3px] cursor-pointer transition-colors duration-200',
            cellColor,
            isHighlighted && 'opacity-80',
            !isHighlighted && 'hover:opacity-70'
          )}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content
          side="top"
          sideOffset={5}
          className={cn(
            'rounded-lg px-3 py-1.5 text-xs font-medium border z-[9999]',
            isDarkMode
              ? 'bg-gray-800 border-gray-700 text-gray-200'
              : 'bg-white border-gray-200 text-gray-700'
          )}
        >
          {tooltipContent}
          <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
});
DayCell.displayName = 'DayCell';

const MonthLabels = memo<{ months: MonthData[] }>(({ months }) => (
  <div className="flex" style={{ marginLeft: '28px' }}>
    {months.map((month, index) => {
      if (index === 0) return null;
      
      const prevWeekIndex = months[index - 1].weekIndex;
      const currentWeekIndex = month.weekIndex;
      const marginLeft = index === 1
        ? currentWeekIndex * CELL_UNIT
        : (currentWeekIndex - prevWeekIndex - 1) * CELL_UNIT;
      
      return (
        <span
          key={month.label}
          className="text-[10px] text-gray-500 dark:text-gray-400"
          style={{ marginLeft: `${marginLeft}px` }}
        >
          {month.label}
        </span>
      );
    })}
  </div>
));
MonthLabels.displayName = 'MonthLabels';

// Day labels component
const DayLabels = memo(() => (
  <div className="flex flex-col gap-[2px] mr-[4px] pt-0">
    {Array.from({ length: 7 }).map((_, i) => (
      <div
        key={i}
        className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center"
        style={{
          height: `${CELL_SIZE}px`,
          visibility: [1, 3, 5].includes(i) ? 'visible' : 'hidden',
        }}
      >
        {DAY_LABELS[i]}
      </div>
    ))}
  </div>
));
DayLabels.displayName = 'DayLabels';

// Main component
export const ActivityHeatmap: React.FC = () => {
  const tasks = useTaskStore(state => state.tasks);
  const { isDarkMode } = useApp();
  const [highlightLevel, setHighlightLevel] = useState<number | null>(null);

  const handleLegendHover = useCallback((level: number | null) => {
    setHighlightLevel(level);
  }, []);

  // Compute heatmap data
  const { weeks, months, totalActivity, activeDays, currentStreak } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today.getTime() - TOTAL_DAYS * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    // Build day-by-day activity data
    const days: DayActivity[] = [];
    const currentDate = new Date(startDate);

    // Pre-compute task dates for faster lookup
    const taskDateMap = new Map<string, number>();
    tasks.forEach(task => {
      const taskDate = getDateString(new Date(task.createdAt));
      taskDateMap.set(taskDate, (taskDateMap.get(taskDate) || 0) + 1);
      
      if (task.updatedAt) {
        const updatedDate = getDateString(new Date(task.updatedAt));
        if (updatedDate !== taskDate) {
          taskDateMap.set(updatedDate, (taskDateMap.get(updatedDate) || 0) + 1);
        }
      }
    });

    while (currentDate <= today) {
      const dateStr = getDateString(currentDate);
      const count = taskDateMap.get(dateStr) || 0;

      days.push({
        date: dateStr,
        count,
        level: getActivityLevel(count),
      });
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Group days into weeks
    const weeks: DayActivity[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    // Calculate month labels
    const monthsData: MonthData[] = [];
    weeks.forEach((week, index) => {
      const firstDay = week[0];
      if (!firstDay) return;
      
      const date = new Date(firstDay.date);
      const prevWeek = weeks[index - 1];
      
      if (!prevWeek || new Date(prevWeek[0].date).getMonth() !== date.getMonth()) {
        monthsData.push({
          label: MONTHS[date.getMonth()],
          weekIndex: index,
        });
      }
    });

    // Calculate statistics
    const totalActivity = days.reduce((sum, day) => sum + day.count, 0);
    const activeDays = days.filter(d => d.count > 0).length;
    
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else break;
    }

    return {
      weeks,
      months: monthsData,
      totalActivity,
      activeDays,
      currentStreak: streak,
    };
  }, [tasks]);

  // Memoize color getter
  const colors = useMemo(() => isDarkMode ? COLORS.dark : COLORS.light, [isDarkMode]);
  const getCellColor = useCallback((level: number): string => colors[level], [colors]);

  return (
    <Tooltip.Provider>
      <div className="w-full">
        {/* Header with stats */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-2">
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

        {/* Heatmap Container */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
          <div className="flex justify-center min-w-max">
            <div className="flex flex-col gap-0">
              {/* Month Labels */}
              <MonthLabels months={months} />

              {/* Grid with day labels */}
              <div className="flex">
                <DayLabels />

                {/* Activity Cells */}
                <div className="flex gap-[2px]">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-[2px]">
                      {week.map((day) => (
                        <DayCell
                          key={day.date}
                          day={day}
                          isHighlighted={highlightLevel === day.level && day.count > 0}
                          cellColor={getCellColor(day.level)}
                          isDarkMode={isDarkMode}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-end mt-2">
          <div className="flex items-center gap-[2px] text-[10px] text-gray-500 dark:text-gray-400">
            <span className="mr-1">Less</span>
            {LEVELS.map((level) => (
              <LegendItem
                key={level}
                level={level}
                color={getCellColor(level)}
                isActive={highlightLevel === level}
                onHover={handleLegendHover}
              />
            ))}
            <span className="ml-1">More</span>
          </div>
        </div>
      </div>
    </Tooltip.Provider>
  );
};