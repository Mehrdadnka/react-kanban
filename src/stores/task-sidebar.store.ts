import { create } from 'zustand';
import { Task } from '@/types/task.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

export type SidebarMode = 'create' | 'view' | 'edit';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface TaskSidebarState {
  // Current mode
  mode: SidebarMode;
  
  // Selected task for view/edit mode
  selectedTask: Task | null;
  
  // Default status for create mode
  defaultStatus: Task['status'];
  
  // Breadcrumbs for view/edit mode
  breadcrumbs: BreadcrumbItem[];
  
  // Form state (for create/edit)
  formState: {
    title: string;
    description: string;
    priority: Task['priority'];
    status: Task['status'];
  };
  
  // Actions
  openCreateSidebar: (defaultStatus?: Task['status']) => void;
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
  priority: 'medium' as Task['priority'],
  status: 'todo' as Task['status'],
};

export const useTaskSidebarStore = create<TaskSidebarState>((set, get) => ({
  mode: 'create',
  selectedTask: null,
  defaultStatus: 'todo',
  breadcrumbs: [],
  formState: { ...initialFormState },
  
  openCreateSidebar: (defaultStatus = 'todo') => {
    // Setting inner state
    set({
      mode: 'create',
      selectedTask: null,
      defaultStatus,
      breadcrumbs: [{ label: 'New Task' }],
      formState: {
        ...initialFormState,
        status: defaultStatus,
      },
    });
    
    // Opening Sidebar engine
    const engine = useSidebarEngineStore.getState();
    engine.open('task-sidebar', { mode: 'create' });
  },
  
  openViewSidebar: (task: Task) => {
    set({
      mode: 'view',
      selectedTask: task,
      breadcrumbs: [
        { label: 'Tasks' },
        { label: task.status },
        { label: task.title },
      ],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
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
        { label: task.status },
        { label: task.title, onClick: () => get().transitionTo('view', task) },
        { label: 'Edit' },
      ],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
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