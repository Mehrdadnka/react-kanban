// components/board/FilterSidebar.tsx
import React, { useState } from 'react';
import { Filter, ChevronUp, Home, ChevronRight, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { Board, useBoardStore } from '@/stores/board.store';
import { FilterBar, FilterState } from './FilterBar';
import { CollapseIcon } from '../sidebar-ui-engine/CollapseIcon';
import { Separator } from '../ui/separator/Separator';
import { BoardAnalyticsCarousel } from './BoardAnalyticsCarousel';

interface FilterSidebarProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
  handleBackToBoards?: () => void;
  activeBoard?: Board;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  filters,
  onFilterChange,
  isExpanded = true,
  onToggleExpand,
  activeBoard,
  handleBackToBoards,
}) => {
  const { isDarkMode } = useApp();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const { activeBoardId } = useBoardStore();
  
  
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
              <Separator isDarkMode={isDarkMode} />
              <div className='flex m-auto items-start justify-center'>
                <BoardAnalyticsCarousel boardId={activeBoardId} />
              </div>
              <div className='m-auto'>
                <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-gray-600 mb-1" />
              </div>
              
              {/* Mobile Breadcrumb */}
              {activeBoard && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleBackToBoards();
                  }}
                  className="absolute right-4 flex items-center gap-1 text-xs text-blue-500"
                >
                  <ArrowLeft size={12} />
                  Back
                </button>
              )}
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
            'h-full border-l flex flex-col',
            isDarkMode ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
          )}>
            {/* ====== BREADCRUMB HEADER ====== */}
            {activeBoard && (
              <div className={cn(
                'flex-shrink-0 px-4 pt-4 pb-3 border-b',
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              )}>
                <button
                  onClick={handleBackToBoards}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium',
                    'transition-all duration-200',
                    'hover:bg-gray-100 dark:hover:bg-gray-800',
                    isDarkMode 
                      ? 'text-gray-400 hover:text-gray-200' 
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  <ArrowLeft size={14} />
                  <Home size={14} />
                  <span>All Boards</span>
                  <ChevronRight size={12} className="ml-auto text-gray-400" />
                  <div className="flex items-center gap-1.5">
                    <div 
                      className="w-3 h-3 rounded-sm flex-shrink-0"
                      style={{ backgroundColor: activeBoard.color }}
                    />
                    <span className="max-w-[120px] truncate font-semibold">
                      {activeBoard.title}
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* ====== FILTER HEADER ====== */}
            <div className={cn(
              'flex-shrink-0 flex items-center gap-2 px-5 py-3',
              !activeBoard && 'border-b border-gray-200 dark:border-gray-800'
            )}>
              <Filter size={16} className="text-blue-500" />
              <h3 className="font-semibold text-sm">Filters</h3>
              {activeCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                  {activeCount}
                </span>
              )}
            </div>

            {/* ====== FILTER CONTENT ====== */}
            <div className="flex-1 overflow-y-auto p-4">
              <FilterBar filters={filters} onFilterChange={onFilterChange} variant="sidebar" />
            </div>
            <Separator isDarkMode={isDarkMode} />
            <div className='flex w-64 m-auto items-start justify-center'>
              <BoardAnalyticsCarousel boardId={activeBoardId} />
            </div>

            {/* ====== BOARD QUICK INFO (Optional) ====== */}
            {activeBoard && (
              <div className={cn(
                'flex-shrink-0 p-4 border-t',
                isDarkMode ? 'border-gray-800' : 'border-gray-200'
              )}>
                <div className={cn(
                  'rounded-lg p-3',
                  isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
                )}>
                  <div className="flex items-center gap-2 mb-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: activeBoard.color }}
                    />
                    <span className="text-xs font-medium">{activeBoard.title}</span>
                  </div>
                  {activeBoard.description && (
                    <p className="text-[10px] text-gray-500 line-clamp-2">
                      {activeBoard.description}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

FilterSidebar.displayName = 'FilterSidebar';