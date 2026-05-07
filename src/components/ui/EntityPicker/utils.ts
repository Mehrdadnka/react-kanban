import { EntityItem } from './entityPicker.types';

export const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937',
];

export const filterItemsBySearch = (items: EntityItem[], query: string): EntityItem[] => {
  if (!query) return items;
  return items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  );
};

export const getSelectedItems = (items: EntityItem[], selectedIds: string[]): EntityItem[] => {
  return items.filter(item => selectedIds.includes(item.id));
};