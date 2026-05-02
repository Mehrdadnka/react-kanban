// src/features/sidebar/components/MinimizeButton.tsx
import React from 'react';
import { Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MinimizeButtonProps {
  onClick: () => void;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: { button: 'p-1', icon: 14 },
  md: { button: 'p-1.5', icon: 18 },
  lg: { button: 'p-2', icon: 22 },
};

export const MinimizeButton: React.FC<MinimizeButtonProps> = ({
  onClick,
  isDarkMode = false,
  size = 'md',
  className,
}) => {
  const { button, icon } = sizeMap[size];

  return (
    <button
      onClick={onClick}
      type="button"
      aria-label="Minimize"
      className={cn(
        'rounded-lg transition-colors flex items-center justify-center',
        button,
        isDarkMode
          ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
          : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100',
        className
      )}
    >
      <Minus size={icon} />
    </button>
  );
};