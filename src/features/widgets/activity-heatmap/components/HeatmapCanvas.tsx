import React, { useRef, useEffect } from 'react';
import { HeatmapRenderer } from '../engine/heatmap-renderer';
import { CANVAS_WIDTH, CANVAS_HEIGHT } from '../constants';
import { useHeatmapStore } from '../store/heatmap.store';
import { useApp } from '@/providers/AppProvider';

interface HeatmapCanvasProps {
  onCellHover: (date: string | null, count: number, clientX: number, clientY: number) => void;
}

export const HeatmapCanvas: React.FC<HeatmapCanvasProps> = ({ onCellHover }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<HeatmapRenderer | null>(null);
  const { heatmapData, highlightLevel, hoveredCell } = useHeatmapStore();
  const { isDarkMode } = useApp();

  // Initialize renderer
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const renderer = new HeatmapRenderer(canvasRef.current);
    renderer.setOnCellHover(onCellHover);
    rendererRef.current = renderer;

    return () => {
      renderer.destroy();
    };
  }, [onCellHover]);

  // Update renderer when options change
  useEffect(() => {
    if (!rendererRef.current || !heatmapData) return;
    
    rendererRef.current.setOptions({
      days: heatmapData.days,
      highlightedLevel: highlightLevel,
      hoveredDate: hoveredCell?.date ?? null,
      isDarkMode,
    });
  }, [heatmapData, highlightLevel, hoveredCell, isDarkMode]);

  return (
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
      </div>
    </div>
  );
};