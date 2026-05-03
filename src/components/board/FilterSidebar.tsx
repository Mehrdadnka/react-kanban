// ──── src/components/board/FilterSidebar.tsx ────

import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { FilterBar, FilterState } from './FilterBar';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
}) => {
  const { isDarkMode } = useApp();

  const activeCount =
    filters.labels.length + filters.priorities.length +
    filters.columns.length + filters.types.length +
    (filters.search ? 1 : 0);

  return (
    <>
      {/* ──── Mobile: static below header ──── */}
      <div className="lg:hidden">
        <div className={cn(
          'rounded-xl border mb-4',
          isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
        )}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-200 dark:border-gray-800">
            <Filter size={14} className="text-blue-500" />
            <span className="text-xs font-semibold">Filters</span>
            {activeCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                {activeCount}
              </span>
            )}
          </div>
          <div className="p-3">
            <FilterBar filters={filters} onFilterChange={onFilterChange} variant="mobile" />
          </div>
        </div>
      </div>

      {/* ──── Desktop: fixed right sidebar ──── */}
      <div className="hidden lg:block fixed top-0 right-0 h-full w-72 z-30">
        <div className={cn(
          'h-full border-l overflow-y-auto bg-transparent',
          isDarkMode ? 'border-gray-800' : 'border-gray-200'
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
      </div>
    </>
  );
};

FilterSidebar.displayName = 'FilterSidebar';