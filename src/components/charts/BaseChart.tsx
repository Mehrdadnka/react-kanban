import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as echarts from 'echarts';
import { cn } from '@/lib/utils';

interface BaseChartProps {
  /** ECharts options object */
  options: echarts.EChartsOption;
  /** Theme: 'dark' or 'light'. @default 'dark' */
  theme?: string;
  /** Additional CSS classes */
  className?: string;
  /** Called when chart instance is ready */
  onReady?: (chart: echarts.ECharts) => void;
  /** Auto-resize on container change. @default true */
  autoResize?: boolean;
}

export const BaseChart: React.FC<BaseChartProps> = ({
  options,
  theme = 'dark',
  className,
  onReady,
  autoResize = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<echarts.ECharts | null>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Watch container size
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      }
    });

    resizeObserver.observe(container);
    
    // Initial size
    const { width, height } = container.getBoundingClientRect();
    if (width > 0 && height > 0) {
      setDimensions({ width, height });
    }

    return () => resizeObserver.disconnect();
  }, []);

  // Init chart when dimensions are ready
  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;
    if (!containerRef.current) return;

    // Dispose old instance
    if (chartRef.current) {
      chartRef.current.dispose();
      chartRef.current = null;
    }

    // Create new instance
    const chart = echarts.init(containerRef.current, theme, {
      width: dimensions.width,
      height: dimensions.height,
    });

    chartRef.current = chart;
    
    // Set options
    chart.setOption(options, true);

    // Callback
    onReady?.(chart);

    return () => {
      chart.dispose();
      chartRef.current = null;
    };
  }, [dimensions.width, dimensions.height]); // Re-init only on size change

  // Update options without re-init
  useEffect(() => {
    if (chartRef.current && dimensions.width > 0) {
      chartRef.current.setOption(options, true);
    }
  }, [options]);

  // Resize handler
  useEffect(() => {
    if (!autoResize || !chartRef.current) return;

    chartRef.current.resize({
      width: dimensions.width,
      height: dimensions.height,
    });
  }, [dimensions.width, dimensions.height, autoResize]);

  return (
    <div
      ref={containerRef}
      className={cn('w-full h-full min-h-[100px]', className)}
    />
  );
};