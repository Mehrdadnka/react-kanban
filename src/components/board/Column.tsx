import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { TaskCard } from './TaskCard';
import { Task } from '@/stores/task.store';
import { cn } from '@/lib/utils';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  color: string;
  icon: React.ReactNode
}

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  color,
  icon
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div ref={setNodeRef} className="h-auto flex flex-col">
      <Card className={cn(
        "flex-1 flex flex-col h-full overflow-hidden",
        isOver && "ring-2 ring-blue-500 ring-opacity-50"
      )}>
        <CardHeader className={cn("p-4 border-b", color)}>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              {title}
              <span className="text-sm font-normal bg-white/20 px-2 py-0.5 rounded-full">
                {tasks.length}
              </span>
            </CardTitle>
            {icon}
          </div>
        </CardHeader>
        <CardContent className="p-3 flex-1 overflow-y-auto overflow-x-hidden">
          <SortableContext items={tasks} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onClick={onTaskClick} 
              />
            ))}
          </SortableContext>
        </CardContent>
      </Card>
    </div>
  );
};