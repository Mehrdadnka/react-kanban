export interface DayActivity {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface HeatmapData {
  days: DayActivity[];
  totalActivity: number;
  activeDays: number;
  currentStreak: number;
}

export interface TooltipData {
  date: string;
  count: number;
  x: number;
  y: number;
  arrowX: number;
  arrowDirection: 'up' | 'down';
}

export interface RenderOptions {
  days: DayActivity[];
  highlightedLevel: number | null;
  hoveredDate: string | null;
  isDarkMode: boolean;
}

export type ActivityLevel = 0 | 1 | 2 | 3 | 4;