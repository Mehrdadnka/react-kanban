import React from 'react';
import { QuickCreate } from '@/features/TaskSidebars/components/quickCreate/QuickCreate';
import { TaskType, TaskPriority } from '@/types/task.types';

// Define what fields BasicInfoStep needs
interface BasicInfoFields {
  title: string;
  shortDescription: string;
  type: TaskType;
  priority: TaskPriority;
  columnId: string;
  labels: string[];
  milestoneIds: string[];
  projectIds: string[];
}

interface BasicInfoStepProps {
  isViewMode: boolean;
  inputRef: React.RefObject<HTMLInputElement | null>;
  formState: BasicInfoFields;
  // Accept a generic field update function
  updateFormField: (field: string, value: any) => void;
}

export const BasicInfoStep: React.FC<BasicInfoStepProps> = ({ 
  isViewMode, 
  inputRef, 
  formState, 
  updateFormField 
}) => {
  return (
    <QuickCreate 
      isViewMode={isViewMode} 
      inputRef={inputRef} 
      formState={formState} 
      updateFormField={updateFormField} 
    />
  );
};

BasicInfoStep.displayName = 'BasicInfoStep';