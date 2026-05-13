// features/ColumnManager/ColumnManagerV2.tsx
import React, { useEffect, useState } from 'react';
import { Plus, X, Edit3, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button/Button';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';
import { useColumnStore } from '@/stores/column.store';
import { useTaskStore } from '@/stores/task.store';

// this is for test
const COLORS = [
  '#3B82F6', '#EF4444', '#22C55E', '#EAB308', '#8B5CF6',
  '#EC4899', '#06B6D4', '#F97316', '#14B8A6', '#6366F1',
];

interface ColumnManagerV2Props {
  isOpen: boolean;
  onClose: () => void;
  boardId: string;
}

export const ColumnManagerV2: React.FC<ColumnManagerV2Props> = ({ isOpen, onClose, boardId }) => {
  const { isDarkMode } = useApp();
  const { columns, addColumn, updateColumn, deleteColumn, getColumnsByBoard } = useColumnStore();
  const { tasks } = useTaskStore();
  const boardColumns = getColumnsByBoard(boardId);
  
  const [newTitle, setNewTitle] = useState('');
  const [newColor, setNewColor] = useState('#6B7280');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editWip, setEditWip] = useState('');

  const sorted = [...boardColumns].sort((a, b) => a.order - b.order);

  const getTaskCount = (columnId: string) => {
    return tasks.filter(t => t.columnId === columnId && t.boardId === boardId).length;
  };

  const handleAdd = () => {
    if (!newTitle.trim()) return;
    addColumn({ 
        title: newTitle.trim(), 
        color: newColor,
        boardId,
     });
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
    const column = boardColumns.find(c => c.id === id);
    if (column?.isDefault) return;
    deleteColumn(id);
  };

  useEffect(() => {
    console.log('🔵 ColumnManagerV2 Mounted', {
      boardId,
      columnsCount: boardColumns.length,
      columnIds: boardColumns.map(c => c.id),
      tasksOnBoard: tasks.filter(t => t.boardId === boardId).length
    });
  }, [boardId, boardColumns, tasks]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]" 
        onClick={onClose} 
      />
      
      {/* Modal */}
      <div className={cn(
        "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999]",
        "w-full max-w-lg rounded-xl shadow-2xl",
        "p-6",
        isDarkMode ? "bg-gray-900 border border-gray-800" : "bg-white border border-gray-200"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">
            Columns for Board: <span className="text-blue-500">{boardId}</span>
          </h2>
          <button 
            onClick={onClose} 
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X size={18} />
          </button>
        </div>

        {/* Add new column */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Column name..."
            className={cn(
              "flex-1 px-3 py-2 rounded-lg border text-sm",
              isDarkMode ? "bg-gray-800 border-gray-700 text-gray-100" : "bg-white border-gray-300"
            )}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          />
          <Button onClick={handleAdd} size="sm">
            <Plus size={16} /> Add
          </Button>
        </div>

        {/* Color picker */}
        <div className="flex gap-2 mb-4">
          {COLORS.map(color => (
            <button
              key={color}
              onClick={() => setNewColor(color)}
              className={cn(
                "w-6 h-6 rounded-full border-2 transition-all",
                newColor === color ? "scale-125 border-gray-400" : "border-transparent"
              )}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Column list */}
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {sorted.map((column) => {
            const taskCount = getTaskCount(column.id);
            
            return (
              <div
                key={column.id}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg border",
                  isDarkMode ? "border-gray-800 bg-gray-800/50" : "border-gray-100 bg-gray-50"
                )}
              >
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
                      onKeyDown={(e) => e.key === 'Enter' && handleUpdate(column.id)}
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
                      {taskCount} tasks
                      {column.wipLimit && ` / ${column.wipLimit}`}
                    </span>
                  </>
                )}
                
                <div className="flex items-center gap-1">
                  {!editingId && (
                    <>
                      {column.isDefault && (
                        <span className="text-xs text-gray-400 mr-1">default</span>
                      )}
                      <button
                        onClick={() => { 
                          setEditingId(column.id); 
                          setEditTitle(column.title); 
                          setEditWip(column.wipLimit?.toString() || ''); 
                        }}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Edit3 size={14} />
                      </button>
                    </>
                  )}
                  {editingId === column.id && (
                    <button 
                      onClick={() => setEditingId(null)} 
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
                    >
                      <X size={14} />
                    </button>
                  )}
                  {!column.isDefault && !editingId && (
                    <button
                      onClick={() => handleDelete(column.id)}
                      className="p-1 rounded hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                      title="Delete column"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {boardColumns.length === 0 && (
          <div className="text-center py-8 text-gray-400">
            <AlertTriangle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">No columns yet. Create your first one!</p>
          </div>
        )}
      </div>
    </>
  );
};