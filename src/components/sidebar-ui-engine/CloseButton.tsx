import React from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CloseButtonProps {
  onClick: () => void;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid';
  className?: string;
}

const sizeMap = {
  sm: { button: 'p-1', icon: 14 },
  md: { button: 'p-1.5', icon: 18 },
  lg: { button: 'p-2', icon: 22 },
};

export const CloseButton: React.FC<CloseButtonProps> = ({
  onClick,
  size = 'md',
  variant = 'ghost',
  className,
  isDarkMode
}) => {
  const { button, icon } = sizeMap[size];
  return (
    <button
      onClick={onClick}
      type="button"
      aria-label="Close"
      className={cn(
        'rounded-lg transition-colors flex items-center justify-center',
        button,
        variant === 'solid'
          ? isDarkMode
            ? 'bg-gray-700 text-gray-200 hover:bg-gray-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-400'
          : isDarkMode
            ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-600'
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-900',
        className
      )}
    >
      <X size={icon} />
    </button>
  );
};