// ──── src/components/board/LabelPicker.tsx (ارتقا با inline create) ────

import React, { useState, useRef, useEffect } from 'react';
import { Plus, X, Tag, CheckCircle } from 'lucide-react';
import { useLabelStore } from '@/stores/label.store';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#EAB308', '#22C55E', '#14B8A6',
  '#3B82F6', '#8B5CF6', '#EC4899', '#6B7280', '#1F2937',
];

interface LabelPickerProps {
  selectedLabels: string[];
  onToggle: (labelId: string) => void;
  className?: string;
  disabled?: boolean;
}

export const LabelPicker: React.FC<LabelPickerProps> = ({
  selectedLabels,
  onToggle,
  className,
  disabled = false,
}) => {
  const { isDarkMode } = useApp();
  const { labels, addLabel, deleteLabel } = useLabelStore();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [newColor, setNewColor] = useState(PRESET_COLORS[0]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
        setShowCreate(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCreate = () => {
    if (!newName.trim()) return;
    const id = addLabel(newName.trim(), newColor);
    onToggle(id);
    setNewName('');
    setShowCreate(false);
  };

  if (disabled) {
    return (
      <div className={cn('flex flex-wrap gap-1.5', className)}>
        {selectedLabels.map(id => {
          const label = labels.find(l => l.id === id);
          return label ? (
            <span
              key={id}
              className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
              style={{ backgroundColor: label.color }}
            >
              {label.name}
            </span>
          ) : null;
        })}
      </div>
    );
  }

  return (
    <div ref={ref} className={cn('relative', className)}>
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
        <Tag size={12} />
        <span className="flex-1 text-left">Labels</span>
        {selectedLabels.length > 0 && (
          <span className={cn(
            "px-1.5 py-0.5 rounded-full text-[10px]",
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          )}>
            {selectedLabels.length}
          </span>
        )}
      </button>

      {isOpen && (
        <div className={cn(
          "absolute top-full mt-1 left-0 w-64 rounded-xl shadow-xl border z-50 p-2",
          isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
        )}>
          {/* Search / filter existing */}
          <div className="mb-2">
            <input
              type="text"
              placeholder="Filter labels..."
              className={cn(
                'w-full px-2.5 py-1.5 rounded-lg border text-xs',
                isDarkMode
                  ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
              )}
              autoFocus
            />
          </div>

          {/* Existing labels */}
          <div className="space-y-0.5 max-h-40 overflow-y-auto mb-2">
            {labels.map((label) => (
              <button
                key={label.id}
                type="button"
                onClick={() => onToggle(label.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg text-xs text-left transition-colors",
                  isDarkMode ? "hover:bg-gray-700" : "hover:bg-gray-100"
                )}
              >
                <div
                  className="w-3.5 h-3.5 rounded-full flex-shrink-0 ring-1 ring-inset ring-black/10"
                  style={{ backgroundColor: label.color }}
                />
                <span className="flex-1 truncate">{label.name}</span>
                {selectedLabels.includes(label.id) && (
                  <CheckCircle size={14} className="text-blue-500 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Create new — toggle */}
          {!showCreate ? (
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
              Create new label
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
                placeholder="Label name..."
                className={cn(
                  'w-full px-2.5 py-1.5 rounded-lg border text-xs',
                  isDarkMode
                    ? 'bg-gray-700 border-gray-600 text-gray-100 placeholder:text-gray-500'
                    : 'bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400'
                )}
                autoFocus
              />
              <div className="flex gap-1.5 flex-wrap">
                {PRESET_COLORS.map(color => (
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
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
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
          )}
        </div>
      )}
    </div>
  );
};

LabelPicker.displayName = 'LabelPicker';