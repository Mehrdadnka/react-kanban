export interface EntityItem {
  id: string;
  name: string;
  color?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export type EntityItemType = EntityItem;

export interface EntityPickerProps {
  items: EntityItem[];
  isTopPosition: boolean;
  listVariant?: 'list' | 'grid'; 
  gridColumns?: number;
  selectedIds: string[];
  onToggle: (id: string) => void;
  onCreate?: (name: string, color?: string, metadata?: Record<string, any>) => string | Promise<string>;
  onDelete?: (id: string) => void;
  
  placeholder?: string;
  cardPlaceholder?: string;  // NEW: placeholder inside card body
  searchPlaceholder?: string;
  createPlaceholder?: string;
  label?: string;
  icon?: React.ReactNode;
  showColorPicker?: boolean;
  presetColors?: string[];
  className?: string;
  disabled?: boolean;
  compact?: boolean;  // NEW: smaller padding/sizes
  
  renderItem?: (item: EntityItem, isSelected: boolean) => React.ReactNode;
  renderBadge?: (item: EntityItem) => React.ReactNode;
  showAsSettingsButton?: boolean;  // DEPRECATED: kept for backward compatibility, now always card mode
}