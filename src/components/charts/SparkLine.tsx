import React, { useMemo, useCallback } from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';

interface SparkLineProps {
  data: number[];
  labels?: string[];
  color?: string;
  areaColor?: string;
  smooth?: boolean;
  showDots?: boolean;
  animate?: boolean;
  className?: string;
  onPointClick?: (value: number, index: number) => void;
}

export const SparkLine: React.FC<SparkLineProps> = ({
  data,
  labels,
  color = '#6366f1',
  areaColor,
  smooth = true,
  showDots = false,
  animate = true,
  className,
  onPointClick,
}) => {
  const defaultAreaColor = `${color}20`; // 12% opacity

  const options = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      top: 8,
      right: 4,
      bottom: 4,
      left: 4,
    },
    xAxis: {
      type: 'category',
      data: labels || data.map((_, i) => i + 1),
      show: false,
    },
    yAxis: {
      type: 'value',
      show: false,
      min: Math.min(...data) * 0.9,
      max: Math.max(...data) * 1.1,
    },
    series: [{
      data,
      type: 'line',
      smooth,
      symbol: showDots ? 'circle' : 'none',
      symbolSize: 3,
      lineStyle: { color, width: 2 },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: areaColor || defaultAreaColor },
          { offset: 1, color: 'transparent' },
        ]),
      },
      animation: animate,
      animationDuration: 1000,
    }],
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#f3f4f6', fontSize: 11 },
      formatter: (params: any) => `${params[0].value}`,
    },
  }), [data, labels, color, areaColor, defaultAreaColor, smooth, showDots, animate]);

  const handleReady = useCallback((chart: echarts.ECharts) => {
    if (onPointClick) {
      chart.on('click', (params: any) => {
        onPointClick(params.value, params.dataIndex);
      });
    }
  }, [onPointClick]);

  return (
    <BaseChart
      options={options as echarts.EChartsOption}
      onReady={handleReady}
      className={cn('w-full h-full', className)}
    />
  );
};