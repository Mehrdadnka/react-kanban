import React, { useState } from 'react';
import { Plus, GripVertical, Trash2, Edit3, X, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { useColumnStore } from '@/stores/column.store';
import { useTaskStore } from '@/stores/task.store';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

const COLORS = [
  '#3B82F6', '#EF4444', '#22C55E', '#EAB308', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

const ICONS = ['ClipboardList', 'Zap', 'CheckCircle2', 'Circle', 'Star', 'Heart', 'Flame', 'Target'];

interface ColumnManagerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ColumnManager: React.FC<ColumnManagerProps> = ({ isOpen, onClose }) => {
  const { isDarkMode } = useApp();
  const { columns, addColumn, updateColumn, deleteColumn } = useColumnStore();
  const { tasks } = useTaskStore();
  
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#6B7280');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editWip, setEditWip] = useState('');

  const sorted = [...columns].sort((a, b) => a.order - b.order);

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addColumn({ title: newTitle.trim(), color: newColor });
    setNewTitle('');
    setNewColor('#6B7280');
  };

  const handleUpdate = (id: string) => {
    if (!editTitle.trim()) return;
    updateColumn(id, { 
      title: editTitle.trim(), 
      wipLimit: editWip ? parseInt(editWip) : undefined 
    });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    const column = columns.find(c => c.id === id);
    if (column?.isDefault) return;
    deleteColumn(id);
  };

  const getTaskCount = (columnId: string) => tasks.filter(t => t.columnId === columnId).length;

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
      "w-full max-w-lg rounded-xl shadow-2xl",
      "p-6",
      isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold">Manage Columns</h2>
        <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
          <X size={18} />
        </button>
      </div>

      {/* Add new */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="New column name..."
          className={cn(
            "flex-1 px-3 py-2 rounded-lg border text-sm",
            isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300"
          )}
        />
        <Button onClick={handleAdd} size="sm">
          <Plus size={16} /> Add
        </Button>
      </div>

      {/* Column list */}
      <div className="space-y-2 max-h-80 overflow-y-auto">
        {sorted.map((column) => (
          <div
            key={column.id}
            className={cn(
              "flex items-center gap-3 p-3 rounded-lg border",
              isDarkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-100 bg-gray-50"
            )}
          >
            {/* Color dot */}
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: column.color }} />
            
            {editingId === column.id ? (
              <div className="flex-1 flex gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className={cn(
                    "flex-1 px-2 py-1 border rounded text-sm",
                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  )}
                  autoFocus
                />
                <input
                  type="number"
                  value={editWip}
                  onChange={(e) => setEditWip(e.target.value)}
                  placeholder="WIP"
                  className={cn(
                    "w-16 px-2 py-1 border rounded text-sm",
                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  )}
                />
                <Button size="sm" onClick={() => handleUpdate(column.id)}>Save</Button>
              </div>
            ) : (
              <>
                <span className="flex-1 text-sm font-medium truncate">{column.title}</span>
                <span className={cn(
                  "text-xs px-2 py-0.5 rounded",
                  isDarkMode ? "text-gray-400" : "text-gray-500"
                )}>
                  {getTaskCount(column.id)} tasks
                  {column.wipLimit && ` / ${column.wipLimit}`}
                </span>
              </>
            )}
            
            <div className="flex items-center gap-1">
              {!editingId && (
                <button
                  onClick={() => { setEditingId(column.id); setEditTitle(column.title); setEditWip(column.wipLimit?.toString() || ''); }}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <Edit3 size={14} />
                </button>
              )}
              {editingId === column.id && (
                <button onClick={() => setEditingId(null)} className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                  <X size={14} />
                </button>
              )}
              {!column.isDefault && !editingId && (
                <button
                  onClick={() => handleDelete(column.id)}
                  className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {columns.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
          <p className="text-sm">No columns yet. Create your first one!</p>
        </div>
      )}
    </div>
  );
};