import React from 'react';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntityItem } from '../entityPicker.types';

interface EntityPickerTriggerProps {
  hasSelected: boolean;
  selectedItems: EntityItem[];
  selectedIds: string[];
  placeholder?: string;
  icon?: React.ReactNode;
  isDarkMode: boolean;
  renderBadge?: (item: EntityItem) => React.ReactNode;
  onClick: () => void;
}

export const EntityPickerTrigger: React.FC<EntityPickerTriggerProps> = ({
  icon,
  isDarkMode,
  onClick,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-8 h-8 flex items-center justify-center rounded-lg',
        'transition-all duration-200 hover:shadow-sm group',
        isDarkMode
          ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200'
          : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
      )}
    >
      {icon || (
        <Settings
          size={14}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      )}
    </button>
  );
};