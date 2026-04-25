import { create } from 'zustand';

interface UIStore {
  taskDialogOpen: boolean;
  selectedColumn: string;
  openTaskDialog: (columnId?: string) => void;
  closeTaskDialog: () => void;
}

export const useUIStore = create<UIStore>()((set) => ({
  taskDialogOpen: false,
  selectedColumn: 'todo',
  
  openTaskDialog: (columnId = 'todo') => set({ 
    taskDialogOpen: true, 
    selectedColumn: columnId 
  }),
  
  closeTaskDialog: () => set({ taskDialogOpen: false }),
}));