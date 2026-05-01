// src/components/sidebar-ui-engine/SidebarInput.tsx
import React from 'react';
import { Input } from '@/components/ui/input/Input';
import { Label } from '@/components/ui/label/Label';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SidebarInputProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>; 
}

export const SidebarInput: React.FC<SidebarInputProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  inputRef,  // rename to avoid conflict
}) => {
  const { isDarkMode } = useApp();

  return (
    <div>
      <Label 
        htmlFor={id}
        className={cn(isDarkMode ? "text-gray-300" : "text-gray-700")}
      >
        {label}
      </Label>
      <Input
        ref={inputRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'mt-1.5 text-base',
          disabled && 'bg-transparent border-transparent px-0',
          isDarkMode && !disabled && 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
        )}
      />
    </div>
  );
};