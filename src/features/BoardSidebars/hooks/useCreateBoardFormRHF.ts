// features/BoardSidebars/hooks/useCreateBoardFormRHF.ts
import { useCallback, useMemo } from 'react';
import { Resolver, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBoardStore } from '@/stores/board.store';
import { 
  BoardFormValues, 
  boardFormSchema,
  basicInfoSchema,
  appearanceSchema 
} from '../schemas/board.schema';
import { BoardStepId } from '@/stores/sidebar-engine/board-sidebar.store';
import { z } from 'zod';

const defaultValues: BoardFormValues = {
  title: '',
  description: '',
  color: '#6366f1',
  icon: 'Rocket',
};

const stepSchemas: Record<BoardStepId, z.ZodType<any>> = {
  'basic-info': basicInfoSchema,
  'appearance': appearanceSchema,
  'settings': z.object({}), // Empty schema for now
};

export const useCreateBoardFormRHF = (onSuccess: () => void) => {
  const { addBoard } = useBoardStore();

  const form = useForm<BoardFormValues>({
    resolver: zodResolver(boardFormSchema) as Resolver<BoardFormValues>,
    defaultValues,
    mode: 'onChange',
  });

  const { 
    handleSubmit, 
    formState: { errors, isSubmitting, isValid },
    watch,
    setValue,
    getValues,
    trigger,
    reset,
  } = form;

  // Watchers
  const watchTitle = watch('title');
  const watchDescription = watch('description');
  const watchColor = watch('color');
  const watchIcon = watch('icon');

  // Step Validation
  const validateStep = useCallback(async (stepId: BoardStepId): Promise<boolean> => {
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

  // Get step-specific errors
  const getStepErrors = useCallback((stepId: BoardStepId): Record<string, any> | null => {
    const stepErrorFields: Record<BoardStepId, string[]> = {
      'basic-info': ['title', 'description'],
      'appearance': ['color', 'icon'],
      'settings': [],
    };

    const fields = stepErrorFields[stepId] || [];
    const stepErrors: Record<string, any> = {};

    fields.forEach(field => {
      if (errors[field as keyof BoardFormValues]) {
        stepErrors[field] = errors[field as keyof BoardFormValues];
      }
    });

    return Object.keys(stepErrors).length > 0 ? stepErrors : null;
  }, [errors]);

  // Submit Handler
  const submitForm = useCallback(async () => {
    await handleSubmit(async (data: BoardFormValues) => {
      try {
        await addBoard({
          title: data.title.trim(),
          description: data.description?.trim() || '',
          color: data.color,
          icon: data.icon,
        });
        reset(defaultValues);
        onSuccess();
      } catch (error) {
        console.error('Failed to create board:', error);
      }
    })();
  }, [handleSubmit, addBoard, onSuccess, reset]);

  // Computed Values
  const computed = useMemo(() => ({
    titleCharCount: watchTitle.length,
    isTitleOverLimit: watchTitle.length > 100,
    descriptionCharCount: watchDescription.length,
    isDescriptionOverLimit: watchDescription.length > 500,
  }), [watchTitle, watchDescription]);

  return {
    form,
    errors,
    isSubmitting,
    isValid,
    watch,
    setValue,
    getValues,
    trigger,
    reset,
    validateStep,
    getStepErrors,
    submitForm,
    ...computed,
  };
};