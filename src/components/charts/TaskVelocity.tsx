import React, { useMemo } from 'react';
import * as echarts from 'echarts';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';

interface VelocityDataPoint {
  date: string;
  completed: number;
  created: number;
}

interface TaskVelocityProps {
  data: VelocityDataPoint[];
  showArea?: boolean;
  animate?: boolean;
  className?: string;
}

export const TaskVelocity: React.FC<TaskVelocityProps> = ({
  data,
  showArea = true,
  animate = true,
  className,
}) => {
  const options = useMemo(() => ({
    backgroundColor: 'transparent',
    grid: {
      top: 10,
      right: 12,
      bottom: 24,
      left: 36,
    },
    xAxis: {
      type: 'category',
      data: data.map(d => d.date),
      boundaryGap: false,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 9 },
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#374151', type: 'dashed', opacity: 0.3 } },
      axisLabel: { color: '#6b7280', fontSize: 9 },
    },
    series: [
      {
        name: 'Completed',
        data: data.map(d => d.completed),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#22c55e' },
        areaStyle: showArea ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(34, 197, 94, 0.2)' },
            { offset: 1, color: 'rgba(34, 197, 94, 0)' },
          ]),
        } : undefined,
        animation: animate,
        animationDuration: 1000,
      },
      {
        name: 'Created',
        data: data.map(d => d.created),
        type: 'line',
        smooth: true,
        symbol: 'none',
        lineStyle: { width: 2, color: '#3b82f6', type: 'dashed' },
        areaStyle: showArea ? {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(59, 130, 246, 0.15)' },
            { offset: 1, color: 'rgba(59, 130, 246, 0)' },
          ]),
        } : undefined,
        animation: animate,
        animationDuration: 1000,
      },
    ],
    legend: {
      data: ['Completed', 'Created'],
      bottom: 0,
      textStyle: { color: '#9ca3af', fontSize: 9 },
      itemWidth: 8,
      itemHeight: 6,
      itemGap: 12,
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#f3f4f6', fontSize: 11 },
    },
  }), [data, showArea, animate]);

  return (
    <BaseChart
      options={options as echarts.EChartsOption}
      className={cn('w-full h-full', className)}
    />
  );
};