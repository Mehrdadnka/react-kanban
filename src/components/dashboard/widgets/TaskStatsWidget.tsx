import React from 'react';
import { useTaskStore } from '@/stores/task.store';
import { Widget } from '../Widget';
import { CheckSquare, Clock, CheckCircle2, ListTodo, ArrowUpRight, TrendingUp, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useDashboardSidebarStore } from '@/stores/dashboard-sidebar.store';
import type { TaskFilterType } from '@/stores/dashboard-sidebar.store';

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
  const tasks = useTaskStore(state => state.tasks);
  const { isDarkMode } = useApp();
  const { openSidebar } = useDashboardSidebarStore();

  const filteredTasks = {
    all: tasks,
    'in-progress': tasks.filter(t => t.status === 'in-progress'),
    done: tasks.filter(t => t.status === 'done'),
    todo: tasks.filter(t => t.status === 'todo'),
  };

  const stats = [
    {
      label: 'Total Tasks',
      value: tasks.length,
      icon: ListTodo,
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/30',
      borderColor: 'border-blue-200 dark:border-blue-800',
      filter: 'all' as TaskFilterType,
    },
    {
      label: 'In Progress',
      value: tasks.filter(t => t.status === 'in-progress').length,
      icon: Clock,
      color: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/30',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      filter: 'in-progress' as TaskFilterType,
    },
    {
      label: 'Completed',
      value: tasks.filter(t => t.status === 'done').length,
      icon: CheckCircle2,
      color: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/30',
      borderColor: 'border-green-200 dark:border-green-800',
      filter: 'done' as TaskFilterType,
    },
    {
      label: 'Todo',
      value: tasks.filter(t => t.status === 'todo').length,
      icon: CheckSquare,
      color: 'text-gray-600 dark:text-gray-400',
      bgColor: 'bg-gray-50 dark:bg-gray-700/30',
      borderColor: 'border-gray-200 dark:border-gray-700',
      filter: 'todo' as TaskFilterType,
    },
  ];

  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.status === 'done').length / tasks.length) * 100)
    : 0;

  const handleStatCardClick = (filter: TaskFilterType, e: React.MouseEvent) => {
    e.stopPropagation();
    
    const widgetType = filter === 'all' ? 'total-tasks' :
                       filter === 'in-progress' ? 'in-progress' :
                       filter === 'done' ? 'completed' : 'todo';

    openSidebar(widgetType, {
      totalTasks: tasks.length,
      inProgressCount: tasks.filter(t => t.status === 'in-progress').length,
      completedCount: tasks.filter(t => t.status === 'done').length,
      todoCount: tasks.filter(t => t.status === 'todo').length,
      completionRate,
      recentTasks: [...tasks]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 5),
      priorityData: {
        high: tasks.filter(t => t.priority === 'high').length,
        medium: tasks.filter(t => t.priority === 'medium').length,
        low: tasks.filter(t => t.priority === 'low').length,
      },
      filteredTasks: filteredTasks[filter],
      activeFilter: filter,
    });
  };

  return (
    <Widget 
      title="Task Overview" 
      icon={<CheckSquare size={16} />}
      fullHeight
    >
      <div className="flex flex-col h-full gap-4 overflow-x-hidden">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              color={stat.color}
              bgColor={stat.bgColor}
              borderColor={stat.borderColor}
              isDarkMode={isDarkMode}
              onClick={(e) => handleStatCardClick(stat.filter, e)}
            />
          ))}
        </div>
        
        {/* Progress Section */}
        <div className="flex-1 rounded-xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-4 border border-blue-100 dark:border-blue-800">
          <div className="flex items-center gap-2 mb-3">
            <Activity size={18} className="text-blue-600 dark:text-blue-400" />
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300">
              Progress Overview
            </h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600 dark:text-gray-400">Completion Rate</span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">{completionRate}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
                <div 
                  className="h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <TrendingUp size={16} className="mx-auto mb-1 text-green-500" />
                <div className="text-xs text-gray-500">Completed</div>
                <div className="text-lg font-bold text-green-600">
                  {tasks.filter(t => t.status === 'done').length}
                </div>
              </div>
              <div className="text-center p-3 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <Clock size={16} className="mx-auto mb-1 text-yellow-500" />
                <div className="text-xs text-gray-500">Active</div>
                <div className="text-lg font-bold text-yellow-600">
                  {tasks.filter(t => t.status === 'in-progress').length}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Widget>
  );
};