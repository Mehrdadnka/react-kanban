// src/components/board/Column.tsx

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card/Card';
import { TaskCard } from './TaskCard';
import { Task } from '@/types/task.types';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  color: string;
  icon: React.ReactNode;
  wipLimit?: number;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  title,
  tasks,
  onTaskClick,
  color,
  icon,
  wipLimit,
}) => {
  const { setNodeRef, isOver } = useDroppable({ id });
  const isOverWip = wipLimit && tasks.length >= wipLimit;

  return (
    <div ref={setNodeRef} className="h-auto flex flex-col min-w-[300px] flex-1">
      <Card className={cn(
        "flex-1 flex flex-col h-full overflow-hidden",
        isOver && "ring-2 ring-blue-500 ring-opacity-50",
        isOverWip && "ring-2 ring-red-500 ring-opacity-50"
      )}>
        <CardHeader className="p-4 border-b">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <span style={{ color }}>{icon}</span>
              {title}
              <span className={cn(
                "text-sm font-normal px-2 py-0.5 rounded-full",
                isOverWip ? "bg-red-100 text-red-700" : "bg-white/20"
              )}>
                {tasks.length}{wipLimit && ` / ${wipLimit}`}
              </span>
            </CardTitle>
            {isOverWip && (
              <AlertTriangle size={16} className="text-red-500" />
            )}
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