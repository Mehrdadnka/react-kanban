import { useState, useCallback, useMemo } from 'react';
import { TaskType, TaskPriority } from '@/types/task.types';
import { useTaskStore } from '@/stores/task.store';
import { useAttachments } from './useAttachments';
import { StepId, useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store';
import { toast } from 'sonner';
import { AlertCircle } from 'lucide-react';
import { metaSchema, quickCreateSchema, scheduleSchema } from '../schemas/task.schema';

// ──── Types ────

export interface Attachment {
  id: string;
  name: string;
  type: 'image' | 'file' | 'code';
  url?: string;
  content?: string;
}

export interface FormState {
  // Step 1: Quick Create (Required)
  boardId: string;
  title: string;
  shortDescription: string;
  type: TaskType;
  priority: TaskPriority;
  columnId: string;
  labels: string[];
  milestoneIds: string[];
  projectIds: string[];

  // Step 2: Full Details (Optional)
  description: string;

  // Step 3: Schedule (Optional)
  startDate?: Date;
  dueDate?: Date;
  reminderDate?: Date;

  // Step 4: Meta (Optional)
  attachments: Attachment[];
  estimatedHours?: number;
  relatedTaskIds: string[];
  assigneeId?: string;
}

// ──── Initial State ────

const initialState: FormState = {
  boardId: '',
  title: '',
  shortDescription: '',
  description: '',
  columnId: 'todo',
  priority: 'medium',
  type: 'task',
  labels: [],
  milestoneIds: [],
  projectIds: [],
  startDate: undefined,
  dueDate: undefined,
  reminderDate: undefined,
  estimatedHours: undefined,
  attachments: [],
  relatedTaskIds: [],
  assigneeId: undefined,
};

// ──── Hook ────

export const useCreateTaskForm = (onSuccess: () => void) => {
  const [formState, setFormState] = useState<FormState>(initialState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addTask } = useTaskStore();

  // ──── Field Update ────

  const updateFormField = useCallback(<K extends keyof FormState>(
    field: K,
    value: FormState[K]
  ) => {
    setFormState(prev => ({ ...prev, [field]: value }));
  }, []);

  const updateFormFields = useCallback((fields: Partial<FormState>) => {
    setFormState(prev => ({ ...prev, ...fields }));
  }, []);

  // ──── Attachments ────


const stepValidators: Record<StepId, (state: FormState) => boolean> = useMemo(() => ({
  'quick-create': (state) => {
    const result = quickCreateSchema.safeParse({
      title: state.title,
      shortDescription: state.shortDescription,
      type: state.type,
      priority: state.priority,
      columnId: state.columnId,
      labels: state.labels,
      milestoneIds: state.milestoneIds,
      projectIds: state.projectIds,
    });
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message || 'Validation failed', {
        icon: <AlertCircle size={16} />,
      });
      return false;
    }
    return true;
  },

  'full-details': () => true,

  'schedule': (state) => {
    const result = scheduleSchema.safeParse({
      startDate: state.startDate,
      dueDate: state.dueDate,
      reminderDate: state.reminderDate,
    });
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message || 'Invalid schedule', {
        icon: <AlertCircle size={16} />,
      });
      return false;
    }
    return true;
  },

  'meta': (state) => {
    const result = metaSchema.safeParse({
      attachments: state.attachments,
      estimatedHours: state.estimatedHours,
      relatedTaskIds: state.relatedTaskIds,
      assigneeId: state.assigneeId,
    });
    
    if (!result.success) {
      const firstError = result.error.issues[0];
      toast.error(firstError.message || 'Invalid meta data', {
        icon: <AlertCircle size={16} />,
      });
      return false;
    }
    return true;
  },
}), []);

  const {
    fileInputRef,
    handleClick: handleAttachmentClick,
    handleFileSelect,
    handleDrop: handleAttachmentDrop,
    handleRemove: handleAttachmentRemove,
  } = useAttachments({
    attachments: formState.attachments as any,
    onUpdate: (attachments) => updateFormField('attachments', attachments as Attachment[]),
    disabled: false,
  });

  // ──── Validation ────

  const isStepValid = useCallback((stepId: StepId): boolean => {
    const validator = stepValidators[stepId];
    if (!validator) return true;
    return validator(formState);
  }, [formState]);

  const getStepError = useCallback((stepId: StepId): boolean => {
    const validator = stepValidators[stepId];
    if (!validator) return false;
    return !validator(formState);
  }, [formState]);

  const stepErrors = useMemo(() => {
    const errors: Partial<Record<StepId, boolean>> = {};

    (Object.keys(stepValidators) as StepId[]).forEach((stepId) => {
      const isValid = stepValidators[stepId](formState);
      if (!isValid) {
        errors[stepId] = true; // Just track if step has error, no message needed
      }
    });

    return errors;
  }, [formState, stepValidators]);

  const isValid = useMemo(() => {
    return formState.title.trim().length > 0 && formState.shortDescription.trim().length > 0;
  }, [formState.title, formState.shortDescription]);

  // ──── Submit ────

  const submitForm = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const { defaultBoardId } = useTaskSidebarStore.getState();
      const boardId = formState.boardId || defaultBoardId || 'board-1';
      const taskData = {
        boardId: boardId,
        title: formState.title.trim(),
        shortDescription: formState.shortDescription.trim(),
        description: formState.description?.trim() || '',
        columnId: formState.columnId,
        priority: formState.priority,
        type: formState.type,
        labels: formState.labels,
        milestoneIds: formState.milestoneIds,
        projectIds: formState.projectIds,
        startDate: formState.startDate || null,
        dueDate: formState.dueDate || null,
        reminderDate: formState.reminderDate || null,
        estimatedHours: formState.estimatedHours ?? null,
        attachments: formState.attachments,
        relatedTaskIds: formState.relatedTaskIds,
        assigneeId: formState.assigneeId || null,
      };

      await addTask(taskData as any);
      onSuccess();
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [formState, addTask, onSuccess, isValid, isSubmitting]);

  // ──── Reset ────

  const resetForm = useCallback(() => {
    setFormState(initialState);
    setIsSubmitting(false);
  }, []);

  // ──── Computed Values ────

  const durationDays = useMemo(() => {
    if (formState.startDate && formState.dueDate && formState.startDate <= formState.dueDate) {
      return Math.ceil(
        (formState.dueDate.getTime() - formState.startDate.getTime()) / (1000 * 60 * 60 * 24)
      );
    }
    return null;
  }, [formState.startDate, formState.dueDate]);

  const shortDescriptionCharCount = useMemo(() => {
    return formState.shortDescription.length;
  }, [formState.shortDescription]);

  const isShortDescriptionOverLimit = useMemo(() => {
    return shortDescriptionCharCount > 200;
  }, [shortDescriptionCharCount]);

  const titleCharCount = useMemo(() => {
    return formState.title.length;
  }, [formState.title]);

  const isTitleOverLimit = useMemo(() => {
    return titleCharCount > 100;
  }, [titleCharCount]);

  // ──── Return ────

  return {
    // State
    formState,
    isSubmitting,

    // Actions
    updateFormField,
    updateFormFields,
    submitForm,
    resetForm,

    // Validation
    isValid,
    isStepValid,
    getStepError,
    stepErrors,

    // Attachments
    fileInputRef,
    handleAttachmentClick,
    handleFileSelect,
    handleAttachmentDrop,
    handleAttachmentRemove,

    // Computed
    durationDays,
    shortDescriptionCharCount,
    isShortDescriptionOverLimit,
    titleCharCount,
    isTitleOverLimit,
  };
};