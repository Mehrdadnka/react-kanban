import React, { useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';
import { EChartsOption } from 'echarts';

interface PriorityData {
  label: string;
  value: number;
  color?: string;
}

interface PriorityBreakdownProps {
  data: PriorityData[];
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showValues?: boolean;
  animate?: boolean;
  className?: string;
}

const DEFAULT_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

export const PriorityBreakdown: React.FC<PriorityBreakdownProps> = ({
  data,
  orientation = 'horizontal',
  showLabels = true,
  showValues = true,
  animate = true,
  className,
}) => {
  const options = useMemo(() => {
    const enriched = data.map((d, i) => ({
      ...d,
      color: d.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
    }));

    const maxValue = Math.max(...data.map(d => d.value), 1);

    return {
      backgroundColor: 'transparent',
      grid: {
        top: 5,
        right: showValues ? 40 : 10,
        bottom: 5,
        left: showLabels ? 70 : 10,
      },
      xAxis: orientation === 'horizontal' 
        ? {
            type: 'value',
            show: false,
            max: maxValue * 1.3,
          }
        : {
            type: 'category',
            data: enriched.map(d => d.label),
            show: showLabels,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#9ca3af', fontSize: 10 },
          },
      yAxis: orientation === 'horizontal'
        ? {
            type: 'category',
            data: enriched.map(d => d.label),
            show: showLabels,
            axisLine: { show: false },
            axisTick: { show: false },
            axisLabel: { color: '#9ca3af', fontSize: 10 },
            inverse: true,
          }
        : {
            type: 'value',
            show: false,
            max: maxValue * 1.3,
          },
      series: [{
        type: 'bar',
        data: enriched.map(d => ({
          value: d.value,
          itemStyle: {
            color: d.color,
            borderRadius: orientation === 'horizontal' ? [0, 3, 3, 0] : [3, 3, 0, 0],
          },
        })),
        barWidth: '50%',
        animation: animate,
        animationDuration: 600,
        animationDelay: (idx: number) => idx * 50,
        label: {
          show: showValues,
          position: orientation === 'horizontal' ? 'right' : 'top',
          color: '#d1d5db',
          fontSize: 10,
          fontWeight: 'bold',
          formatter: '{c}',
          distance: 4,
        },
      }],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#1f2937',
        borderColor: '#374151',
        textStyle: { color: '#f3f4f6', fontSize: 11 },
      },
    };
  }, [data, orientation, showLabels, showValues, animate]);

  return (
    <BaseChart
      options={options as EChartsOption}
      className={cn('w-full h-full', className)}
    />
  );
};