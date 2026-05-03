// ──── src/components/board/KanbanBoard.tsx ────

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

export const KanbanBoard: React.FC = () => {
  const { isDarkMode } = useApp();
  const { tasks } = useTaskStore();
  const { columns } = useColumnStore();
  const { openCreateSidebar, openViewSidebar } = useTaskSidebarStore();
  const [showColumnManager, setShowColumnManager] = useState(false);
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

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

  const handleTaskClick = useCallback((task: Task) => {
    openViewSidebar(task);
  }, [openViewSidebar]);

  const handleQuickAdd = useCallback(() => {
    openCreateSidebar(sortedColumns[0]?.id || 'todo');
  }, [sortedColumns, openCreateSidebar]);

  const getColumnTasks = useCallback((columnId: string) => {
    return filteredTasks.filter(t => t.columnId === columnId);
  }, [filteredTasks]);

  return (
    <>
      <DndProvider columns={columnIds.map(id => ({ id }))}>
        <header className="mb-4 space-y-3">
          {/* Title row */}
          <div className="flex items-center justify-between w-full lg:w-[80%]">
            <div className="flex items-center gap-3">
              <h1 className="lg:text-3xl sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                TaskFlow Board
              </h1>
            </div>
            <div className="flex items-center justify-between gap-4">
              <TooltipProvider>
                <Tooltip.Root delayDuration={300}>
                  <Tooltip.Trigger asChild>
                    <IconButton
                      variant="ghost"
                      onClick={() => setShowColumnManager(true)}
                      className={cn(
                        'hover:bg-gray-100 dark:hover:bg-gray-800',
                        'transition-all duration-200 border-none hover:shadow-md group w-12 h-12',
                      )}
                    >
                      <Settings size={24} className="group-hover:rotate-90 transition-transform duration-300" />
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
                        'transition-all duration-200 hover:shadow-md group w-12 h-12',
                        // 'bg-white dark:bg-gray-800 hover:scale-110'
                      )}
                      onClick={handleQuickAdd}
                    >
                      <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
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
        {/* Filter bar */}
        <FilterSidebar filters={filters} onFilterChange={setFilters} />

        <main className="flex gap-6  h-[calc(100vh-100px)] overflow-x-auto pb-4 lg:mr-72">
          {sortedColumns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              icon={resolveIcon(column.icon)}
              title={column.title}
              color={column.color}
              wipLimit={column.wipLimit}
              tasks={getColumnTasks(column.id)}
              onTaskClick={handleTaskClick}
            />
          ))}
        </main>
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