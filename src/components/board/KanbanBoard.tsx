// src/components/board/KanbanBoard.tsx

import React from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { IconButton } from '@radix-ui/themes';
import { Plus } from 'lucide-react';

import { Column } from './Column';
import { DndProvider } from '../../providers/DndProvider';
import { useApp } from '@/providers/AppProvider';
import { useTaskStore } from '@/stores/task.store';
import { COLUMN_ICONS } from '@/config/panel-icons.config';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';

const COLUMN_COLORS: Record<string, string> = {
  todo: 'text-blue-500',
  'in-progress': 'text-yellow-500',
  done: 'text-green-500',
};

const columns = Object.entries(COLUMN_ICONS).map(([id, config]) => {
  const Icon = config.icon;
  return {
    id,
    title: config.label,
    icon: <Icon size={18} />,
    color: COLUMN_COLORS[id] || 'text-gray-500',
  };
});

export const KanbanBoard: React.FC = () => {
  const { isDarkMode } = useApp();
  const { tasks } = useTaskStore();
  const { openCreateSidebar, openViewSidebar } = useTaskSidebarStore();

  const handleTaskClick = (task: Task) => {
    openViewSidebar(task);
  };

  const handleQuickAdd = () => {
    openCreateSidebar('todo');
  };

  const getColumnTasks = (columnId: string) => {
    return tasks.filter((task) => task.columnId === columnId);
  };

  return (
    <>
      <DndProvider columns={columns}>
        <header className="mb-6 flex items-center justify-between w-full">
          <h1 className="lg:text-3xl sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskFlow Board
          </h1>

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
                    onClick={handleQuickAdd}  // ← fix: wrapper function
                  >
                    <Plus
                      size={24}
                      className="group-hover:rotate-90 transition-transform duration-300"
                    />
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

        <main className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              icon={column.icon}
              title={column.title}
              color={column.color}
              tasks={getColumnTasks(column.id)}
              onTaskClick={handleTaskClick}
            />
          ))}
        </main>
      </DndProvider>
    </>
  );
};