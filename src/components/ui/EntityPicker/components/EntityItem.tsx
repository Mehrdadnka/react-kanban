import React from 'react';
import { CheckCircle, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EntityItem as EntityItemType } from '../entityPicker.types';

interface EntityItemProps {
  item: EntityItemType;
  isSelected: boolean;
  isDarkMode: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  renderItem?: (item: EntityItemType, isSelected: boolean) => React.ReactNode;
}

export const EntityItem: React.FC<EntityItemProps> = ({
  item,
  isSelected,
  isDarkMode,
  onToggle,
  onDelete,
  renderItem,
}) => {
  if (renderItem) return <>{renderItem(item, isSelected)}</>;

  return (
    <button
      type="button"
      onClick={() => onToggle(item.id)}
      className={cn(
        "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-left transition-colors group",
        isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
      )}
    >
      {item.color && (
        <div
          className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/10"
          style={{ backgroundColor: item.color }}
        />
      )}
      {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
      <span className="flex-1 truncate">{item.name}</span>
      {isSelected && (
        <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
      )}
      {onDelete && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(item.id);
          }}
          className="opacity-0 group-hover:opacity-100 hover:text-red-500 transition-opacity ml-auto"
        >
          <X size={12} />
        </button>
      )}
    </button>
  );
};