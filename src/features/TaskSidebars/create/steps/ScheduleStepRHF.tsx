// src/features/TaskSidebars/create/steps/ScheduleStepRHF.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { TaskFormValues } from '../schemas/task.schema';
import { ScheduleStep } from './ScheduleStep';

interface ScheduleStepRHFProps {
  isDarkMode?: boolean;
}

export const ScheduleStepRHF: React.FC<ScheduleStepRHFProps> = ({ isDarkMode }) => {
  const { watch, setValue } = useFormContext<TaskFormValues>();
  
  return (
    <ScheduleStep
      startDate={watch('startDate') || undefined}
      dueDate={watch('dueDate') || undefined}
      reminderDate={watch('reminderDate') || undefined}
      onStartDateChange={(date) => setValue('startDate', date, { shouldValidate: true })}
      onDueDateChange={(date) => setValue('dueDate', date, { shouldValidate: true })}
      onReminderDateChange={(date) => setValue('reminderDate', date, { shouldValidate: true })}
      isDarkMode={isDarkMode}
    />
  );
};

ScheduleStepRHF.displayName = 'ScheduleStepRHF';