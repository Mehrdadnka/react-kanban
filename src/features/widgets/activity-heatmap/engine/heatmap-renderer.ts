import { DayActivity, RenderOptions } from '../types';
import {
  COLORS,
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  CELL_SIZE,
  CELL_UNIT,
  GRID_OFFSET_X,
  GRID_OFFSET_Y,
  MONTH_LABEL_Y,
  MONTHS,
  DAY_LABELS,
} from '../constants';

type HoverCallback = (date: string | null, count: number, clientX: number, clientY: number) => void;

export class HeatmapRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private days: DayActivity[] = [];
  private hoveredDate: string | null = null;
  private highlightLevel: number | null = null;
  private isDarkMode: boolean = false;
  private onCellHover: HoverCallback | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    this.ctx = ctx;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.canvas.addEventListener('mousemove', this.handleMouseMove);
    this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
  }

  private handleMouseMove = (e: MouseEvent) => {
    const { x, y } = this.getCanvasPosition(e.clientX, e.clientY);
    
    if (x < GRID_OFFSET_X || y < GRID_OFFSET_Y) {
      this.clearHover();
      return;
    }

    const weekIndex = Math.floor((x - GRID_OFFSET_X) / CELL_UNIT);
    const dayIndex = Math.floor((y - GRID_OFFSET_Y) / CELL_UNIT);

    if (
      weekIndex < 0 || dayIndex < 0 || dayIndex >= 7 ||
      x > GRID_OFFSET_X + (weekIndex + 1) * CELL_UNIT ||
      y > GRID_OFFSET_Y + (dayIndex + 1) * CELL_UNIT
    ) {
      this.clearHover();
      return;
    }

    const dayArrayIndex = weekIndex * 7 + dayIndex;
    if (dayArrayIndex >= 0 && dayArrayIndex < this.days.length) {
      const day = this.days[dayArrayIndex];
      if (this.hoveredDate !== day.date) {
        this.hoveredDate = day.date;
        this.onCellHover?.(day.date, day.count, e.clientX, e.clientY);
        this.render();
      }
    } else {
      this.clearHover();
    }
  };

  private handleMouseLeave = () => {
    this.clearHover();
  };

  private clearHover() {
    if (this.hoveredDate !== null) {
      this.hoveredDate = null;
      this.onCellHover?.(null, 0, 0, 0);
      this.render();
    }
  }

  private getCanvasPosition(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = CANVAS_WIDTH / rect.width;
    const scaleY = CANVAS_HEIGHT / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  }

  setOnCellHover(callback: HoverCallback) {
    this.onCellHover = callback;
  }

  setOptions(options: Partial<RenderOptions>) {
    if (options.highlightedLevel !== undefined) this.highlightLevel = options.highlightedLevel;
    if (options.hoveredDate !== undefined) this.hoveredDate = options.hoveredDate;
    if (options.isDarkMode !== undefined) this.isDarkMode = options.isDarkMode;
    if (options.days) this.days = options.days;
    this.render();
  }

  render() {
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = CANVAS_WIDTH * dpr;
    this.canvas.height = CANVAS_HEIGHT * dpr;
    this.canvas.style.width = `${CANVAS_WIDTH}px`;
    this.canvas.style.height = `${CANVAS_HEIGHT}px`;
    
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this.ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    this.drawMonthLabels();
    this.drawDayLabels();
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

      this.ctx.fillStyle = this.getColor(day.level, isHighlighted);
      this.drawRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 3);
      this.ctx.fill();

      if (day.level > 0) {
        this.ctx.strokeStyle = isHighlighted 
          ? 'rgba(255, 255, 255, 0.4)' 
          : 'rgba(0, 0, 0, 0.1)';
        this.ctx.lineWidth = 0.5;
        this.drawRoundedRect(x, y, CELL_SIZE, CELL_SIZE, 3);
        this.ctx.stroke();
      }

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
        
        this.ctx.shadowColor = 'transparent';
        this.ctx.shadowBlur = 0;
      }
    });
  }

  private getColor(level: number, isHighlighted: boolean = false): string {
    const colors = this.isDarkMode ? COLORS.dark : COLORS.light;
    let color = colors[level] || colors[0];
    if (isHighlighted) {
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