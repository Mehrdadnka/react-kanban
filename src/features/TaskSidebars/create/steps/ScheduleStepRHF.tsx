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
      workingHoursStart={watch('workingHoursStart') || '09:00'}
      workingHoursEnd={watch('workingHoursEnd') || '17:00'}
      onDueDateChange={(date) => setValue('dueDate', date, { shouldValidate: true })}
      onReminderDateChange={(date) => setValue('reminderDate', date, { shouldValidate: true })}
      onWorkingHoursChange={(start, end) => {
        setValue('workingHoursStart', start, { shouldValidate: false });
        setValue('workingHoursEnd', end, { shouldValidate: false });
      }}
      isDarkMode={isDarkMode}
    />
  );
};

ScheduleStepRHF.displayName = 'ScheduleStepRHF';