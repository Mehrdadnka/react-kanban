import React, { useMemo, useState, memo, useCallback, useEffect, useRef } from 'react';
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

const TOTAL_DAYS = 365;
const CELL_SIZE = 10;
const CELL_GAP = 2;
const CELL_UNIT = CELL_SIZE + CELL_GAP;

const CANVAS_WIDTH = 53 * CELL_UNIT + 30; // 53 weeks + padding
const CANVAS_HEIGHT = 7 * CELL_UNIT + 25; // 7 days + labels

const MONTH_LABEL_Y = 10;
const GRID_OFFSET_X = 28;
const GRID_OFFSET_Y = 20;

// Helper functions
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

// Helper function to calculate optimal tooltip position
interface TooltipPosition {
  x: number;
  y: number;
  arrowDirection: 'up' | 'down';
}

const calculateTooltipPosition = (
  clientX: number,
  clientY: number,
  tooltipWidth: number = 150, // approximate width
  tooltipHeight: number = 50, // approximate height
  offset: number = 12
): TooltipPosition => {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Default: show above cursor
  let x = clientX;
  let y = clientY - tooltipHeight - offset;
  let arrowDirection: 'up' | 'down' = 'up';
  
  // If tooltip would go above viewport, show below cursor
  if (y < 10) {
    y = clientY + offset;
    arrowDirection = 'down';
  }
  
  // If tooltip would go below viewport, show above cursor
  if (y + tooltipHeight > viewportHeight - 10) {
    y = clientY - tooltipHeight - offset;
    arrowDirection = 'up';
  }
  
  // Horizontal adjustment
  // Center tooltip on cursor by default
  x = x - tooltipWidth / 2;
  
  // If tooltip would go off right edge
  if (x + tooltipWidth > viewportWidth - 10) {
    x = viewportWidth - tooltipWidth - 10;
  }
  
  // If tooltip would go off left edge
  if (x < 10) {
    x = 10;
  }
  
  // Calculate arrow position relative to tooltip
  const arrowX = clientX - x; // Position arrow directly under cursor
  
  return { x, y, arrowDirection };
};

// Canvas Renderer with precise mouse tracking
class CanvasHeatmapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private days: DayActivity[] = [];
  private highlightLevel: number | null = null;
  private isDarkMode: boolean = false;
  private hoveredDate: string | null = null;
  private onCellHover: ((date: string | null, count: number, clientX: number, clientY: number) => void) | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave.bind(this));
  }

  private getCanvasPosition(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    
    // Calculate scale between canvas actual size and display size
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    
    // Convert client coordinates to canvas coordinates
    const canvasX = (clientX - rect.left) * scaleX;
    const canvasY = (clientY - rect.top) * scaleY;
    
    return { x: canvasX, y: canvasY };
  }

  private handleMouseMove(e: MouseEvent) {
    const { x, y } = this.getCanvasPosition(e.clientX, e.clientY);
    
    // Check if within grid bounds
    if (x < GRID_OFFSET_X || y < GRID_OFFSET_Y) {
      this.clearHover();
      return;
    }

    const weekIndex = Math.floor((x - GRID_OFFSET_X) / CELL_UNIT);
    const dayIndex = Math.floor((y - GRID_OFFSET_Y) / CELL_UNIT);

    // Check bounds
    if (
      weekIndex < 0 || 
      dayIndex < 0 || 
      dayIndex >= 7 ||
      x > GRID_OFFSET_X + (weekIndex + 1) * CELL_UNIT ||
      y > GRID_OFFSET_Y + (dayIndex + 1) * CELL_UNIT
    ) {
      this.clearHover();
      return;
    }

    const dayArrayIndex = weekIndex * 7 + dayIndex;
    
    if (dayArrayIndex >= 0 && dayArrayIndex < this.days.length) {
      const day = this.days[dayArrayIndex];
      
      // Only update if hovered date changed
      if (this.hoveredDate !== day.date) {
        this.hoveredDate = day.date;
        this.onCellHover?.(day.date, day.count, e.clientX, e.clientY);
        this.drawHeatmap(this.days);
        this.canvas.style.cursor = 'pointer';
      }
    } else {
      this.clearHover();
    }
  }

  private handleMouseLeave() {
    this.clearHover();
  }

  private clearHover() {
    if (this.hoveredDate !== null) {
      this.hoveredDate = null;
      this.onCellHover?.(null, 0, 0, 0);
      this.drawHeatmap(this.days);
      this.canvas.style.cursor = 'default';
    }
  }

  setDarkMode(isDark: boolean) {
    this.isDarkMode = isDark;
    this.drawHeatmap(this.days);
  }

  setHighlightLevel(level: number | null) {
    this.highlightLevel = level;
    this.drawHeatmap(this.days);
  }

  setOnCellHover(callback: (date: string | null, count: number, clientX: number, clientY: number) => void) {
    this.onCellHover = callback;
  }

  private getColor(level: number, isHighlighted: boolean = false): string {
    const colors = this.isDarkMode ? COLORS.dark : COLORS.light;
    let color = colors[level] || colors[0];
    
    if (isHighlighted) {
      // Lighten the color for highlight effect
      return this.lightenColor(color, 30);
    }
    
    return color;
  }

  private lightenColor(hex: string, amount: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.min(255, (num >> 16) + amount);
    const g = Math.min(255, ((num >> 8) & 0x00FF) + amount);
    const b = Math.min(255, (num & 0x0000FF) + amount);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }

  drawHeatmap(days: DayActivity[]) {
    this.days = days;
    
    // Setup canvas with device pixel ratio
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.canvas.style.width = `${CANVAS_WIDTH}px`;
    this.canvas.style.height = `${CANVAS_HEIGHT}px`;
    
    // Reset transform and scale for retina displays
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    
    // Clear canvas
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw month labels
    this.drawMonthLabels();
    
    // Draw day labels
    this.drawDayLabels();
    
    // Draw grid cells
    this.drawCells();
  }

  private drawMonthLabels() {
    let lastMonth = -1;
    const weeks = Math.ceil(this.days.length / 7);
    
    this.ctx.fillStyle = this.isDarkMode ? '#9ca3af' : '#6b7280';
    this.ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.textBaseline = 'top';
    
    for (let weekIndex = 0; weekIndex < weeks; weekIndex++) {
      const dayIndex = weekIndex * 7;
      if (dayIndex < this.days.length) {
        const date = new Date(this.days[dayIndex].date);
        const month = date.getMonth();
        
        if (month !== lastMonth) {
          const x = GRID_OFFSET_X + weekIndex * CELL_UNIT;
          this.ctx.fillText(MONTHS[month], x, MONTH_LABEL_Y);
          lastMonth = month;
        }
      }
    }
  }

  private drawDayLabels() {
    this.ctx.fillStyle = this.isDarkMode ? '#9ca3af' : '#6b7280';
    this.ctx.font = '10px -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif';
    this.ctx.textAlign = 'right';
    this.ctx.textBaseline = 'middle';
    
    [1, 3, 5].forEach(dayIndex => {
      const y = GRID_OFFSET_Y + dayIndex * CELL_UNIT + CELL_SIZE / 2;
      this.ctx.fillText(DAY_LABELS[dayIndex], GRID_OFFSET_X - 4, y);
    });
  }

  private drawCells() {
    this.days.forEach((day, index) => {
      const weekIndex = Math.floor(index / 7);
      const dayIndex = index % 7;
      const x = GRID_OFFSET_X + weekIndex * CELL_UNIT;
      const y = GRID_OFFSET_Y + dayIndex * CELL_UNIT;

      const isHovered = day.date === this.hoveredDate;
      const isHighlighted = 
        (this.highlightLevel !== null && this.highlightLevel === day.level && day.count > 0) || 
        isHovered;

      // Draw cell
      this.ctx.fillStyle = this.getColor(day.level, isHighlighted);
      this.drawRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 3);
      this.ctx.fill();

      // Draw subtle border for active cells
      if (day.level > 0) {
        this.ctx.strokeStyle = isHighlighted 
          ? 'rgba(255, 255, 255, 0.4)' 
          : 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.drawRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 3);
        this.ctx.stroke();
      }

      // Draw hover glow effect
      if (isHovered) {
        this.ctx.shadowColor = this.isDarkMode 
          ? 'rgba(255, 255, 255, 0.3)' 
          : 'rgba(0, 0, 0, 0.2)';
        this.ctx.shadowBlur = 4;
        this.ctx.strokeStyle = this.isDarkMode 
          ? 'rgba(255, 255, 255, 0.5)' 
          : 'rgba(0, 0, 0, 0.3)';
        this.ctx.lineWidth = 1;
        this.drawRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 3);
        this.ctx.stroke();
        
        // Reset shadow
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      }
    });
  }

  private drawRoundedRect(x: number, y: number, w: number, h: number, r: number) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + r, y);
    this.ctx.lineTo(x + w - r, y);
    this.ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    this.ctx.lineTo(x + w, y + h - r);
    this.ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    this.ctx.lineTo(x + r, y + h);
    this.ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    this.ctx.lineTo(x, y + r);
    this.ctx.quadraticCurveTo(x, y, x + r, y);
    this.ctx.closePath();
  }

  destroy() {
    this.canvas.removeEventListener('mousemove', this.handleMouseMove);
    this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
  }
}

// Legend Component
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
        isActive && 'ring-2 ring-offset-1 ring-gray-400 dark:ring-gray-500'
      )}
      style={{ backgroundColor: color }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    />
  );
});
LegendItem.displayName = 'LegendItem';

// Main Component
export const ActivityHeatmap: React.FC = () => {
  const tasks = useTaskStore(state => state.tasks);
  const { isDarkMode } = useApp();
  const [highlightLevel, setHighlightLevel] = useState<number | null>(null);
  const [tooltipData, setTooltipData] = useState<{ 
    date: string; 
    count: number;
    x: number;
    y: number;
    arrowX: number;
    arrowDirection: 'up' | 'down';
  } | null>(null);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<CanvasHeatmapRenderer | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const handleLegendHover = useCallback((level: number | null) => {
    setHighlightLevel(level);
  }, []);

  const handleCellHover = useCallback((
    date: string | null, 
    count: number, 
    clientX: number, 
    clientY: number
  ) => {
    if (date) {
      // Calculate optimal position
      const tooltipWidth = tooltipRef.current?.offsetWidth || 150;
      const tooltipHeight = tooltipRef.current?.offsetHeight || 50;
      const pos = calculateTooltipPosition(clientX, clientY, tooltipWidth, tooltipHeight);
      
      setTooltipData({ 
        date, 
        count,
        x: pos.x,
        y: pos.y,
        arrowX: clientX - pos.x,
        arrowDirection: pos.arrowDirection,
      });
    } else {
      setTooltipData(null);
    }
  }, []);

  // Compute heatmap data
  const { totalActivity, activeDays, currentStreak, days } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(today.getTime() - TOTAL_DAYS * 24 * 60 * 60 * 1000);
    startDate.setHours(0, 0, 0, 0);
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const days: DayActivity[] = [];
    const currentDate = new Date(startDate);

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

    const totalActivity = days.reduce((sum, day) => sum + day.count, 0);
    const activeDays = days.filter(d => d.count > 0).length;
    
    let streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) streak++;
      else break;
    }

    return {
      totalActivity,
      activeDays,
      currentStreak: streak,
      days,
    };
  }, [tasks]);

  // Initialize Canvas renderer
  useEffect(() => {
    if (!canvasRef.current) return;

    const renderer = new CanvasHeatmapRenderer(canvasRef.current);
    renderer.setOnCellHover(handleCellHover);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
    };
  }, []); // Only initialize once

  // Update heatmap when data changes
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.drawHeatmap(days);
    }
  }, [days]);

  // Update dark mode
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setDarkMode(isDarkMode);
    }
  }, [isDarkMode]);

  // Update highlight
  useEffect(() => {
    if (rendererRef.current) {
      rendererRef.current.setHighlightLevel(highlightLevel);
    }
  }, [highlightLevel]);

  // Color getter for legend
  const cellColors = useMemo(() => 
    isDarkMode ? COLORS.dark : COLORS.light
  , [isDarkMode]);

  const getCellColor = useCallback((level: number): string => cellColors[level], [cellColors]);

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

        {/* Canvas Container */}
        <div 
          className="overflow-x-auto scrollbar-thin flex flex-col items-center scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600"
        >
          <div className="relative" style={{ 
            width: CANVAS_WIDTH, 
            height: CANVAS_HEIGHT,
            minWidth: CANVAS_WIDTH 
          }}>
            <canvas
              ref={canvasRef}
              style={{
                width: CANVAS_WIDTH,
                height: CANVAS_HEIGHT,
                display: 'block',
              }}
            />
            
            {/* Smart Tooltip */}
            {tooltipData && (
              <div
                ref={tooltipRef}
                className="fixed z-[9999] pointer-events-none"
                style={{
                  left: tooltipData.x,
                  top: tooltipData.y,
                  opacity: 1,
                  transition: 'opacity 150ms ease-in-out',
                }}
              >
                <div className="relative">
                  {/* Tooltip Arrow - Top */}
                  {tooltipData.arrowDirection === 'down' && (
                    <div 
                      className={cn(
                        'absolute w-2 h-2 rotate-45',
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                        'border-t border-l'
                      )}
                      style={{ 
                        left: tooltipData.arrowX - 4,
                        top: -4,
                      }}
                    />
                  )}
                  
                  {/* Tooltip Content */}
                  <div
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-xs font-medium border shadow-lg whitespace-nowrap',
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200 text-gray-700 shadow-gray-200/50'
                    )}
                  >
                    <div className="text-center">
                      <div className="font-semibold">
                        {tooltipData.count} {tooltipData.count === 1 ? 'activity' : 'activities'}
                      </div>
                      <div className="text-[10px] opacity-75">
                        {formatTooltipDate(tooltipData.date)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Tooltip Arrow - Bottom */}
                  {tooltipData.arrowDirection === 'up' && (
                    <div 
                      className={cn(
                        'absolute w-2 h-2 rotate-45',
                        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
                        'border-b border-r'
                      )}
                      style={{ 
                        left: tooltipData.arrowX - 4,
                        bottom: -4,
                      }}
                    />
                  )}
                </div>
              </div>
            )}
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