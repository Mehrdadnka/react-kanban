import React, { useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';
import { EChartsOption } from 'echarts';

interface TaskProgressRingProps {
  completed: number;
  total: number;
  color?: string;
  trackColor?: string;
  lineWidth?: number;
  showLabel?: boolean;
  labelFormat?: 'percent' | 'fraction' | 'custom';
  customLabel?: string;
  animate?: boolean;
  className?: string;
}

export const TaskProgressRing: React.FC<TaskProgressRingProps> = ({
  completed,
  total,
  color = '#22c55e',
  trackColor = '#1f2937',
  lineWidth = 10,
  showLabel = true,
  labelFormat = 'percent',
  customLabel,
  animate = true,
  className,
}) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const options = useMemo(() => {
    let labelText = '';
    if (showLabel) {
      if (labelFormat === 'percent') labelText = `${percentage}%`;
      else if (labelFormat === 'fraction') labelText = `${completed}/${total}`;
      else if (customLabel) labelText = customLabel;
    }

    return {
      backgroundColor: 'transparent',
      series: [{
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        center: ['50%', '52%'],
        radius: '85%',
        min: 0,
        max: 100,
        splitNumber: 10,
        progress: {
          show: true,
          width: lineWidth,
          itemStyle: { color },
        },
        axisLine: {
          lineStyle: {
            width: lineWidth,
            color: [[1, trackColor]],
          },
        },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        pointer: { show: false },
        detail: {
          valueAnimation: animate,
          formatter: labelText,
          fontSize: 14,
          fontWeight: 'bold',
          color: '#e5e7eb',
          offsetCenter: [0, '40%'],
        },
        title: {
          show: false,
        },
        data: [{ value: percentage }],
        animation: animate,
        animationDuration: 1500,
        animationEasing: 'cubicInOut',
      }],
    };
  }, [percentage, color, trackColor, lineWidth, showLabel, labelFormat, customLabel, animate, completed, total]);

  return (
    <BaseChart
      options={options as EChartsOption}
      className={cn('w-full h-full', className)}
    />
  );
};