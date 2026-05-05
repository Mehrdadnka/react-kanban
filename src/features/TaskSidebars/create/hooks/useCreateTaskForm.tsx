import { useState, useCallback, useMemo } from 'react';
import { TaskType, TaskPriority } from '@/types/task.types';
import { useTaskStore } from '@/stores/task.store';
import { useAttachments } from './useAttachments';
import { StepId } from '@/stores/sidebar-engine/task-sidebar.store';

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

// ──── Step Validators ────

const stepValidators: Record<StepId, (state: FormState) => { valid: boolean; error?: string }> = {
  'quick-create': (state) => {
    if (!state.title.trim()) {
      return { valid: false, error: 'Title is required' };
    }
    if (state.title.length > 100) {
      return { valid: false, error: 'Title must be under 100 characters' };
    }
    if (!state.shortDescription.trim()) {
      return { valid: false, error: 'Short description is required' };
    }
    if (state.shortDescription.length > 200) {
      return { valid: false, error: 'Short description must be under 200 characters' };
    }
    return { valid: true };
  },

  'full-details': () => {
    // Description is always optional
    return { valid: true };
  },

  'schedule': (state) => {
    // All date fields are optional, but if both are set, validate order
    if (state.startDate && state.dueDate && state.startDate > state.dueDate) {
      return { valid: false, error: 'Start date must be before due date' };
    }
    return { valid: true };
  },

  'meta': (state) => {
    // Estimated hours must be positive if provided
    if (state.estimatedHours !== undefined && state.estimatedHours <= 0) {
      return { valid: false, error: 'Estimated hours must be greater than 0' };
    }
    if (state.estimatedHours !== undefined && state.estimatedHours > 1000) {
      return { valid: false, error: 'Estimated hours seems too high' };
    }
    return { valid: true };
  },
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
    return validator(formState).valid;
  }, [formState]);

  const getStepError = useCallback((stepId: StepId): string | undefined => {
    const validator = stepValidators[stepId];
    if (!validator) return undefined;
    return validator(formState).error;
  }, [formState]);

  const stepErrors = useMemo(() => {
    const errors: Partial<Record<StepId, string>> = {};

    (Object.keys(stepValidators) as StepId[]).forEach((stepId) => {
      const result = stepValidators[stepId](formState);
      if (!result.valid && result.error) {
        errors[stepId] = result.error;
      }
    });

    return errors;
  }, [formState]);

  const isValid = useMemo(() => {
    return formState.title.trim().length > 0 && formState.shortDescription.trim().length > 0;
  }, [formState.title, formState.shortDescription]);

  // ──── Submit ────

  const submitForm = useCallback(async () => {
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const taskData = {
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