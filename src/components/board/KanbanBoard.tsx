import React from 'react';
import { Column } from './Column';
import { useTaskStore } from '@/stores/task.store';
import { TaskDialog } from './TaskDialog';
import { useUIStore } from '@/stores/ui.store';
import { KanbanDndProvider } from './KanbanDndProvider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { IconButton } from '@radix-ui/themes';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useApp } from '@/providers/AppProvider';

const columns = [
  { id: 'todo', title: '📋 Todo', color: 'bg-gray-100 dark:bg-gray-800' },
  { id: 'in-progress', title: '⚡ In progress', color: 'bg-blue-100 dark:bg-blue-900' },
  { id: 'done', title: '✅ Done', color: 'bg-green-100 dark:bg-green-900' },
];

export const KanbanBoard: React.FC = () => {
  const { isDarkMode } = useApp();
  const { tasks, deleteTask } = useTaskStore();
  const { openTaskDialog ,taskDialogOpen, selectedColumn, closeTaskDialog } = useUIStore();

  return (
    <>
      <KanbanDndProvider columns={columns}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={tasks.filter((task) => task.status === column.id)}
              onDeleteTask={deleteTask}
            />
          ))}
          {/* Logo/Add Button Area */}
          <div className="absolute top-2 right-20 flex flex-col items-center pt-4 pb-2 border-b border-transparent">
            <TooltipProvider>
              <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    variant='surface'
                    className={cn(
                      'mb-2 transition-all duration-200',
                      'hover:shadow-md group hover:scale-150',
                    )}
                    onClick={() => openTaskDialog()}
                  >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                  </IconButton>
                </Tooltip.Trigger>
                <Tooltip.Portal>
                  <Tooltip.Content
                    side="right"
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
        </div>
      </KanbanDndProvider>

      <TaskDialog
        open={taskDialogOpen}
        onOpenChange={(open) => {
          if (!open) closeTaskDialog();
        }}
        defaultStatus={selectedColumn as any}
      />
    </>
  );
};