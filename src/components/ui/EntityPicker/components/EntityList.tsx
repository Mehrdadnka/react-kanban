import React from 'react';
import { EntityItem } from './EntityItem';
import { EntityItemType } from '../entityPicker.types';

interface EntityListProps {
  items: EntityItemType[];
  selectedIds: string[];
  isDarkMode: boolean;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  renderItem?: (item: EntityItemType, isSelected: boolean) => React.ReactNode;
  searchQuery?: string;
}

export const EntityList: React.FC<EntityListProps> = ({
  items,
  selectedIds,
  isDarkMode,
  onToggle,
  onDelete,
  renderItem,
  searchQuery,
}) => {
  if (items.length === 0) {
    return (
      <p className="text-xs text-gray-400 text-center py-2">
        {searchQuery ? 'No matches found' : 'No items yet'}
      </p>
    );
  }

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
        />
      ))}
    </div>
  );
};