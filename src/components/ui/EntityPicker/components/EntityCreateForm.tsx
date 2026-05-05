import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EntityCreateFormProps {
  isOpen: boolean;
  newName: string;
  newColor: string;
  showColorPicker: boolean;
  presetColors: string[];
  isDarkMode: boolean;
  createPlaceholder?: string;
  onOpen: () => void;
  onClose: () => void;
  onNameChange: (name: string) => void;
  onColorChange: (color: string) => void;
  onCreate: () => void;
}

export const EntityCreateForm: React.FC<EntityCreateFormProps> = ({
  isOpen,
  newName,
  newColor,
  showColorPicker,
  presetColors,
  isDarkMode,
  createPlaceholder = 'Name...',
  onOpen,
  onClose,
  onNameChange,
  onColorChange,
  onCreate,
}) => {
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={onOpen}
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
    );
  }

  return (
    <div className={cn(
      'border-t pt-2 space-y-2',
      isDarkMode ? 'border-gray-700' : 'border-gray-100'
    )}>
      <input
        type="text"
        value={newName}
        onChange={(e) => onNameChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && onCreate()}
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
              onClick={() => onColorChange(color)}
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
          onClick={onClose}
          className="flex-1 text-xs py-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onCreate}
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
  );
};