// src/providers/DndProvider.tsx

import React, { useState, useCallback } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { toast } from 'sonner';
import { useTaskStore } from '@/stores/task.store';
import { useColumnStore } from '@/stores/column.store';
import { TaskCard } from '../components/board/TaskCard';

interface KanbanDndProviderProps {
  children: React.ReactNode;
  columns: Array<{ id: string }>;
}

export const DndProvider: React.FC<KanbanDndProviderProps> = ({ 
  children, 
  columns 
}) => {
  const { tasks, moveTask } = useTaskStore();
  const { getColumnById } = useColumnStore();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  }, []);

  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTask = tasks.find(t => t.id === activeId);
    if (!activeTask) return;

    const overColumn = columns.find(col => col.id === overId);
    if (!overColumn || activeTask.columnId === overColumn.id) return;
    const targetColumn = getColumnById(overColumn.id);

    // WIP check
    if (targetColumn?.wipLimit) {
      const currentCount = tasks.filter(t => t.columnId === overColumn.id).length;
      if (currentCount >= targetColumn.wipLimit) {
        console.log('🚨 WIP EXCEEDED - showing toast');
        toast.warning(`WIP limit reached: ${targetColumn.title} is full (${currentCount}/${targetColumn.wipLimit})`, {
          description: 'Remove some tasks or increase the limit.',
          duration: 3000,
        });
        return;
      }
    }

    moveTask(activeId, overColumn.id);
  }, [tasks, columns, moveTask, getColumnById]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setActiveId(null);
  }, []);

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      {children}
      
      <DragOverlay>
        {activeTask && (
          <div className="w-80">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
};