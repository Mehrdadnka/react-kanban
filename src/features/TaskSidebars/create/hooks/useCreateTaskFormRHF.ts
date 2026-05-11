// useCreateTaskFormRHF.ts - UPDATED
import { useCallback, useMemo } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTaskStore } from '@/stores/task.store';
import { useTaskSidebarStore } from '@/stores/sidebar-engine/task-sidebar.store'; // 🎯 ADD
import { useAttachments } from './useAttachments';
import { z } from 'zod';
import { 
  TaskFormValues, 
  taskFormSchema, 
  quickCreateSchema,
  detailsSchema,
  scheduleSchema,
  metaSchema 
} from '../schemas/task.schema';
import { StepId } from '@/stores/sidebar-engine/task-sidebar.store';
import { Attachment } from '@/types/task.types';

const defaultValues: TaskFormValues = {
  title: '',
  shortDescription: '',
  description: '',
  columnId: 'todo',
  priority: 'medium',
  type: 'task',
  labels: [],
  milestoneIds: [],
  projectIds: [],
  startDate: null,
  dueDate: null,
  reminderDate: null,
  estimatedHours: null,
  attachments: [],
  relatedTaskIds: [],
  assigneeId: null,
};

// Map steps to their validation schemas
const stepSchemas: Record<StepId, z.ZodType<any>> = {
  'quick-create': quickCreateSchema,
  'full-details': detailsSchema,
  'schedule': scheduleSchema,
  'meta': metaSchema,
};

export const useCreateTaskFormRHF = (onSuccess: () => void) => {
  const { addTask } = useTaskStore();

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskFormSchema) as Resolver<TaskFormValues>,
    defaultValues,
    mode: 'onChange',
  });

  const { 
    register, 
    handleSubmit, 
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    getValues,
    trigger,
    reset,
  } = form;

  // Watch specific fields for computed values
  const watchAttachments = watch('attachments');
  const watchStartDate = watch('startDate');
  const watchDueDate = watch('dueDate');
  const watchTitle = watch('title');
  const watchShortDesc = watch('shortDescription');

  // ──── Attachments Hook ────
  const {
    fileInputRef,
    handleClick: handleAttachmentClick,
    handleFileSelect,
    handleDrop: handleAttachmentDrop,
    handleRemove: handleAttachmentRemove,
  } = useAttachments({
    attachments: (watchAttachments || []) as any,
    onUpdate: (attachments) => setValue('attachments', attachments as any, { shouldValidate: true }),
    disabled: false,
  });

  // ──── Step Validation ────
  const validateStep = useCallback(async (stepId: StepId): Promise<boolean> => {
    const schema = stepSchemas[stepId];
    if (!schema) return true;

    const currentValues = getValues();
    const result = schema.safeParse(currentValues);
    
    if (!result.success) {
      if (schema instanceof z.ZodObject) {
        const fieldNames = Object.keys(schema.shape);
        await trigger(fieldNames as any);
      }
      return false;
    }
    
    return true;
  }, [getValues, trigger]);

  // ──── Get step-specific errors ────
  const getStepErrors = useCallback((stepId: StepId): Record<string, any> | null => {
    const stepErrorFields: Record<StepId, string[]> = {
      'quick-create': ['title', 'shortDescription', 'type', 'priority', 'columnId'],
      'full-details': ['description'],
      'schedule': ['startDate', 'dueDate', 'reminderDate'],
      'meta': ['attachments', 'estimatedHours', 'relatedTaskIds', 'assigneeId'],
    };

    const fields = stepErrorFields[stepId] || [];
    const stepErrors: Record<string, any> = {};

    fields.forEach(field => {
      if (errors[field as keyof TaskFormValues]) {
        stepErrors[field] = errors[field as keyof TaskFormValues];
      }
    });

    return Object.keys(stepErrors).length > 0 ? stepErrors : null;
  }, [errors]);

  // ──── Submit Handler ────
  const submitForm = useCallback(async () => {
    await handleSubmit(async (data: TaskFormValues) => {
      try {
        // 🎯 GET boardId from sidebar store
        const { defaultBoardId } = useTaskSidebarStore.getState();
        const boardId = defaultBoardId || 'board-1'; // Fallback
        
        console.log('📝 Creating task with boardId:', boardId);
        
        const taskData = {
          title: data.title.trim(),
          shortDescription: data.shortDescription.trim(),
          description: data.description?.trim() || '',
          columnId: data.columnId,
          priority: data.priority,
          type: data.type,
          labels: data.labels,
          milestoneIds: data.milestoneIds,
          projectIds: data.projectIds,
          startDate: data.startDate || null,
          dueDate: data.dueDate || null,
          workingHoursStart: data.workingHoursStart || undefined,
          workingHoursEnd: data.workingHoursEnd || undefined,
          reminderDate: data.reminderDate || null,
          estimatedHours: data.estimatedHours ?? null,
          boardId: boardId, // 🎯 ADD boardId
          attachments: data.attachments || [],
          relatedTaskIds: data.relatedTaskIds || [],
          assigneeId: data.assigneeId || null,
        };

        await addTask(taskData as any);
        console.log('✅ Task created successfully:', taskData);
        reset(defaultValues);
        onSuccess();
      } catch (error) {
        console.error('❌ Failed to create task:', error);
      }
    })();
  }, [handleSubmit, addTask, onSuccess, reset]);

  // ──── Computed Values ────
  const computed = useMemo(() => ({
    durationDays: watchStartDate && watchDueDate && watchStartDate <= watchDueDate
      ? Math.ceil((watchDueDate.getTime() - watchStartDate.getTime()) / (1000 * 60 * 60 * 24))
      : null,
    titleCharCount: watchTitle.length,
    shortDescriptionCharCount: watchShortDesc.length,
    isTitleOverLimit: watchTitle.length > 100,
    isShortDescriptionOverLimit: watchShortDesc.length > 200,
  }), [watchStartDate, watchDueDate, watchTitle, watchShortDesc]);

  return {
    // React Hook Form API
    form,
    register,
    handleSubmit,
    errors,
    isSubmitting,
    isValid,
    watch,
    setValue,
    getValues,
    trigger,
    reset,

    // Custom methods
    validateStep,
    getStepErrors,
    submitForm,

    // Attachments (UI-specific)
    fileInputRef,
    handleAttachmentClick,
    handleFileSelect,
    handleAttachmentDrop,
    handleAttachmentRemove,

    // Computed values
    ...computed,
  };
};