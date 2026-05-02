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
import { useTaskStore } from '@/stores/task.store';
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
    if (overColumn && activeTask.status !== overColumn.id) {
      moveTask(activeId, overColumn.id as any);
    }
  }, [tasks, columns, moveTask]);

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