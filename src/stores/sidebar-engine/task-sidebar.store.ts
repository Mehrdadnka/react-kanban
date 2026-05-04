// src/stores/task-sidebar.store.ts

import { create } from 'zustand';
import { Task, TaskPriority, TaskType } from '@/types/task.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

export type SidebarMode = 'create' | 'view' | 'edit';
// export type StepId = 'basic' | 'classification' | 'schedule' | 'breakdown' | 'timeline';
export type StepId = 'quick-create' | 'full-details' | 'schedule' | 'meta';

export interface Step {
  id: StepId;
  label: string;
}
export const STEPS: Step[] = [
  { id: 'quick-create', label: 'Quick Create' },
  { id: 'full-details', label: 'Full Details' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'meta', label: 'Meta' },
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

  // ──── New: parent context ────
  parentTaskId?: string;

  // Stepper
  activeStep: StepId;
  completedSteps: StepId[];

formState: {
  // Quick Create (اجباری)
  title: string;           // الزامی + یونیک
  shortDescription: string; // یک خط، الزامی
  type: TaskType;
  priority: TaskPriority;
  columnId: string;        // status
  labels: string[];
  milestone?: string;      // آیدی milestone
  project?: string;        // آیدی project
  
  // Full Details
  description: string;     // Rich text/Markdown
  attachments: Array<{
    id: string;
    name: string;
    type: 'image' | 'file' | 'code';
    url?: string;
    content?: string;
  }>;
  
  // Schedule
  dueDate?: Date;
  startDate?: Date;
  reminderDate?: Date;
  
  // Meta
  customFields: Record<string, string>;
  relatedTaskIds: string[];
  estimatedHours?: number;
  actualHours?: number;
}

  // Actions
  openCreateSidebar: (options?: { defaultColumnId?: string; parentTaskId?: string }) => void;
  openCreateSubTaskSidebar: (parentTaskId: string) => void;
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
  shortDescription: '',
  type: 'task',
  priority: 'medium',
  columnId: 'todo',
  labels: [],
  milestone: undefined,
  project: undefined,
  description: '',
  attachments: [],
  dueDate: undefined,
  startDate: undefined,
  reminderDate: undefined,
  customFields: {},
  relatedTaskIds: [],
  estimatedHours: undefined,
  actualHours: undefined,
};

export const useTaskSidebarStore = create<TaskSidebarState>((set, get) => ({
  mode: 'create',
  selectedTask: null,
  defaultColumnId: 'todo',
  breadcrumbs: [],
  parentTaskId: undefined,
  activeStep: 'quick-create',
  completedSteps: [],
  formState: { ...initialFormState },

  // ──── Open for new task (optionally as sub-task) ────
  openCreateSidebar: (options = {}) => {
    const { defaultColumnId = 'todo', parentTaskId: parentId } = options;
    set({
      mode: 'create',
      selectedTask: null,
      defaultColumnId,
      parentTaskId: parentId,
      breadcrumbs: parentId
        ? [{ label: 'Back to Parent', onClick: () => get().closeSidebar() }, { label: 'New Sub-task' }]
        : [{ label: 'New Task' }],
      activeStep: 'quick-create',
      completedSteps: [],
      formState: { ...initialFormState, columnId: defaultColumnId },
    });
    useSidebarEngineStore.getState().open('task-sidebar', { mode: 'create', parentTaskId: parentId });
  },

  // ──── Explicitly create sub-task from parent ────
  openCreateSubTaskSidebar: (parentTaskId: string) => {
    get().openCreateSidebar({ parentTaskId });
  },

openViewSidebar: (task: Task) => {
    set({
      mode: 'view',
      selectedTask: task,
      parentTaskId: task.parentId,
      breadcrumbs: [
        { label: 'Tasks' },
        ...(task.parentId ? [{ label: 'Parent' }] : []),
        { label: task.columnId },
        { label: task.title },
      ],
      activeStep: 'quick-create',
      completedSteps: ['quick-create', 'full-details', 'schedule', 'meta'],
      formState: {
        ...initialFormState,
        title: task.title,
        shortDescription: task.shortDescription || '',
        description: task.description || '',
        priority: task.priority,
        columnId: task.columnId,
        type: task.type || 'task',
        labels: task.labels || [],
        dueDate: task.dueDate,
        startDate: task.startDate,
        relatedTaskIds: task.relatedTasks || [],
      },
    });
    useSidebarEngineStore.getState().open('task-sidebar', { mode: 'view', taskId: task.id });
},
  openEditSidebar: (task: Task) => {
    set({
      mode: 'edit',
      selectedTask: task,
      parentTaskId: task.parentId,
      breadcrumbs: [
        { label: 'Tasks' },
        { label: task.columnId },
        { label: task.title, onClick: () => get().transitionTo('view', task) },
        { label: 'Edit' },
      ],
      activeStep: 'quick-create',
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
      parentTaskId: undefined,
      breadcrumbs: [],
      activeStep: 'quick-create',
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

  // ──── Stepper ────
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