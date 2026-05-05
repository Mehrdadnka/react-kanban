import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { TaskCard } from './TaskCard';
import { Task } from '@/types/task.types';
import { cn } from '@/lib/utils';
import { AlertTriangle, Plus } from 'lucide-react';
import { IconButton } from '@radix-ui/themes';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  color: string;
  icon: React.ReactNode;
  wipLimit?: number;
  onClick?: () => void;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  color,
  icon,
  wipLimit,
  onClick
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isOverWip = wipLimit && tasks.length >= wipLimit;

  return (
    <div 
      ref={setNodeRef} 
      className="h-full lg:min-h-[600px] flex flex-col min-w-[280px] sm:min-w-[320px] lg:min-w-[350px] flex-1 max-w-[400px] xl:max-w-[450px]"
    >
      <Card className={cn(
        "flex-1 flex flex-col shadow-2xl h-full overflow-hidden",
        isOver && "ring-2 ring-blue-500 ring-opacity-50",
        isOverWip && "ring-2 ring-red-500 ring-opacity-50"
      )}>
        <CardHeader className="p-3 sm:p-4 border-b flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
              <span style={{ color }}>{icon}</span>
              <span className="truncate">{title}</span>
              <span className={cn(
                "text-xs sm:text-sm font-normal px-1.5 sm:px-2 py-0.5 rounded-full flex-shrink-0",
                isOverWip ? "bg-red-100 text-red-700" : "bg-white/20"
              )}>
                {tasks.length}{wipLimit && ` / ${wipLimit}`}
              </span>
            </CardTitle>
            {isOverWip && (
              <AlertTriangle size={16} className="text-red-500 flex-shrink-0" />
            )}
          </div>
        </CardHeader>
        <CardContent className="p-2 sm:p-3 flex-1 overflow-y-auto overflow-x-hidden">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick} 
              />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <div className={cn(
              'flex items-center justify-center flex-col h-full min-h-[500px]',
              'text-xs text-gray-400 dark:text-gray-600'
            )}>
              <IconButton
                variant="ghost"
                className={cn(
                  'hover:bg-gray-100 dark:hover:bg-gray-800',
                  'transition-all duration-200 group',
                  'w-10 h-10 sm:w-12 sm:h-12'
                )}
                onClick={onClick}
              >
                <Plus size={20} className="sm:size-24 group-hover:rotate-90 transition-transform duration-300" />
              </IconButton>
              Drop tasks here
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};