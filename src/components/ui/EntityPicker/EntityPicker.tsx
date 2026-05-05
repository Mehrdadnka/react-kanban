// src/components/ui/EntityPicker/EntityPicker.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, CheckCircle, Search, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import * as Tooltip from '@radix-ui/react-tooltip';
import { IconButton } from '@radix-ui/themes';

// ──── Types ────
export interface EntityItem {
  id: string;
  name: string;
  color?: string;
  icon?: React.ReactNode;
  metadata?: Record<string, any>;
}

export interface EntityPickerProps {
  // Data
  items: EntityItem[];
  selectedIds: string[];
  
  // Events
  onToggle: (id: string) => void;
  onCreate?: (name: string, color?: string, metadata?: Record<string, any>) => string | Promise<string>;
  onDelete?: (id: string) => void;
  
  // UI Config
  placeholder?: string;
  searchPlaceholder?: string;
  createPlaceholder?: string;
  label?: string;
  icon?: React.ReactNode;
  showColorPicker?: boolean;
  presetColors?: string[];
  className?: string;
  disabled?: boolean;
  
  // Display
  renderItem?: (item: EntityItem, isSelected: boolean) => React.ReactNode;
  renderBadge?: (item: EntityItem) => React.ReactNode;
  
  // New: Show as settings gear when empty
  showAsSettingsButton?: boolean;
}

// ──── Default Preset Colors ────
const DEFAULT_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937',
];

// ──── Component ────
export const EntityPicker: React.FC<EntityPickerProps> = ({
  items,
  selectedIds,
  onToggle,
  onCreate,
  onDelete,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  createPlaceholder = 'Name...',
  label = 'Items',
  icon,
  showColorPicker = false,
  presetColors = DEFAULT_COLORS,
  className,
  disabled = false,
  renderItem,
  renderBadge,
  showAsSettingsButton = false,
}) => {
  const { isDarkMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(presetColors[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCreate(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter items by search
  const filteredItems = searchQuery
    ? items.filter(item => item.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : items;

  // Get selected items
  const selectedItems = items.filter(item => selectedIds.includes(item.id));

  // Handle create
  const handleCreate = async () => {
    if (!newName.trim() || !onCreate) return;
    const id = await onCreate(newName.trim(), newColor);
    if (id) {
      onToggle(id);
      setNewName('');
      setNewColor(presetColors[0]);
      setShowCreate(false);
    }
  };

  // Default renderers
  const defaultRenderItem = (item: EntityItem, isSelected: boolean) => (
    <button
      key={item.id}
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

  const defaultRenderBadge = (item: EntityItem) => (
    <span
      className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
      style={{ backgroundColor: item.color || '#6B7280' }}
    >
      {item.name}
    </span>
  );

  // Disabled mode: just show badges
  if (disabled) {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {selectedItems.map(item => (
          <div key={item.id}>
            {renderBadge ? renderBadge(item) : defaultRenderBadge(item)}
          </div>
        ))}
      </div>
    );
  }

  const hasSelected = selectedItems.length > 0;

  // ──── Settings button mode (like GitHub) ────
  if (showAsSettingsButton && !hasSelected) {
    return (
      <div ref={ref} className={cn('relative flex items-center justify-between', className)}>
        <Tooltip.TooltipProvider>

        <Tooltip.Root delayDuration={300}>
        <Tooltip.Trigger asChild>
          <IconButton
            variant="ghost"
            onClick={() => setIsOpen(!isOpen)}
            className={cn(
              'w-10 h-10 flex items-center justify-center',
              'transition-all duration-200 border-none hover:shadow-md group',
            )}
          >
            {icon || <Settings size={14} className="text-muted-foreground group-hover:rotate-90 transition-transform duration-300" />}
          </IconButton>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content 
            side="bottom" 
            sideOffset={8} 
            className={cn(
              'rounded-lg px-3 py-1.5 text-sm font-medium shadow-lg border z-[9999]',
              isDarkMode 
                ? 'bg-gray-800 border-gray-700 text-gray-200' 
                : 'bg-white border-gray-200 text-gray-700'
            )}
          >
            {label}
            <Tooltip.Arrow className={isDarkMode ? 'fill-gray-800' : 'fill-white'} />
          </Tooltip.Content>
        </Tooltip.Portal>
        </Tooltip.Root>
        </Tooltip.TooltipProvider>


        {/* Dropdown */}
        {isOpen && (
          <div className={cn(
            "absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-xl border z-50 p-2",
            isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
          )}>
            {/* Search */}
            <div className="mb-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className={cn(
                    'w-full pl-7 pr-2.5 py-1.5 rounded-lg border text-xs',
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                  )}
                  autoFocus
                />
              </div>
            </div>

            {/* Items List */}
            <div className="space-y-0.5 max-h-40 overflow-y-auto mb-2">
              {filteredItems.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-2">
                  {searchQuery ? 'No matches found' : 'No items yet'}
                </p>
              ) : (
                filteredItems.map(item => 
                  renderItem 
                    ? renderItem(item, selectedIds.includes(item.id))
                    : defaultRenderItem(item, selectedIds.includes(item.id))
                )
              )}
            </div>

            {/* Create New */}
            {onCreate && (
              !showCreate ? (
                <button
                  type="button"
                  onClick={() => setShowCreate(true)}
                  className={cn(
                    'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs border-t transition-colors',
                    isDarkMode
                      ? 'border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                      : 'border-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                  )}
                >
                  <Plus size={14} />
                  Create new
                </button>
              ) : (
                <div className={cn(
                  'border-t pt-2 space-y-2',
                  isDarkMode ? 'border-gray-700' : 'border-gray-100'
                )}>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                    placeholder={createPlaceholder}
                    className={cn(
                      'w-full px-2.5 py-1.5 rounded-lg border text-xs',
                      isDarkMode
                        ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                    )}
                    autoFocus
                  />
                  
                  {showColorPicker && (
                    <div className="flex gap-1.5 flex-wrap">
                      {presetColors.map(color => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setNewColor(color)}
                          className={cn(
                            'w-5 h-5 rounded-full transition-transform',
                            newColor === color && 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                          )}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreate(false);
                        setNewName('');
                      }}
                      className="flex-1 text-xs py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreate}
                      disabled={!newName.trim()}
                      className={cn(
                        'flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors',
                        'bg-blue-500 text-white hover:bg-blue-600',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                      )}
                    >
                      Create
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>
    );
  }

  // ──── Normal mode (when hasSelected or showAsSettingsButton is false) ────
  return (
    <div ref={ref} className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs border transition-colors w-full",
          isDarkMode
            ? "border-gray-700 hover:border-gray-600 text-gray-300 bg-gray-800"
            : "border-gray-300 hover:border-gray-400 text-gray-600 bg-white"
        )}
      >
        {!hasSelected && (icon || <Plus size={12} />)}
           
        {hasSelected ? (
          <div className="flex flex-wrap gap-1 flex-1">
            {selectedItems.map(item =>
              renderBadge ? (
                <div key={item.id}>{renderBadge(item)}</div>
              ) : (
                defaultRenderBadge(item)
              )
            )}
          </div>
        ) : (
          <span className="flex-1 text-left">{placeholder}</span>
        )}

        {selectedIds.length > 0 && !hasSelected && (
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px]",
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          )}>
            {selectedIds.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className={cn(
          "absolute bottom-full mb-2 left-0 w-64 rounded-xl shadow-xl border z-50 p-2",
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
          {/* Search */}
          <div className="mb-2">
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className={cn(
                  'w-full pl-7 pr-2.5 py-1.5 rounded-lg border text-xs',
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                )}
                autoFocus
              />
            </div>
          </div>

          {/* Items List */}
          <div className="space-y-0.5 max-h-40 overflow-y-auto mb-2">
            {filteredItems.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-2">
                {searchQuery ? 'No matches found' : 'No items yet'}
              </p>
            ) : (
              filteredItems.map(item => 
                renderItem 
                  ? renderItem(item, selectedIds.includes(item.id))
                  : defaultRenderItem(item, selectedIds.includes(item.id))
              )
            )}
          </div>

          {/* Create New */}
          {onCreate && (
            !showCreate ? (
              <button
                type="button"
                onClick={() => setShowCreate(true)}
                className={cn(
                  'w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs border-t transition-colors',
                  isDarkMode
                    ? 'border-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-700'
                    : 'border-gray-100 text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                )}
              >
                <Plus size={14} />
                Create new
              </button>
            ) : (
              <div className={cn(
                'border-t pt-2 space-y-2',
                isDarkMode ? 'border-gray-700' : 'border-gray-100'
              )}>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  placeholder={createPlaceholder}
                  className={cn(
                    'w-full px-2.5 py-1.5 rounded-lg border text-xs',
                    isDarkMode
                      ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                      : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                  )}
                  autoFocus
                />
                
                {showColorPicker && (
                  <div className="flex gap-1.5 flex-wrap">
                    {presetColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewColor(color)}
                        className={cn(
                          'w-5 h-5 rounded-full transition-transform',
                          newColor === color && 'ring-2 ring-offset-2 ring-blue-500 scale-110'
                        )}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreate(false);
                      setNewName('');
                    }}
                    className="flex-1 text-xs py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={!newName.trim()}
                    className={cn(
                      'flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors',
                      'bg-blue-500 text-white hover:bg-blue-600',
                      'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                  >
                    Create
                  </button>
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

EntityPicker.displayName = 'EntityPicker';