// features/BoardSidebars/create/steps/AppearanceStepRHF.tsx
import React from 'react';
import { useFormContext } from 'react-hook-form';
import { BoardFormValues } from '../../schemas/board.schema';
import { AppearanceStep } from './AppearanceStep';

interface AppearanceStepRHFProps {
  isDarkMode?: boolean;
}

export const AppearanceStepRHF: React.FC<AppearanceStepRHFProps> = ({ isDarkMode }) => {
  const { watch, setValue } = useFormContext<BoardFormValues>();
  
  return (
    <AppearanceStep
      color={watch('color')}
      icon={watch('icon')}
      boardName={watch('title')}
      onColorChange={(color) => setValue('color', color, { shouldValidate: true })}
      onIconChange={(icon) => setValue('icon', icon, { shouldValidate: true })}
      isDarkMode={isDarkMode}
    />
  );
};