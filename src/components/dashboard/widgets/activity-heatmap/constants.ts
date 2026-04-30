import { ActivityLevel } from "./types";

// features/activity-heatmap/constants.ts
export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export const DAY_LABELS = ['', 'Mon', '', 'Wed', '', 'Fri', ''] as const;
export const LEVELS: readonly ActivityLevel[] = [0, 1, 2, 3, 4] as const;
export const TOTAL_DAYS = 365;
export const CELL_SIZE = 10;
export const CELL_GAP = 2;
export const CELL_UNIT = CELL_SIZE + CELL_GAP;

export const CANVAS_WIDTH = 53 * CELL_UNIT + 30;
export const CANVAS_HEIGHT = 7 * CELL_UNIT + 25;

export const MONTH_LABEL_Y = 10;
export const GRID_OFFSET_X = 28;
export const GRID_OFFSET_Y = 20;

export const COLORS = {
  dark: [
    '#1a2332',
    '#0d3b66',
    '#1a56db',
    '#06b6d4',
    '#22d3ee',
  ],
  light: [
    '#f0f9ff',
    '#bae6fd',
    '#7dd3fc',
    '#a5b4fc',
    '#6366f1',
  ],
} as const;