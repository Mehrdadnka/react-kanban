// src/components/board/KanbanBoard.tsx

import React, { useState, useCallback } from 'react';
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
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { ColumnManager } from '@/features/ColumnManager/ColumnManager';

// ──── Icon Resolver ────
const ICON_MAP: Record<string, React.FC<{ size?: number; className?: string }>> = {
  ClipboardList, Zap, CheckCircle2, Circle, HelpCircle,
};

const resolveIcon = (iconName: string, size: number = 18) => {
  const Icon = ICON_MAP[iconName] || HelpCircle;
  return <Icon size={size} />;
};

// ──── Component ────

export const KanbanBoard: React.FC = () => {
  const { isDarkMode } = useApp();
  const { tasks } = useTaskStore();
  const { columns } = useColumnStore();
  const { openCreateSidebar, openViewSidebar } = useTaskSidebarStore();
  const [showColumnManager, setShowColumnManager] = useState(false);

  const sortedColumns = [...columns].sort((a, b) => a.order - b.order);
  const columnIds = sortedColumns.map(c => c.id);

  const handleTaskClick = useCallback((task: Task) => {
    openViewSidebar(task);
  }, [openViewSidebar]);

  const handleQuickAdd = useCallback(() => {
    const firstColumn = sortedColumns[0];
    openCreateSidebar(firstColumn?.id || 'todo');
  }, [sortedColumns, openCreateSidebar]);

  const getColumnTasks = useCallback((columnId: string) => {
    return tasks.filter((task) => task.columnId === columnId);
  }, [tasks]);

  return (
    <>
      <DndProvider columns={columnIds.map(id => ({ id }))}>
        <header className="mb-6 flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <h1 className="lg:text-3xl sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TaskFlow Board
            </h1>
            <TooltipProvider>
              <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    variant="ghost"
                    size="2"
                    onClick={() => setShowColumnManager(true)}
                    className="hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <Settings size={18} />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={8}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    )}
                  >
                    Manage Columns
                    <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </TooltipProvider>
          </div>

          <div className="z-50 flex flex-col items-center">
            <TooltipProvider>
              <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    variant="surface"
                    className={cn(
                      'transition-all duration-200',
                      'hover:shadow-md group',
                      'w-12 h-12',
                      'shadow-md hover:shadow-lg',
                      'bg-white dark:bg-gray-800',
                      'hover:scale-110'
                    )}
                    onClick={handleQuickAdd}
                  >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  </IconButton>
                </Tooltip.Trigger>

                <Tooltip.Portal>
                  <Tooltip.Content
                    side="bottom"
                    sideOffset={10}
                    className={cn(
                      'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
                      isDarkMode
                        ? 'bg-gray-800 border-gray-700 text-gray-200'
                        : 'bg-white border-gray-200 text-gray-700'
                    )}
                  >
                    Quick Add
                    <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                  </Tooltip.Content>
                </Tooltip.Portal>
              </Tooltip.Root>
            </TooltipProvider>
          </div>
        </header>

        <main className="flex gap-6 h-[calc(100vh-120px)] overflow-x-auto pb-4">
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

      {/* Column Manager Modal */}
      <ColumnManager
        isOpen={showColumnManager} 
        onClose={() => setShowColumnManager(false)} 
      />
      
      {/* Backdrop */}
      {showColumnManager && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
          onClick={() => setShowColumnManager(false)}
        />
      )}
    </>
  );
};