// src/stores/task-sidebar.store.ts

import { create } from 'zustand';
import { Task, TaskPriority } from '@/types/task.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

export type SidebarMode = 'create' | 'view' | 'edit';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface TaskSidebarState {
  // Current mode
  mode: SidebarMode;
  
  // Selected task for view/edit mode
  selectedTask: Task | null;
  
  // Default column for create mode
  defaultColumnId: string;
  
  // Breadcrumbs for view/edit mode
  breadcrumbs: BreadcrumbItem[];
  
  // Form state (for create/edit)
  formState: {
    title: string;
    description: string;
    priority: TaskPriority;
    columnId: string;
  };
  
  // Actions
  openCreateSidebar: (defaultColumnId?: string) => void;
  openViewSidebar: (task: Task) => void;
  openEditSidebar: (task: Task) => void;
  closeSidebar: () => void;
  updateFormField: <K extends keyof TaskSidebarState['formState']>(
    field: K,
    value: TaskSidebarState['formState'][K]
  ) => void;
  resetForm: () => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  transitionTo: (mode: SidebarMode, task?: Task) => void;
}

const initialFormState = {
  title: '',
  description: '',
  priority: 'medium' as TaskPriority,
  columnId: 'todo',
};

export const useTaskSidebarStore = create<TaskSidebarState>((set, get) => ({
  mode: 'create',
  selectedTask: null,
  defaultColumnId: 'todo',
  breadcrumbs: [],
  formState: { ...initialFormState },
  
  openCreateSidebar: (defaultColumnId = 'todo') => {
    set({
      mode: 'create',
      selectedTask: null,
      defaultColumnId,
      breadcrumbs: [{ label: 'New Task' }],
      formState: {
        ...initialFormState,
        columnId: defaultColumnId,
      },
    });
    
    const engine = useSidebarEngineStore.getState();
    engine.open('task-sidebar', { mode: 'create' });
  },
  
  openViewSidebar: (task: Task) => {
    set({
      mode: 'view',
      selectedTask: task,
      breadcrumbs: [
        { label: 'Tasks' },
        { label: task.columnId },
        { label: task.title },
      ],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        columnId: task.columnId,
      },
    });
    
    const engine = useSidebarEngineStore.getState();
    engine.open('task-sidebar', { mode: 'view', taskId: task.id });
  },
  
  openEditSidebar: (task: Task) => {
    set({
      mode: 'edit',
      selectedTask: task,
      breadcrumbs: [
        { label: 'Tasks' },
        { label: task.columnId },
        { label: task.title, onClick: () => get().transitionTo('view', task) },
        { label: 'Edit' },
      ],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        columnId: task.columnId,
      },
    });
    
    const engine = useSidebarEngineStore.getState();
    engine.open('task-sidebar', { mode: 'edit', taskId: task.id });
  },
  
  closeSidebar: () => {
    set({
      mode: 'create',
      selectedTask: null,
      breadcrumbs: [],
      formState: { ...initialFormState },
    });
    
    const engine = useSidebarEngineStore.getState();
    engine.close('task-sidebar');
  },
  
  updateFormField: (field, value) => {
    set((state) => ({
      formState: {
        ...state.formState,
        [field]: value,
      },
    }));
  },
  
  resetForm: () => {
    set({ formState: { ...initialFormState } });
  },
  
  setBreadcrumbs: (breadcrumbs) => {
    set({ breadcrumbs });
  },
  
  transitionTo: (mode, task?) => {
    if (mode === 'create') {
      get().openCreateSidebar();
    } else if (mode === 'view' && task) {
      get().openViewSidebar(task);
    } else if (mode === 'edit' && task) {
      get().openEditSidebar(task);
    }
  },
}));