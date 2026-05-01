// src/components/sidebar-engine/SidebarTextarea.tsx
import React from 'react';
import { Textarea } from '@/components/ui/textarea/Textarea';
import { Label } from '@/components/ui/label/Label';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SidebarTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  rows?: number;
}

export const SidebarTextarea: React.FC<SidebarTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
  disabled = false,
  rows = 5,
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
      <Textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'mt-1.5 min-h-[100px]',
          disabled && 'bg-transparent border-transparent px-0 resize-none',
          isDarkMode && !disabled && 'bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500'
        )}
        rows={rows}
      />
    </div>
  );
};