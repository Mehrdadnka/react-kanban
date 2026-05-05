import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntitySearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isDarkMode: boolean;
  autoFocus?: boolean;
}

export const EntitySearchInput: React.FC<EntitySearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search...',
  isDarkMode,
  autoFocus = true,
}) => {
  return (
    <div className="relative">
      <Search 
        size={12} 
        className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full pl-7 pr-2.5 py-1.5 rounded-lg border text-xs',
          isDarkMode
            ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
            : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
        )}
        autoFocus={autoFocus}
      />
    </div>
  );
};