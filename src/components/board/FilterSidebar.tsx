// src/components/board/FilterSidebar.tsx

import React, { useState } from 'react';
import { Filter, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { FilterBar, FilterState } from './FilterBar';
import { CollapseIcon } from '../sidebar-ui-engine/CollapseIcon';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  isExpanded = true,
  onToggleExpand,
}) => {
  const { isDarkMode } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const activeCount =
    filters.labels.length + filters.priorities.length +
    filters.columns.length + filters.types.length +
    (filters.search ? 1 : 0);

  return (
    <>
      {/* Mobile: Bottom Sheet */}
      <div className="lg:hidden">
        {/* Overlay */}
        {isMobileOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-300"
            onClick={() => setIsMobileOpen(false)}
          />
        )}

        {/* Bottom Sheet */}
        <div className={cn(
          'fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out',
          isMobileOpen ? 'translate-y-0' : 'translate-y-[calc(100%-3.5rem)]'
        )}>
          <div className={cn(
            'rounded-t-2xl border border-b-0 shadow-2xl',
            isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          )}>
            {/* Handle / Toggle Button */}
            <button
              onClick={() => setIsMobileOpen(!isMobileOpen)}
              className={cn(
                'w-full h-14 flex items-center justify-between px-4 py-3',
                'hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors',
                isMobileOpen && 'border-b border-gray-200 dark:border-gray-800'
              )}
            >
              <div className="flex absolute items-center gap-2">
                <Filter size={14} className="text-blue-500" />
                <span className="text-xs font-semibold">Filters</span>
                {activeCount > 0 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {activeCount}
                  </span>
                )}
              </div>
              <div className='m-auto'>
              <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mb-1" />
                
              </div>
            </button>

            {/* Content */}
            <div className={cn(
              'overflow-y-auto transition-all duration-300',
              isMobileOpen ? 'max-h-[70vh] opacity-100' : 'max-h-0 opacity-0'
            )}>
              <div className="p-3">
                <FilterBar 
                  filters={filters} 
                  onFilterChange={(newFilters) => {
                    onFilterChange(newFilters);
                  }} 
                  variant="mobile" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop: fixed right sidebar with toggle */}
      <div className={cn(
        'hidden lg:block fixed top-0 right-0 h-full z-30 transition-all duration-300',
        isExpanded ? 'w-72' : 'w-0'
      )}>
        {/* Toggle button */}
        <button
          onClick={onToggleExpand}
          className={cn(
            'absolute -left-8 top-4 p-1.5 rounded-l-lg border border-r-0 transition-colors',
            isDarkMode 
              ? 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700' 
              : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
          )}
        >
          <CollapseIcon className='rotate-180' size={16} />
        </button>

        {isExpanded && (
          <div className={cn(
            'h-full border-l overflow-y-auto',
            isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
          )}>
            {/* Header */}
            <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-200 dark:border-gray-800">
              <Filter size={16} className="text-blue-500" />
              <h3 className="font-semibold text-sm">Filters</h3>
              {activeCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {activeCount} active
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4">
              <FilterBar filters={filters} onFilterChange={onFilterChange} variant="sidebar" />
            </div>
          </div>
        )}
      </div>
    </>
  );
};

FilterSidebar.displayName = 'FilterSidebar';