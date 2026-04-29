import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  isDarkMode?: boolean;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, isDarkMode = false }) => {
  return (
    <nav className="flex items-center gap-1.5 px-6 py-3 border-b" aria-label="Breadcrumb">
      <ol className="flex items-center gap-1.5 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight 
                size={14} 
                className={cn(
                  'flex-shrink-0',
                  isDarkMode ? 'text-gray-600' : 'text-gray-400'
                )} 
              />
            )}
            {item.onClick ? (
              <button
                onClick={item.onClick}
                className={cn(
                  'hover:underline transition-colors',
                  isDarkMode 
                    ? 'text-gray-400 hover:text-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                )}
              >
                {item.label}
              </button>
            ) : (
              <span className={cn(
                index === items.length - 1
                  ? isDarkMode ? 'text-white font-medium' : 'text-gray-900 font-medium'
                  : isDarkMode ? 'text-gray-400' : 'text-gray-500'
              )}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};