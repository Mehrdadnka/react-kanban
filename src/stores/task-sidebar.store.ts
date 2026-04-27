import { create } from 'zustand';
import { Task } from './task.store';

export type SidebarMode = 'create' | 'view' | 'edit';

interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface TaskSidebarState {
  // Sidebar visibility
  isOpen: boolean;
  
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
  isOpen: false,
  mode: 'create',
  selectedTask: null,
  defaultStatus: 'todo',
  breadcrumbs: [],
  formState: { ...initialFormState },
  
  openCreateSidebar: (defaultStatus = 'todo') => {
    set({
      isOpen: true,
      mode: 'create',
      selectedTask: null,
      defaultStatus,
      breadcrumbs: [{ label: 'New Task' }],
      formState: {
        ...initialFormState,
        status: defaultStatus,
      },
    });
  },
  
  openViewSidebar: (task: Task) => {
    set({
      isOpen: true,
      mode: 'view',
      selectedTask: task,
      breadcrumbs: [
        { label: 'Tasks' },
        { label: task.title },
      ],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        status: task.status,
      },
    });
  },
  
  openEditSidebar: (task: Task) => {
    set({
      isOpen: true,
      mode: 'edit',
      selectedTask: task,
      breadcrumbs: [
        { label: 'Tasks' },
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
  },
  
  closeSidebar: () => {
    set({
      isOpen: false,
      mode: 'create',
      selectedTask: null,
      breadcrumbs: [],
      formState: { ...initialFormState },
    });
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