import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/Card';
import { Badge } from '@/components/ui/badge/Badge';
import { Eye, GripVertical, Paperclip, Trash2 } from 'lucide-react';
import { Task } from '@/stores/task.store';
import { cn } from '@/lib/utils';
import { IconButton } from '@radix-ui/themes';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

const priorityColors = {
  low: 'bg-green-900 dark:bg-green-900 text-green-100',
  medium: 'bg-yellow-900 dark:bg-yellow-900 text-yellow-100',
  high: 'bg-red-900 dark:bg-red-900 text-red-100',
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
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

  const handleViewClick = () => {
    onClick?.(task)
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="mb-3"
    >
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
                onClick={(e) => e.stopPropagation()}

              >
                <GripVertical size={18} className="text-gray-400" />
              </button>
              <CardTitle className="text-base font-medium">
                {task.title}
              </CardTitle>
            </div>
            <IconButton
              variant="ghost"
              size="2"
              className={cn(
                "h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity",
                "hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400"
              )}
              onClick={handleViewClick}
              title="View Details"
            >
              <Eye size={16} />
            </IconButton>
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