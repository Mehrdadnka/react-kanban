import React from 'react';
import { useTaskStore } from '@/stores/task.store';
import { Widget } from '../Widget';
import { Flag, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const priorityConfig = {
  high: {
    label: 'High Priority',
    color: 'from-red-500 to-red-600',
    bgBar: 'bg-red-500',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: AlertTriangle,
  },
  medium: {
    label: 'Medium Priority',
    color: 'from-yellow-500 to-yellow-600',
    bgBar: 'bg-yellow-500',
    textColor: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    icon: Flag,
  },
  low: {
    label: 'Low Priority',
    color: 'from-green-500 to-green-600',
    bgBar: 'bg-green-500',
    textColor: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-900/20',
    borderColor: 'border-green-200 dark:border-green-800',
    icon: Flag,
  },
};

export const PriorityBreakdownWidget: React.FC = () => {
  const tasks = useTaskStore(state => state.tasks);
  
  const getPriorityCount = (priority: 'high' | 'medium' | 'low') => 
    tasks.filter(t => t.priority === priority).length;

  const total = tasks.length;
  const highCount = getPriorityCount('high');
  
  const priorityData = Object.entries(priorityConfig).map(([key, config]) => {
    const count = getPriorityCount(key as 'high' | 'medium' | 'low');
    const percentage = total > 0 ? (count / total) * 100 : 0;
    
    return {
      ...config,
      key,
      count,
      percentage,
      Icon: config.icon,
    };
  });

  return (
    <Widget 
      title="Priorities" 
      icon={<Flag size={16} />}
      className="lg:max-h-[50%]"
    >
      <div className="space-y-3">
        {priorityData.map((item) => (
          <div key={item.key} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <item.Icon size={16} className={item.textColor} />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {item.count}
                </span>
                <span className="text-xs text-gray-400">
                  ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r transition-all duration-500',
                  item.color
                )}
                style={{ width: `${Math.max(item.percentage, 2)}%` }}
              />
            </div>
          </div>
        ))}
        
        {highCount > 0 && (
          <div className={cn(
            'mt-3 p-3 rounded-lg border-l-4 border-red-500',
            'bg-red-50 dark:bg-red-900/20'
          )}>
            <div className="flex items-center gap-2 text-sm">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="font-medium text-red-700 dark:text-red-300">
                {highCount} high priority task{highCount > 1 ? 's' : ''} need{highCount === 1 ? 's' : ''} attention
              </span>
            </div>
          </div>
        )}
        
        {total === 0 && (
          <div className="text-center py-4 text-gray-400">
            <Flag size={24} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks to prioritize</p>
          </div>
        )}
      </div>
    </Widget>
  );
};