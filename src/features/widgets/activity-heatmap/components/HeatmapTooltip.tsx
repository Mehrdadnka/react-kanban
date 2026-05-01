import React from 'react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useHeatmapStore } from '../store/heatmap.store';
import { formatTooltipDate } from '../engine/heatmap-calculations';

export const HeatmapTooltip: React.FC = () => {
  const { isDarkMode } = useApp();
  const tooltipData = useHeatmapStore(s => s.tooltipData);
  const tooltipRef = React.useRef<HTMLDivElement>(null);

  if (!tooltipData) return null;

  return (
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
        {/* Arrow - Top */}
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
        
        {/* Content */}
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
        
        {/* Arrow - Bottom */}
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
  );
};