import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TaskFormValues } from '../schemas/task.schema';
import { DetailsStep } from './DetailsStep';

interface DetailsStepRHFProps {
  isDarkMode?: boolean;
}

export const DetailsStepRHF: React.FC<DetailsStepRHFProps> = ({ isDarkMode }) => {
  const { watch, setValue } = useFormContext<TaskFormValues>();
  
  return (
    <DetailsStep
      value={watch('description')}
      onChange={(value) => setValue('description', value, { shouldValidate: true })}
      isDarkMode={isDarkMode}
    />
  );
};

DetailsStepRHF.displayName = 'DetailsStepRHF';