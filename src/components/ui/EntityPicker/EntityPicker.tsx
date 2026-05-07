import React, { useRef } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';
import { Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useEntityPicker } from './hooks/useEntityPicker';
import { useClickOutside } from './hooks/useClickOutside';
import { EntityPickerDropdown } from './components/EntityPickerDropdown';
import { EntityBadge } from './components/EntityBadge';
import { DEFAULT_COLORS } from './utils';
import { EntityPickerProps } from './entityPicker.types';

export const EntityPicker: React.FC<EntityPickerProps> = (props) => {
  const {
    className,
    disabled = false,
    label = 'Items',
    icon,
    renderBadge,
    showColorPicker = false,
    presetColors = DEFAULT_COLORS,
    searchPlaceholder,
    createPlaceholder,
    placeholder = 'No items selected',
    cardPlaceholder = 'Click to select...',
    onCreate,
    onDelete,
    onToggle,
    renderItem,
    compact = false,
  } = props;

  const { isDarkMode } = useApp();
  const ref = useRef<HTMLDivElement>(null);

  const {
    isOpen,
    showCreate,
    newName,
    newColor,
    searchQuery,
    filteredItems,
    selectedItems,
    hasSelected,
    setNewName,
    setNewColor,
    setSearchQuery,
    setShowCreate,
    toggle,
    close,
    handleCreate,
    resetCreateForm,
  } = useEntityPicker(props);

  useClickOutside(ref, close);

  // Disabled mode: just show badges inline
  if (disabled) {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {selectedItems.map((item) => (
          <div key={item.id}>
            <EntityBadge item={item} renderBadge={renderBadge} />
          </div>
        ))}
        {selectedItems.length === 0 && (
          <span className="text-xs text-gray-400">—</span>
        )}
      </div>
    );
  }

  const settingsButton = (
    <button
      type="button"
      onClick={toggle}
      className={cn(
        'w-7 h-7 flex items-center justify-center rounded-lg',
        'transition-all duration-200 group',
        'flex-shrink-0',
        isDarkMode
          ? 'hover:bg-gray-700 text-gray-500 hover:text-gray-300'
          : 'hover:bg-gray-100 text-gray-400 hover:text-gray-600'
      )}
    >
      {icon || (
        <Settings
          size={13}
          className="group-hover:rotate-90 transition-transform duration-300"
        />
      )}
    </button>
  );

  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Card Container */}
      <div
        className={cn(
          'rounded-xl border overflow-hidden transition-all duration-200',
          isDarkMode
            ? 'border-gray-700/50 hover:border-gray-600'
            : 'bg-white border-gray-200 hover:border-gray-300 shadow-sm',
          compact ? 'rounded-lg' : 'rounded-xl'
        )}
      >
        {/* Header */}
        <div className={cn(
          'flex items-center justify-between',
          compact ? 'px-3 py-1.5' : 'px-4 py-2.5'
        )}>
          <span className={cn(
            'font-medium',
            compact ? 'text-[11px]' : 'text-xs',
            isDarkMode ? 'text-gray-400' : 'text-gray-600'
          )}>
            {label}
          </span>
          
          <Tooltip.Provider>
            <Tooltip.Root delayDuration={300}>
              <Tooltip.Trigger asChild>
                {settingsButton}
              </Tooltip.Trigger>
              <Tooltip.Portal>
                <Tooltip.Content
                  side="bottom"
                  sideOffset={8}
                  className={cn(
                    'rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border z-[9999]',
                    isDarkMode
                      ? 'bg-gray-800 border-gray-700 text-gray-200'
                      : 'bg-white border-gray-200 text-gray-700'
                  )}
                >
                  Manage {label.toLowerCase()}
                  <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
                </Tooltip.Content>
              </Tooltip.Portal>
            </Tooltip.Root>
          </Tooltip.Provider>
        </div>

        {/* Divider */}
        <div className={cn(
          'border-t',
          isDarkMode ? 'border-gray-700/50' : 'border-gray-100'
        )} />

        {/* Body */}
        <div className={cn(
          compact ? 'px-3 py-2' : 'px-4 py-3',
          hasSelected ? '' : 'min-h-[2.5rem]'
        )}>
          {hasSelected ? (
            <div className="flex flex-wrap gap-1.5">
              {selectedItems.map((item) => (
                <div key={item.id}>
                  <EntityBadge item={item} renderBadge={renderBadge} />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[2rem]">
              <p className={cn(
                compact ? 'text-[11px]' : 'text-xs',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
              )}>
                {cardPlaceholder}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dropdown */}
      <EntityPickerDropdown
        isOpen={isOpen}
        searchQuery={searchQuery}
        filteredItems={filteredItems}
        selectedIds={props.selectedIds}
        showCreate={showCreate}
        newName={newName}
        newColor={newColor}
        showColorPicker={showColorPicker}
        presetColors={presetColors}
        isDarkMode={isDarkMode}
        searchPlaceholder={searchPlaceholder}
        createPlaceholder={createPlaceholder}
        onCreate={onCreate}
        onToggle={onToggle}
        onDelete={onDelete}
        renderItem={renderItem}
        onSearchChange={setSearchQuery}
        onShowCreate={() => setShowCreate(true)}
        onCloseCreate={resetCreateForm}
        onNameChange={setNewName}
        onColorChange={setNewColor}
        onHandleCreate={handleCreate}
      />
    </div>
  );
};

EntityPicker.displayName = 'EntityPicker';