import React, { useState, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Eye, GripVertical, Paperclip, ChevronDown, ChevronRight, CheckCircle2, Circle } from 'lucide-react';
import { IconButton } from '@radix-ui/themes';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card/Card';
import { Badge } from '@/components/ui/badge/Badge';
import { PriorityColors } from '../ui/PriorityColors';
import { Task, TaskPriority } from '@/types/task.types';
import { cn } from '@/lib/utils';
import { useLabelStore } from '@/stores/label.store';
import { useTaskStore } from '@/stores/task.store';

interface TaskCardProps {
  task: Task;
  onClick?: (task: Task) => void;
}

// Highest priority order
const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 4, high: 3, medium: 2, low: 1,
};

export const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
  const { getLabelById } = useLabelStore();
  const { tasks } = useTaskStore();
  const [expanded, setExpanded] = useState(false);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  const taskLabels = useMemo(
    () => task.labels?.map(id => getLabelById(id)).filter(Boolean) || [],
    [task.labels, getLabelById]
  );

  // Sub-tasks
  const subTaskItems = useMemo(
    () => task.subTasks?.map(id => tasks.find(t => t.id === id)).filter(Boolean) as Task[] || [],
    [task.subTasks, tasks]
  );

  // Get highest priority from sub-tasks + own
  const highestPriority = useMemo((): TaskPriority => {
    let max = task.priority;
    subTaskItems.forEach(st => {
      if (PRIORITY_ORDER[st.priority] > PRIORITY_ORDER[max]) max = st.priority;
    });
    return max;
  }, [task.priority, subTaskItems]);

  const completedSubs = subTaskItems.filter(st => st.columnId === 'done').length;
  const hasSubTasks = subTaskItems.length > 0;
  const hasAttachments = task.attachments && task.attachments.length > 0;
  const showPriorityBadge = highestPriority !== task.priority;

  // Priority bar color (left indicator)
  const priorityBarColor = {
    urgent: 'bg-red-500',
    high: 'bg-orange-500',
    medium: 'bg-blue-400',
    low: 'bg-gray-300',
  }[highestPriority];

  return (
    <div ref={setNodeRef} style={style} className="mb-3" data-kanban-task>
      <Card className={cn(
        'shadow-sm hover:shadow-md transition-all overflow-hidden',
        isDragging && 'shadow-lg rotate-2 scale-105'
      )}>
        {/* Priority color bar on top */}
        <div className={cn('h-1', priorityBarColor)} />

        <CardHeader className="p-3 pb-1">
          <div className="flex items-start justify-between gap-1">
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <IconButton
                {...attributes} {...listeners}
                variant="ghost" size="1"
                className="cursor-grab active:cursor-grabbing flex-shrink-0"
                data-kanban-drag
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical size={16} className="text-gray-400" />
              </IconButton>
              <CardTitle className="text-sm font-medium truncate">{task.title}</CardTitle>
            </div>
            <IconButton
              variant="ghost" size="1"
  
              className={cn(
                'h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0',
                'hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/20 dark:hover:text-blue-400'
              )}
              onClick={(e) => { e.stopPropagation(); onClick?.(task); }}
              title="View Details"
            >
              <Eye size={14} />
            </IconButton>
          </div>
          {task.shortDescription && (
            <CardDescription className="text-xs mt-1 ml-6 line-clamp-2">
              {task.shortDescription}
            </CardDescription>
          )}
        </CardHeader>

        <CardFooter className="p-3 pt-1 flex flex-col gap-2">
          {/* Labels */}
          {taskLabels.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {taskLabels.map(label => (
                <span key={label!.id} className="text-[10px] px-2 py-0.5 rounded-full text-white font-medium" style={{ backgroundColor: label!.color }}>
                  {label!.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-1.5">
              {/* Priority badge */}
              <Badge variant="secondary" className={cn('text-[10px] px-1.5 py-0', PriorityColors[task.priority])}>
                {showPriorityBadge && <span className="mr-0.5">⬆</span>}
                {task.priority}
              </Badge>
              {/* Type badge */}
              {task.type !== 'task' && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0 capitalize">
                  {task.type}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2">
              {hasSubTasks && (
<button
  onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
  className="flex items-center gap-1 text-[10px] text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
>
  <span>{completedSubs}/{subTaskItems.length}</span>
  <ChevronRight 
    size={12} 
    className={cn(
      'transition-transform duration-300 ease-in-out',
      expanded ? 'rotate-90' : 'rotate-0'
    )}
  />
</button>
              )}
              {hasAttachments && (
                <div className="flex items-center text-[10px] text-gray-400">
                  <Paperclip size={12} className="mr-0.5" />
                  {task.attachments.length}
                </div>
              )}
            </div>
          </div>

        {/* Expanded sub-tasks */}
        <div className={cn(
          'border-t border-gray-100 dark:border-gray-700',
          'overflow-hidden transition-all duration-300 ease-in-out',
          expanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}>
          <div className="px-3 pt-2 space-y-1">
            {subTaskItems.map(st => (
              <div key={st.id} className="flex items-center gap-2 text-xs py-0.5">
                {st.columnId === 'done' ? (
                  <CheckCircle2 size={12} className="text-green-500 flex-shrink-0" />
                ) : (
                  <Circle size={12} className="text-gray-400 flex-shrink-0" />
                )}
                <span className={cn('truncate', st.columnId === 'done' && 'line-through opacity-50')}>
                  {st.title}
                </span>
                <Badge variant="secondary" className={cn('text-[10px] px-1 py-0 ml-auto', PriorityColors[st.priority])}>
                  {st.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
        </CardFooter>
      </Card>
    </div>
  );
};