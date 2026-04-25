import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/Card';
import { Badge } from '@/components/ui/badge/Badge';
import { Button } from '@/components/ui/button/Button';
import { GripVertical, Paperclip, Trash2 } from 'lucide-react';
import { Task } from '@/stores/task.store';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="mb-3">
      <Card className={cn(
        "shadow-sm hover:shadow-md transition-all",
        isDragging && "shadow-lg rotate-2 scale-105"
      )}>
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-1">
              <button
                {...attributes}
                {...listeners}
                className="cursor-grab active:cursor-grabbing"
              >
                <GripVertical size={18} className="text-gray-400" />
              </button>
              <CardTitle className="text-base font-medium">
                {task.title}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onDelete(task.id)}
            >
              <Trash2 size={16} />
            </Button>
          </div>
          {task.description && (
            <CardDescription className="text-sm mt-1 ml-6">
              {task.description}
            </CardDescription>
          )}
        </CardHeader>
        <CardFooter className="p-4 pt-2 flex justify-between">
          <Badge variant="secondary" className={cn("text-xs", priorityColors[task.priority])}>
            {task.priority}
          </Badge>
          {task.attachments && task.attachments.length > 0 && (
            <div className="flex items-center text-xs text-gray-500">
              <Paperclip size={14} className="mr-1" />
              {task.attachments.length}
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};