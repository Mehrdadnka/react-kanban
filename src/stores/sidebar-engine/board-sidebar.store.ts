// stores/board-sidebar.store.ts
import { create } from 'zustand';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useBoardStore } from '@/stores/board.store';

export type BoardStepId = 'basic-info' | 'appearance' | 'settings';

export interface BoardStep {
  id: BoardStepId;
  label: string;
}

export const BOARD_STEPS: BoardStep[] = [
  { id: 'basic-info', label: 'Basic Info' },
  { id: 'appearance', label: 'Appearance' },
  { id: 'settings', label: 'Settings' },
];

export interface BoardFormState {
  title: string;
  description: string;
  color: string;
  icon: string;
  isPublic: boolean;
  defaultView: 'kanban' | 'list' | 'calendar';
}

interface BoardSidebarState {
  mode: 'create' | 'edit';
  editingBoardId: string | null;
  breadcrumbs: { label: string; onClick?: () => void }[];

  // Stepper
  activeStep: BoardStepId;
  completedSteps: BoardStepId[];

  // Form State
  formState: BoardFormState;

  // Actions
  openCreateBoard: () => void;
  openEditBoard: (boardId: string) => void;
  closeSidebar: () => void;
  updateFormField: <K extends keyof BoardFormState>(
    field: K,
    value: BoardFormState[K]
  ) => void;
  resetForm: () => void;
  submitBoard: () => void;

  // Stepper actions
  goToStep: (step: BoardStepId) => void;
  goNext: () => void;
  goBack: () => void;
  completeStep: (step: BoardStepId) => void;
}

const initialFormState: BoardFormState = {
  title: '',
  description: '',
  color: '#6366f1',
  icon: 'Rocket',
  isPublic: false,
  defaultView: 'kanban',
};

export const useBoardSidebarStore = create<BoardSidebarState>((set, get) => ({
  mode: 'create',
  editingBoardId: null,
  breadcrumbs: [],
  activeStep: 'basic-info',
  completedSteps: [],
  formState: { ...initialFormState },

  // ──── Open Create Board ────
  openCreateBoard: () => {
    set({
      mode: 'create',
      editingBoardId: null,
      breadcrumbs: [{ label: 'New Board' }],
      activeStep: 'basic-info',
      completedSteps: [],
      formState: { ...initialFormState },
    });
    useSidebarEngineStore.getState().open('create-board-sidebar', {
      mode: 'create',
    });
  },

  // ──── Open Edit Board ────
  openEditBoard: (boardId: string) => {
    const board = useBoardStore.getState().boards.find(b => b.id === boardId);
    if (!board) return;

    set({
      mode: 'edit',
      editingBoardId: boardId,
      breadcrumbs: [
        { label: 'Boards' },
        { label: board.title, onClick: () => get().closeSidebar() },
        { label: 'Edit' },
      ],
      activeStep: 'basic-info',
      completedSteps: [],
      formState: {
        title: board.title,
        description: board.description || '',
        color: board.color,
        icon: board.icon,
        isPublic: false,
        defaultView: 'kanban',
      },
    });
    useSidebarEngineStore.getState().open('create-board-sidebar', {
      mode: 'edit',
      boardId,
    });
  },

  // ──── Close ────
  closeSidebar: () => {
    set({
      mode: 'create',
      editingBoardId: null,
      breadcrumbs: [],
      activeStep: 'basic-info',
      completedSteps: [],
      formState: { ...initialFormState },
    });
    useSidebarEngineStore.getState().close('create-board-sidebar');
  },

  // ──── Update Field ────
  updateFormField: (field, value) => {
    set(state => ({
      formState: { ...state.formState, [field]: value },
    }));
  },

  resetForm: () => {
    set({ formState: { ...initialFormState } });
  },

  // ──── Submit ────
  submitBoard: () => {
    const { mode, editingBoardId, formState } = get();
    const { addBoard, updateBoard } = useBoardStore.getState();

    if (mode === 'create') {
      addBoard({
        title: formState.title.trim(),
        description: formState.description.trim(),
        color: formState.color,
        icon: formState.icon,
      });
    } else if (mode === 'edit' && editingBoardId) {
      updateBoard(editingBoardId, {
        title: formState.title.trim(),
        description: formState.description.trim(),
        color: formState.color,
        icon: formState.icon,
      });
    }

    get().closeSidebar();
  },

  // ──── Stepper ────
  goToStep: (step) => {
    if (get().completedSteps.includes(step) || step === get().activeStep) {
      set({ activeStep: step });
    }
  },

  goNext: () => {
    const { activeStep } = get();
    const currentIndex = BOARD_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex < BOARD_STEPS.length - 1) {
      const nextStep = BOARD_STEPS[currentIndex + 1].id;
      set(state => ({
        activeStep: nextStep,
        completedSteps: state.completedSteps.includes(activeStep)
          ? state.completedSteps
          : [...state.completedSteps, activeStep],
      }));
    }
  },

  goBack: () => {
    const { activeStep } = get();
    const currentIndex = BOARD_STEPS.findIndex(s => s.id === activeStep);
    if (currentIndex > 0) {
      set({ activeStep: BOARD_STEPS[currentIndex - 1].id });
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