import React from 'react';
import { EntityItem } from './EntityItem';
import { EntityItemType } from '../entityPicker.types';
import { cn } from '@/lib/utils';

interface EntityListProps {
  items: EntityItemType[];
  selectedIds: string[];
  isDarkMode: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  renderItem?: (item: EntityItemType, isSelected: boolean) => React.ReactNode;
  searchQuery?: string;
  variant?: 'list' | 'grid'; 
  gridColumns?: number;
}

export const EntityList: React.FC<EntityListProps> = ({
  items,
  selectedIds,
  isDarkMode,
  onToggle,
  onDelete,
  renderItem,
  searchQuery,
  variant = 'list',
  gridColumns = 4,
}) => {
  if (items.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-2">
        {searchQuery ? 'No matches found' : 'No items yet'}
      </p>
    );
  }

  // Grid mode for color pickers, icon pickers, etc.
  if (variant === 'grid') {
    return (
      <div className={cn(
        'grid gap-1.5 mb-2 max-h-[200px] overflow-auto p-2',
        gridColumns === 10 && 'grid-cols-10',
        gridColumns === 8 && 'grid-cols-8',
        gridColumns === 6 && 'grid-cols-6',
        gridColumns === 5 && 'grid-cols-5',
        gridColumns === 4 && 'grid-cols-4',
        gridColumns === 3 && 'grid-cols-3',
      )}>
        {items.map((item) => (
          <EntityItem
            key={item.id}
            item={item}
            isSelected={selectedIds.includes(item.id)}
            isDarkMode={isDarkMode}
            onToggle={onToggle}
            onDelete={onDelete}
            renderItem={renderItem}
            variant="grid"
          />
        ))}
      </div>
    );
  }

  // Default list mode
  return (
    <div className="space-y-0.5 max-h-40 overflow-y-auto mb-2">
      {items.map((item) => (
        <EntityItem
          key={item.id}
          item={item}
          isSelected={selectedIds.includes(item.id)}
          isDarkMode={isDarkMode}
          onToggle={onToggle}
          onDelete={onDelete}
          renderItem={renderItem}
          variant="list"
        />
      ))}
    </div>
  );
};