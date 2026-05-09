// features/BoardSidebars/create/steps/BasicInfoStepRHF.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BoardFormValues } from '../../schemas/board.schema';
import { BasicInfoStep } from './BasicInfoStep';

interface BasicInfoStepRHFProps {
  isDarkMode?: boolean;
}

export const BasicInfoStepRHF: React.FC<BasicInfoStepRHFProps> = ({ isDarkMode }) => {
  const { watch, setValue } = useFormContext<BoardFormValues>();
  
  return (
    <BasicInfoStep
      title={watch('title')}
      description={watch('description')}
      onTitleChange={(value) => setValue('title', value, { shouldValidate: true })}
      onDescriptionChange={(value) => setValue('description', value, { shouldValidate: true })}
      isDarkMode={isDarkMode}
    />
  );
};