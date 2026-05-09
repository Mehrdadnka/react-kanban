import React, { useState, useCallback, useMemo } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { IconButton } from '@radix-ui/themes';
import { Plus, Settings, ClipboardList, Zap, CheckCircle2, Circle, HelpCircle } from 'lucide-react';
import { Column } from './Column';
import { DndProvider } from '../../providers/DndProvider';
import { useApp } from '@/providers/AppProvider';
import { useTaskStore } from '@/stores/task.store';
import { useColumnStore } from '@/stores/column.store';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { ColumnManager } from '@/features/ColumnManager/ColumnManager';
import { FilterBar, FilterState } from './FilterBar';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { FilterSidebar } from './FilterSidebar';

// Icon Resolver
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  ClipboardList, Zap, CheckCircle2, Circle, HelpCircle,
};
const resolveIcon = (iconName: string, size: number = 18) => {
  const Icon = ICON_MAP[iconName] || HelpCircle;
  return <Icon size={size} />;
};

// Default filter state
const DEFAULT_FILTERS: FilterState = {
  labels: [],
  priorities: [],
  columns: [],
  types: [],
  search: '',
};

interface KanbanBoardProps {
  boardId: string;
}

export const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId }) => {
  const { isDarkMode } = useApp();
  const { tasks } = useTaskStore();
  const { columns } = useColumnStore();
  const { openCreateSidebar, openViewSidebar } = useTaskSidebarStore();
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  
  const boardTasks = useMemo(() => {
    return tasks.filter(t => t.boardId === boardId);
  }, [tasks, boardId]);

  const getColumnTasks = useCallback((columnId: string) => {
    return boardTasks
      .filter(t => t.columnId === columnId)
      .sort((a, b) => a.order - b.order);
  }, [boardTasks]);

  const sortedColumns = useMemo(() => [...columns].sort((a, b) => a.order - b.order), [columns]);
  const columnIds = useMemo(() => sortedColumns.map(c => c.id), [sortedColumns]);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    let result = tasks;

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(q) ||
        t.description?.toLowerCase().includes(q)
      );
    }
    if (filters.priorities.length > 0) {
      result = result.filter(t => filters.priorities.includes(t.priority));
    }
    if (filters.labels.length > 0) {
      result = result.filter(t => t.labels.some(l => filters.labels.includes(l)));
    }
    if (filters.columns.length > 0) {
      result = result.filter(t => filters.columns.includes(t.columnId));
    }
    if (filters.types.length > 0) {
      result = result.filter(t => filters.types.includes(t.type));
    }

    return result;
  }, [tasks, filters]);
  const [isFilterExpanded, setIsFilterExpanded] = useState<boolean>(false);

  const handleTaskClick = useCallback((task: Task) => {
    openViewSidebar(task);
  }, [openViewSidebar]);

  const handleQuickAdd = useCallback(() => {
    openCreateSidebar({
      defaultColumnId: sortedColumns[0]?.id || 'todo'
    });
  }, [sortedColumns, openCreateSidebar]);

  return (
    <>
      <DndProvider columns={columnIds.map(id => ({ id }))}>
        {/* Filter bar - responsive width */}
        <FilterSidebar 
          filters={filters} 
          onFilterChange={setFilters} 
          isExpanded={isFilterExpanded}
          onToggleExpand={() => setIsFilterExpanded(!isFilterExpanded)}
        />
        <div 
          className={cn(
            'transition-all duration-300',
            'w-full mt-4',
            'md:max-w-[calc(100%-5rem)]', 
            isFilterExpanded ? 'md:max-w-[calc(100%-18rem)]' : 'md:max-w-[calc(100%-5rem)]',
            'lg:max-w-[calc(100%-5rem)]',
            isFilterExpanded ? 'lg:max-w-[calc(100%-18rem)]' : 'lg:max-w-[calc(100%-5rem)]',
            'px-2 sm:px-3 md:px-4'
          )}
        >
        <header className="mb-4 space-y-3">
          {/* Title row - responsive */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow Board
              </h1>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 self-end sm:self-auto">
              <TooltipProvider>
                <Tooltip.Root delayDuration={300}>
                  <Tooltip.Trigger asChild>
                    <IconButton
                      variant="ghost"
                      onClick={() => setShowColumnManager(true)}
                      className={cn(
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'transition-all duration-200 border-none hover:shadow-md group',
                        'w-10 h-10 md:w-12 md:h-12'
                      )}
                    >
                      <Settings className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </IconButton>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content side="bottom" sideOffset={8} className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                    )}>
                      Manage Columns
                      <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>

                <Tooltip.Root delayDuration={300}>
                  <Tooltip.Trigger asChild>
                    <IconButton
                      variant="ghost"
                      className={cn(
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'transition-all duration-200 hover:shadow-md group',
                        'w-10 h-10 md:w-12 md:h-12'
                      )}
                      onClick={handleQuickAdd}
                    >
                      <Plus className="w-5 h-5 md:w-6 md:h-6 group-hover:rotate-90 transition-transform duration-300" />
                    </IconButton>
                  </Tooltip.Trigger>
                  <Tooltip.Portal>
                    <Tooltip.Content side="bottom" sideOffset={10} className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                      isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'
                    )}>
                      Quick Add
                      <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                    </Tooltip.Content>
                  </Tooltip.Portal>
                </Tooltip.Root>
              </TooltipProvider>
            </div>
          </div>
        </header>

        <main className={cn(
          'flex flex-col gap-4',
          'md:flex-row md:gap-4',
          'lg:gap-6',
          'lg:h-[calc(100vh-120px)] sm:h-[calc(100vh-110px)] md:h-[calc(100vh-100px)]',
          'overflow-x-auto pb-4'
        )}>
          {sortedColumns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              icon={resolveIcon(column.icon)}
              title={column.title}
              color={column.color}
              wipLimit={column.wipLimit}
              tasks={getColumnTasks(column.id)}
              onClick={handleQuickAdd}
              onTaskClick={handleTaskClick}
            />
          ))}
        </main>
        </div>
      </DndProvider>

      {showColumnManager && (
        <>
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" onClick={() => setShowColumnManager(false)} />
          <ColumnManager isOpen={showColumnManager} onClose={() => setShowColumnManager(false)} />
        </>
      )}
    </>
  );
};