// src/features/TaskSidebars/create/steps/MetaStepRHF.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TaskFormValues } from '../schemas/task.schema';
import { MetaStep } from './MetaStep';

interface MetaStepRHFProps {
  isDarkMode?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onAttachmentClick: () => void;
  onFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onAttachmentDrop: (event: React.DragEvent) => void;
  onAttachmentRemove: (attachmentId: string) => void;
}

export const MetaStepRHF: React.FC<MetaStepRHFProps> = ({ 
  isDarkMode,
  fileInputRef,
  onAttachmentClick,
  onFileSelect,
  onAttachmentDrop,
  onAttachmentRemove,
}) => {
  const { watch, setValue } = useFormContext<TaskFormValues>();
  
  return (
    <MetaStep
      attachments={( watch('attachments') || [] ) as any}
      estimatedHours={watch('estimatedHours') || undefined}
      isViewMode={false}
      isDarkMode={isDarkMode}
      fileInputRef={fileInputRef}
      onAttachmentClick={onAttachmentClick}
      onFileSelect={onFileSelect}
      onAttachmentDrop={onAttachmentDrop}
      onAttachmentRemove={onAttachmentRemove}
      onEstimatedHoursChange={(hours) => setValue('estimatedHours', hours, { shouldValidate: true })}
    />
  );
};

MetaStepRHF.displayName = 'MetaStepRHF';