import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Task } from '@/types/task.types';

interface TaskStore {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  moveTask: (id: string, newStatus: Task['status']) => void;
  reorderTasks: (activeId: string, overId: string) => void;
}

export const useTaskStore = create<TaskStore>()(
  persist(
    (set) => ({
      tasks: [
        {
          id: uuidv4(),
          title: 'Wellcome!',
          description: 'This is your first task',
          status: 'todo',
          priority: 'medium',
          createdAt: new Date(),
          updatedAt: new Date()
        },
      ],
      
      addTask: (taskData) => set((state) => ({
        tasks: [...state.tasks, {
          ...taskData,
          id: uuidv4(),
          createdAt: new Date(),
        }]
      })),
      
      updateTask: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => {
        set((state) => ({
          tasks: state.tasks.map((task) =>
            task.id === id
              ? { ...task, ...updates, updatedAt: new Date().toISOString() }
              : task
          ),
        }));
      },
      
      deleteTask: (id) => set((state) => ({
        tasks: state.tasks.filter(task => task.id !== id)
      })),
      
      moveTask: (id, newStatus) => set((state) => ({
        tasks: state.tasks.map(task =>
          task.id === id ? { ...task, status: newStatus } : task
        )
      })),
      
      
      reorderTasks: (activeId, overId) => set((state) => {
        const tasks = [...state.tasks];
        const activeIndex = tasks.findIndex(t => t.id === activeId);
        const overIndex = tasks.findIndex(t => t.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1) {
          [tasks[activeIndex], tasks[overIndex]] = [tasks[overIndex], tasks[activeIndex]];
        }
        
        return { tasks };
      }),
    }),
    {
      name: 'taskflow-storage',
    }
  )
);