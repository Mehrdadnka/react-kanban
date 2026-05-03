import { create } from 'zustand';
import { Task, TaskPriority, TaskType } from '@/types/task.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

export type SidebarMode = 'create' | 'view' | 'edit';
export type StepId = 'basic' | 'classification' | 'schedule' | 'breakdown';

export interface Step {
  id: StepId;
  label: string;
}

export const STEPS: Step[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'classification', label: 'Classification' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'breakdown', label: 'Breakdown' },
];

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
}

interface TaskSidebarState {
  mode: SidebarMode;
  selectedTask: Task | null;
  defaultColumnId: string;
  breadcrumbs: BreadcrumbItem[];
  
  // Stepper
  activeStep: StepId;
  completedSteps: StepId[];
  
  // Form state (all fields)
  formState: {
    title: string;
    description: string;
    priority: TaskPriority;
    columnId: string;
    type: TaskType;
    labels: string[];
    dueDate?: Date;
    startDate?: Date;
    subTasks: Array<{ id: string; title: string; completed: boolean }>;
    relatedTaskIds: string[];
  };
  
  // Actions
  openCreateSidebar: (defaultColumnId?: string) => void;
  openViewSidebar: (task: Task) => void;
  openEditSidebar: (task: Task) => void;
  closeSidebar: () => void;
  updateFormField: <K extends keyof TaskSidebarState['formState']>(field: K, value: TaskSidebarState['formState'][K]) => void;
  resetForm: () => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  transitionTo: (mode: SidebarMode, task?: Task) => void;
  
  // Stepper actions
  goToStep: (step: StepId) => void;
  goNext: () => void;
  goBack: () => void;
  completeStep: (step: StepId) => void;
}

const initialFormState: TaskSidebarState['formState'] = {
  title: '',
  description: '',
  priority: 'medium',
  columnId: 'todo',
  type: 'task',
  labels: [],
  dueDate: undefined,
  startDate: undefined,
  subTasks: [],
  relatedTaskIds: [],
};

export const useTaskSidebarStore = create<TaskSidebarState>((set, get) => ({
  mode: 'create',
  selectedTask: null,
  defaultColumnId: 'todo',
  breadcrumbs: [],
  activeStep: 'basic',
  completedSteps: [],
  formState: { ...initialFormState },
  
  openCreateSidebar: (defaultColumnId = 'todo') => {
    set({
      mode: 'create',
      selectedTask: null,
      defaultColumnId,
      breadcrumbs: [{ label: 'New Task' }],
      activeStep: 'basic',
      completedSteps: [],
      formState: { ...initialFormState, columnId: defaultColumnId },
    });
    useSidebarEngineStore.getState().open('task-sidebar', { mode: 'create' });
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
      activeStep: 'basic',
      completedSteps: ['basic', 'classification', 'schedule', 'breakdown'],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        columnId: task.columnId,
        type: task.type || 'task',
        labels: task.labels || [],
        dueDate: task.dueDate,
        startDate: task.startDate,
        subTasks: task.subTasks?.map(id => ({ id, title: '', completed: false })) || [],
        relatedTaskIds: task.relatedTasks || [],
      },
    });
    useSidebarEngineStore.getState().open('task-sidebar', { mode: 'view', taskId: task.id });
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
      activeStep: 'basic',
      completedSteps: [],
      formState: {
        title: task.title,
        description: task.description || '',
        priority: task.priority,
        columnId: task.columnId,
        type: task.type || 'task',
        labels: task.labels || [],
        dueDate: task.dueDate,
        startDate: task.startDate,
        subTasks: task.subTasks?.map(id => ({ id, title: '', completed: false })) || [],
        relatedTaskIds: task.relatedTasks || [],
      },
    });
    useSidebarEngineStore.getState().open('task-sidebar', { mode: 'edit', taskId: task.id });
  },
  
  closeSidebar: () => {
    set({
      mode: 'create',
      selectedTask: null,
      breadcrumbs: [],
      activeStep: 'basic',
      completedSteps: [],
      formState: { ...initialFormState },
    });
    useSidebarEngineStore.getState().close('task-sidebar');
  },
  
  updateFormField: (field, value) => {
    set(state => ({
      formState: { ...state.formState, [field]: value },
    }));
  },
  
  resetForm: () => {
    set({ formState: { ...initialFormState } });
  },
  
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  
  transitionTo: (mode, task?) => {
    if (mode === 'create') get().openCreateSidebar();
    else if (mode === 'view' && task) get().openViewSidebar(task);
    else if (mode === 'edit' && task) get().openEditSidebar(task);
  },
  
  // Stepper
  goToStep: (step) => set({ activeStep: step }),
  
  goNext: () => {
    const { activeStep } = get();
    const currentIndex = STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < STEPS.length - 1) {
      set({ activeStep: STEPS[currentIndex + 1].id });
    }
  },
  
  goBack: () => {
    const { activeStep } = get();
    const currentIndex = STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      set({ activeStep: STEPS[currentIndex - 1].id });
    }
  },
  
  completeStep: (step) => {
    set(state => ({
      completedSteps: state.completedSteps.includes(step)
        ? state.completedSteps
        : [...state.completedSteps, step],
    }));
  },
}));