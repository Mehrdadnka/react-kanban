import React from 'react';
import { EntityItem } from '../entityPicker.types';

interface EntityBadgeProps {
  item: EntityItem;
  renderBadge?: (item: EntityItem) => React.ReactNode;
}

export const EntityBadge: React.FC<EntityBadgeProps> = ({ item, renderBadge }) => {
  if (renderBadge) return <>{renderBadge(item)}</>;
  
  return (
    <span
      className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
      style={{ backgroundColor: item.color || '#6B7280' }}
    >
      {item.name}
    </span>
  );
};