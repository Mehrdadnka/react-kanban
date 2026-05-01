import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select/Select';
import { Label } from '@/components/ui/label/Label';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface SelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SidebarSelectProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  disabled?: boolean;
  placeholder?: string;
}

export const SidebarSelect: React.FC<SidebarSelectProps> = ({
  id,
  label,
  value,
  onValueChange,
  options,
  disabled = false,
  placeholder,
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
      <Select
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        <SelectTrigger 
          id={id}
          className={cn(
            "mt-1.5",
            isDarkMode 
              ? "bg-gray-800 border-gray-700 text-gray-100" 
              : "bg-white border-gray-300 text-gray-900"
          )}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent 
          className={cn(
            'z-[9999]',
            isDarkMode 
              ? "bg-gray-800 border-gray-700 text-gray-100" 
              : "bg-white border-gray-200 text-gray-900"
          )}
        >
          {options.map((option) => (
            <SelectItem 
              key={option.value}
              value={option.value}
              className={cn(
                "cursor-pointer",
                isDarkMode 
                  ? "hover:bg-gray-700 focus:bg-gray-700" 
                  : "hover:bg-gray-100 focus:bg-gray-100"
              )}
            >
              <div className="flex items-center gap-2">
                {option.icon}
                {option.label}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};