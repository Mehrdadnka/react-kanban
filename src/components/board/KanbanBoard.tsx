import React from 'react';
import { Column } from './Column';
import { useTaskStore } from '@/stores/task.store';
import { DndProvider } from '../../providers/DndProvider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { TooltipProvider } from '@radix-ui/react-tooltip';
import { IconButton } from '@radix-ui/themes';
import { cn } from '@/lib/utils';
import { CheckCircle2, ClipboardList, Plus, Zap } from 'lucide-react';
import { useApp } from '@/providers/AppProvider';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';

const columns = [
  { id: 'todo', title: 'Todo', icon: <ClipboardList />,color: 'text-blue-500' },
  { id: 'in-progress', title: 'In progress', icon: <Zap />, color: 'text-yellow-500' },
  { id: 'done', title: 'Done', icon: <CheckCircle2 />, color: 'text-green-500' },
];

export const KanbanBoard: React.FC = () => {
  const { isDarkMode } = useApp();
  const { tasks } = useTaskStore();
  const { openCreateSidebar, openViewSidebar } = useTaskSidebarStore();

  return (
    <>
      <DndProvider columns={columns}>
        <div className="mb-6 flex items-center justify-between w-full">
          <h1 className="lg:text-3xl sm:text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            TaskFlow Board
          </h1>
          {/* Action Button */}
          <div className="z-50 flex flex-col items-center">
            <TooltipProvider>
              <Tooltip.Root delayDuration={300}>
                <Tooltip.Trigger asChild>
                  <IconButton
                    variant='surface'
                    className={cn(
                      'transition-all duration-200',
                      'hover:shadow-md group',
                      'w-12 h-12',
                      'shadow-md hover:shadow-lg',
                      'bg-white dark:bg-gray-800',
                      'hover:scale-110',
                    )}
                    onClick={() => openCreateSidebar()}
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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-120px)]">
          {columns.map((column) => (
            <Column
              key={column.id}
              id={column.id}
              icon={column.icon}
              title={column.title}
              color={column.color}
              tasks={tasks.filter((task) => task.status === column.id)}
              onTaskClick={(task) => openViewSidebar(task)}
            />
          ))}
        </div>
      </DndProvider>
    </>
  );
};