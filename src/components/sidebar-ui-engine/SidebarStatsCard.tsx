import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SidebarStatCardProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  onClick: () => void;
}

export const SidebarStatsCard: React.FC<SidebarStatCardProps> = ({
  icon: Icon,
  label,
  value,
  color,
  bgColor,
  onClick,
}) => {
  const { isDarkMode } = useApp();

  return (
    <button
      onClick={onClick}
      className={cn(
        'p-4 rounded-xl transition-all duration-300',
        'hover:shadow-lg group cursor-pointer',
        'text-left h-full',
        'border border-transparent hover:border-gray-200 dark:hover:border-gray-700',
        bgColor,
        isDarkMode ? 'bg-opacity-20' : 'bg-opacity-40'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-lg transition-all duration-300 group-hover:scale-110', bgColor)}>
          <Icon size={20} className={color} />
        </div>
        <ArrowUpRight size={16} className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 text-gray-400" />
      </div>
      <div>
        <div className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-1">{value}</div>
        <div className={cn(
          'text-xs font-medium', 
          'uppercase tracking-wider',
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
           )}>{label}</div>
      </div>
    </button>
  );
};