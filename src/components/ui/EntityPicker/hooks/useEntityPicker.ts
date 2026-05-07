import { useState, useCallback, useMemo } from 'react';
import { EntityPickerProps } from '../entityPicker.types';
import { DEFAULT_COLORS, filterItemsBySearch, getSelectedItems } from '../utils';

export const useEntityPicker = (props: EntityPickerProps) => {
  const {
    items,
    selectedIds,
    onCreate,
    presetColors = DEFAULT_COLORS,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(presetColors[0]);
  const [searchQuery, setSearchQuery] = useState('');

  // Memoized values
  const filteredItems = useMemo(
    () => filterItemsBySearch(items, searchQuery),
    [items, searchQuery]
  );

  const selectedItems = useMemo(
    () => getSelectedItems(items, selectedIds),
    [items, selectedIds]
  );

  const hasSelected = selectedItems.length > 0;

  // Handlers
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => {
    setIsOpen(false);
    setShowCreate(false);
    setSearchQuery('');
  }, []);

  const handleCreate = useCallback(async () => {
    if (!newName.trim() || !onCreate) return false;
    
    const id = await onCreate(newName.trim(), newColor);
    if (id) {
      props.onToggle(id);
      setNewName('');
      setNewColor(presetColors[0]);
      setShowCreate(false);
      return true;
    }
    return false;
  }, [newName, newColor, onCreate, props.onToggle, presetColors]);

  const resetCreateForm = useCallback(() => {
    setShowCreate(false);
    setNewName('');
    setNewColor(presetColors[0]);
  }, [presetColors]);

  return {
    // State
    isOpen,
    showCreate,
    newName,
    newColor,
    searchQuery,
    filteredItems,
    selectedItems,
    hasSelected,

    // Setters
    setNewName,
    setNewColor,
    setSearchQuery,
    setShowCreate,

    // Actions
    toggle,
    close,
    handleCreate,
    resetCreateForm,
  };
};