// src/stores/sidebar-engine/task-sidebar.store.ts

import { create } from 'zustand';
import { Task, TaskPriority, TaskType, Attachment } from '@/types/task.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

export type SidebarMode = 'create' | 'view' | 'edit';
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

// ──── Form State (هماهنگ با Task interface) ────
export interface TaskFormState {
  // Quick Create (اجباری)
  title: string;
  shortDescription: string;
  type: TaskType;
  priority: TaskPriority;
  columnId: string;
  labels: string[];
  milestoneIds: string[];  // تغییر از milestone به آرایه
  projectIds: string[];    // تغییر از project به آرایه
  
  // Full Details
  description: string;
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
  estimatedHours?: number;
  relatedTaskIds: string[];
  assigneeId?: string;
}

interface TaskSidebarState {
  mode: SidebarMode;
  selectedTask: Task | null;
  defaultColumnId: string;
  breadcrumbs: BreadcrumbItem[];
  parentTaskId?: string;

  // Stepper
  activeStep: StepId;
  completedSteps: StepId[];

  // Form State
  formState: TaskFormState;

  // Actions
  openCreateSidebar: (options?: { 
    defaultColumnId?: string; 
    parentTaskId?: string;
    initialData?: Partial<TaskFormState>;
  }) => void;
  openCreateSubTaskSidebar: (parentTaskId: string) => void;
  openViewSidebar: (task: Task) => void;
  openEditSidebar: (task: Task) => void;
  closeSidebar: () => void;
  updateFormField: <K extends keyof TaskFormState>(
    field: K, 
    value: TaskFormState[K]
  ) => void;
  resetForm: () => void;
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  transitionTo: (mode: SidebarMode, task?: Task) => void;

  // Stepper actions
  goToStep: (step: StepId) => void;
  goNext: () => void;
  goBack: () => void;
  completeStep: (step: StepId) => void;
  
  // Bulk form update
  updateFormBulk: (updates: Partial<TaskFormState>) => void;
}

// ──── Initial State ────
const initialFormState: TaskFormState = {
  title: '',
  shortDescription: '',
  type: 'task',
  priority: 'medium',
  columnId: 'todo',
  labels: [],
  milestoneIds: [],
  projectIds: [],
  description: '',
  attachments: [],
  dueDate: undefined,
  startDate: undefined,
  reminderDate: undefined,
  estimatedHours: undefined,
  relatedTaskIds: [],
  assigneeId: undefined,
};

// ──── Helper: Map Task to FormState ────
const taskToFormState = (task: Task): TaskFormState => ({
  title: task.title,
  shortDescription: task.shortDescription || '',
  type: task.type,
  priority: task.priority,
  columnId: task.columnId,
  labels: task.labels || [],
  milestoneIds: task.milestoneIds || [],
  projectIds: task.projectIds || [],
  description: task.description || '',
  attachments: task.attachments?.map(a => ({
    id: a.id,
    name: a.name,
    type: a.type === 'image' ? 'image' : a.type === 'code' ? 'code' : 'file',
    url: a.url,
  })) || [],
  dueDate: task.dueDate,
  startDate: task.startDate,
  reminderDate: task.reminderDate,
  estimatedHours: task.estimatedHours,
  relatedTaskIds: task.relatedTasks || [],
  assigneeId: task.assigneeId,
});

// ──── Store ────
export const useTaskSidebarStore = create<TaskSidebarState>((set, get) => ({
  mode: 'create',
  selectedTask: null,
  defaultColumnId: 'todo',
  breadcrumbs: [],
  parentTaskId: undefined,
  activeStep: 'quick-create',
  completedSteps: [],
  formState: { ...initialFormState },

  // ──── Open for new task ────
  openCreateSidebar: (options = {}) => {
    const { 
      defaultColumnId = 'todo', 
      parentTaskId: parentId,
      initialData 
    } = options;
    
    set({
      mode: 'create',
      selectedTask: null,
      defaultColumnId,
      parentTaskId: parentId,
      breadcrumbs: parentId
        ? [
            { label: 'Back to Parent', onClick: () => get().closeSidebar() }, 
            { label: 'New Sub-task' }
          ]
        : [{ label: 'New Task' }],
      activeStep: 'quick-create',
      completedSteps: [],
      formState: { 
        ...initialFormState, 
        columnId: defaultColumnId,
        ...initialData, // Allow overriding initial data
      },
    });
    useSidebarEngineStore.getState().open('task-sidebar', { 
      mode: 'create', 
      parentTaskId: parentId 
    });
  },

  // ──── Create sub-task ────
  openCreateSubTaskSidebar: (parentTaskId: string) => {
    get().openCreateSidebar({ parentTaskId });
  },

  // ──── View task ────
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
      formState: taskToFormState(task),
    });
    useSidebarEngineStore.getState().open('task-sidebar', { 
      mode: 'view', 
      taskId: task.id 
    });
  },

  // ──── Edit task ────
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
      completedSteps: [], // Start fresh for editing
      formState: taskToFormState(task),
    });
    useSidebarEngineStore.getState().open('task-sidebar', { 
      mode: 'edit', 
      taskId: task.id 
    });
  },

  // ──── Close ────
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

  // ──── Update single field ────
  updateFormField: (field, value) => {
    set(state => ({
      formState: { ...state.formState, [field]: value },
    }));
  },

  // ──── Bulk update ────
  updateFormBulk: (updates) => {
    set(state => ({
      formState: { ...state.formState, ...updates },
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