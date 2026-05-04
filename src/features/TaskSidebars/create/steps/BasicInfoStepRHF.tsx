// src/features/TaskSidebars/create/steps/BasicInfoStepRHF.tsx
import React, { useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { TaskFormValues } from '../schemas/task.schema';
import { SidebarInput } from '@/components/sidebar-ui-engine/SidebarInput';
import { SidebarSelect } from '@/components/sidebar-ui-engine/SidebarSelect';
import { QuickCreate } from '../../components/QuickCreate';
import { useColumnStore } from '@/stores/column.store';
import { StatusIcon } from '@/components/board/TaskSidebar/StatusIcon';

interface BasicInfoStepRHFProps {
  isDarkMode?: boolean;
}

export const BasicInfoStepRHF: React.FC<BasicInfoStepRHFProps> = ({ isDarkMode }) => {
  const { register, formState: { errors }, watch, setValue } = useFormContext<TaskFormValues>();
  const { columns } = useColumnStore();
  const inputRef = useRef<HTMLInputElement | null>(null);


  const watchedValues = watch();

  const dynamicColumnOptions = columns
    .sort((a, b) => a.order - b.order)
    .map(col => ({
      value: col.id,
      label: col.title,
      icon: <StatusIcon columnId={col.id} size={16} />,
    }));

  return (
    <QuickCreate
      isViewMode={false}
      inputRef={inputRef} // RHF handles focus internally
      formState={watchedValues}
      updateFormField={(field, value) => setValue(field as any, value)}
    />
  );
};