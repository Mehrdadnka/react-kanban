// components/EntityPickerDropdown.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { EntitySearchInput } from './EntitySearchInput';
import { EntityList } from './EntityList';
import { EntityCreateForm } from './EntityCreateForm';
import { EntityItemType } from '../entityPicker.types';

interface EntityPickerDropdownProps {
  isOpen: boolean;
  searchQuery: string;
  filteredItems: EntityItemType[];
  selectedIds: string[];
  showCreate: boolean;
  newName: string;
  newColor: string;
  showColorPicker: boolean;
  presetColors: string[];
  isDarkMode: boolean;
  searchPlaceholder?: string;
  createPlaceholder?: string;
  onCreate?: Function;
  onToggle: (id: string) => void;
  onDelete?: (id: string) => void;
  renderItem?: (item: EntityItemType, isSelected: boolean) => React.ReactNode;
  onSearchChange: (value: string) => void;
  onShowCreate: () => void;
  onCloseCreate: () => void;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onHandleCreate: () => void;
}

export const EntityPickerDropdown: React.FC<EntityPickerDropdownProps> = ({
  isOpen,
  searchQuery,
  filteredItems,
  selectedIds,
  showCreate,
  newName,
  newColor,
  showColorPicker,
  presetColors,
  isDarkMode,
  searchPlaceholder,
  createPlaceholder,
  onCreate,
  onToggle,
  onDelete,
  renderItem,
  onSearchChange,
  onShowCreate,
  onCloseCreate,
  onNameChange,
  onColorChange,
  onHandleCreate,
}) => {
  if (!isOpen) return null;

  return (
    <div className={cn(
      "absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-xl border z-50 p-2",
      isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
    )}>
      {/* Search */}
      <div className="mb-2">
        <EntitySearchInput
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          isDarkMode={isDarkMode}
        />
      </div>

      {/* Items List */}
      <EntityList
        items={filteredItems}
        selectedIds={selectedIds}
        isDarkMode={isDarkMode}
        onToggle={onToggle}
        onDelete={onDelete}
        renderItem={renderItem}
        searchQuery={searchQuery}
      />

      {/* Create New */}
      {onCreate && (
        <EntityCreateForm
          isOpen={showCreate}
          newName={newName}
          newColor={newColor}
          showColorPicker={showColorPicker}
          presetColors={presetColors}
          isDarkMode={isDarkMode}
          createPlaceholder={createPlaceholder}
          onOpen={onShowCreate}
          onClose={onCloseCreate}
          onNameChange={onNameChange}
          onColorChange={onColorChange}
          onCreate={onHandleCreate}
        />
      )}
    </div>
  );
};