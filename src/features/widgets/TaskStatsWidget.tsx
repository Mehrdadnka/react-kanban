import React from 'react';
import { useTaskStore } from '@/stores/task.store';
import { Widget } from '../Widget';
import { CheckCircle2, ListTodo, ClipboardList, ArrowUpRight, TrendingUp, Activity, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useDashboardSidebarStore } from '@/stores/sidebar-engine/dashboard-sidebar.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import type { TaskFilterType } from '@/stores/sidebar-engine/dashboard-sidebar.store';
import { ActivityHeatmap } from './ActivityHeatmap';
import { WIDGET_ICONS } from '@/config/panel-icons.config';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
  onClick: (e: React.MouseEvent) => void;
  isDarkMode: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  label, 
  value, 
  color, 
  bgColor, 
  borderColor, 
  onClick,
  isDarkMode 
}) => (
  <button
    onClick={onClick}
    className={cn(
      'p-4 rounded-xl border transition-all duration-300',
      'hover:shadow-lg group cursor-pointer',
      'text-left h-full',
      borderColor,
      bgColor,
      isDarkMode ? 'bg-opacity-20' : 'bg-opacity-40'
    )}
  >
    <div className="flex items-start justify-between mb-3">
      <div className={cn('p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110', bgColor)}>
        <Icon size={20} className={color} />
      </div>
      <ArrowUpRight 
        size={16} 
        className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-gray-400" 
      />
    </div>
    <div>
      <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">
        {value}
      </div>
      <div className="text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
        {label}
      </div>
    </div>
  </button>
);

export const TaskStatsWidget: React.FC = () => {

  const widgetConfig = WIDGET_ICONS['task-overview'];
  const Icon = widgetConfig.icon;
  const label = widgetConfig.label;

  return (

  <>
    <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/90 dark:to-purple-900/20 p-3 sm:p-4 border border-blue-100 dark:border-blue-800 min-h-0 overflow-hidden flex flex-col">
  {/* Header */}
  <div className="flex w-full items-center gap-2 mb-3 sm:mb-4 flex-shrink-0">
    <Activity size={12} className="text-blue-600 dark:text-blue-400 sm:size-[18px]" />
    <h4 className="text-xs sm:text-sm font-semibold text-blue-900 dark:text-blue-300">
      Activity Overview
    </h4>
  </div>
  
  {/* Heatmap - scrollable container */}
  <div className="flex-1 min-h-0  flex justify-center overflow-x-auto overflow-y-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 -mx-1 px-1">
    <div className=' flex justify-center'>
      <ActivityHeatmap />
    </div>
  </div>

</div>
</>
  );
};