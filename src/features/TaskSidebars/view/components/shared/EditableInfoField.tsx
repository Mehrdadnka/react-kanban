// features/TaskSidebars/view/components/shared/EditableInfoField.tsx
import React, { useState } from 'react';
import { Pencil, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { InfoField } from './InfoField';

interface EditableInfoFieldProps {
  label: string;
  icon?: React.ElementType;
  value: React.ReactNode;
  isDarkMode?: boolean;
  onSave?: (value: string) => Promise<void> | void;
  editComponent?: React.ReactNode; // Custom edit UI (e.g., Select, DatePicker)
  editMode?: 'inline' | 'replace';
  className?: string;
}

export const EditableInfoField: React.FC<EditableInfoFieldProps> = ({
  label,
  icon,
  value,
  isDarkMode,
  onSave,
  editComponent,
  editMode = 'inline',
  className,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState('');

  const handleEdit = () => {
    setEditValue(typeof value === 'string' ? value : '');
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (onSave) {
      await onSave(editValue);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <InfoField
      label={label}
      icon={icon}
      isDarkMode={isDarkMode}
      className={className}
      action={
        !isEditing ? (
          <button
            onClick={handleEdit}
            className={cn(
              "p-1 rounded-md opacity-0 group-hover:opacity-100 transition-all",
              "hover:bg-gray-200 dark:hover:bg-gray-700",
              isDarkMode ? "text-gray-500" : "text-gray-400"
            )}
            title="Edit"
          >
            <Pencil size={12} />
          </button>
        ) : null
      }
    >
      {isEditing ? (
        <div className="flex items-center gap-2 w-full">
          {editComponent ? (
            editComponent
          ) : (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className={cn(
                "flex-1 px-2 py-1 text-sm rounded border",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
                isDarkMode
                  ? "bg-gray-800 border-gray-700 text-gray-100"
                  : "bg-white border-gray-300 text-gray-900"
              )}
              autoFocus
            />
          )}
          <button
            onClick={handleSave}
            className="p-1 text-green-500 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded"
          >
            <Check size={14} />
          </button>
          <button
            onClick={handleCancel}
            className="p-1 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <span className={isDarkMode ? "text-gray-200" : "text-gray-700"}>
          {value || <span className="text-gray-400 italic">Not set</span>}
        </span>
      )}
    </InfoField>
  );
};