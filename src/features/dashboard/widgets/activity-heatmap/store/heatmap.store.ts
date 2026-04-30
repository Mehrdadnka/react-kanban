// features/activity-heatmap/store/heatmap.store.ts
import { create } from 'zustand';
import { HeatmapData, TooltipData, ActivityLevel } from '../types';
import { calculateHeatmapData } from '../engine/heatmap-calculations';
import { Task } from '@/types/task.types';

interface HeatmapState {
  // Data
  heatmapData: HeatmapData | null;
  
  // UI State
  hoveredCell: { date: string; count: number } | null;
  tooltipData: TooltipData | null;
  highlightLevel: ActivityLevel | null;
  
  // Actions
  calculateData: (tasks: Task[]) => void;
  setHoveredCell: (cell: { date: string; count: number } | null) => void;
  setTooltipData: (data: TooltipData | null) => void;
  setHighlightLevel: (level: ActivityLevel | null) => void;
}

export const useHeatmapStore = create<HeatmapState>((set) => ({
  heatmapData: null,
  hoveredCell: null,
  tooltipData: null,
  highlightLevel: null,
  
  calculateData: (tasks) => 
    set({ heatmapData: calculateHeatmapData(tasks) }),
  
  setHoveredCell: (cell) => set({ hoveredCell: cell }),
  setTooltipData: (data) => set({ tooltipData: data }),
  setHighlightLevel: (level) => set({ highlightLevel: level }),
}));