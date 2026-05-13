// components/ui/EntityPicker/components/EntityItem.tsx
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
  variant?: 'list' | 'grid';
}

export const EntityItem: React.FC<EntityItemProps> = ({
  item,
  isSelected,
  isDarkMode,
  onToggle,
  onDelete,
  renderItem,
  variant = 'list',
}) => {
  if (renderItem) return <>{renderItem(item, isSelected)}</>;

  // Grid variant - compact, centered
  if (variant === 'grid') {
    return (
      <button
        type="button"
        onClick={() => onToggle(item.id)}
        className={cn(
          "flex items-center justify-center rounded-lg transition-all duration-200",
          "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500",
          isSelected && "ring-2 ring-blue-500 scale-105",
          isDarkMode
            ? "hover:bg-gray-700"
            : "hover:bg-gray-100"
        )}
        title={item.name}
      >
        {item.color && (
          <div
            className="w-8 h-8 rounded-md ring-1 ring-inset ring-black/10"
            style={{ backgroundColor: item.color }}
          />
        )}
        {item.icon && (
          <div className="p-2">
            {item.icon}
          </div>
        )}
      </button>
    );
  }

  // Default list variant (existing code)
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