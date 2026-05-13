import React, { useMemo } from 'react';
import { BaseChart } from './BaseChart';
import { cn } from '@/lib/utils';
import { EChartsOption } from 'echarts';

interface SunburstNode {
  name: string;
  value?: number;
  children?: SunburstNode[];
}

interface LabelSunburstProps {
  data: SunburstNode[];
  showLabels?: boolean;
  animate?: boolean;
  className?: string;
}

export const LabelSunburst: React.FC<LabelSunburstProps> = ({
  data,
  showLabels = true,
  animate = true,
  className,
}) => {
  const options = useMemo(() => ({
    backgroundColor: 'transparent',
    series: [{
      type: 'sunburst',
      data,
      radius: ['0%', '70%'],
      center: ['50%', '50%'],
      itemStyle: {
        borderWidth: 1,
        borderColor: '#1f2937',
      },
      label: {
        show: showLabels,
        rotate: 'radial',
        fontSize: 8,
        color: '#d1d5db',
        minAngle: 20,
      },
      emphasis: {
        label: { show: true, fontSize: 12, fontWeight: 'bold' },
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0,0,0,0.5)' },
      },
      animation: animate,
      animationDuration: 1200,
    }],
    tooltip: {
      trigger: 'item',
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      textStyle: { color: '#f3f4f6', fontSize: 11 },
    },
  }), [data, showLabels, animate]);

  return (
    <BaseChart
      options={options as EChartsOption}
      className={cn('w-full h-full', className)}
    />
  );
};