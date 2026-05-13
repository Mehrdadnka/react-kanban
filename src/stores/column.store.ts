import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import type { KanbanColumn } from '@/types/column.types';
import { useEventBus } from './core/event-bus.store';

interface ColumnStore {
  columns: KanbanColumn[]; 
  
  addColumn: (input: { 
    boardId: string;
    title: string; 
    color?: string; 
    icon?: string; 
    wipLimit?: number;
  }) => string;
  
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (activeId: string, overId: string) => void;
  
  getColumnById: (id: string) => KanbanColumn | undefined;
  getColumnsByBoard: (boardId: string) => KanbanColumn[];
  getDefaultColumns: () => KanbanColumn[];
  ensureDefaultColumns: (boardId: string) => void;
}

const createDefaultColumns = (boardId: string): KanbanColumn[] => [
  { id: 'todo', title: 'To Do', color: '#3B82F6', icon: 'ClipboardList', order: 0, isDefault: true, boardId },
  { id: 'in-progress', title: 'In Progress', color: '#EAB308', icon: 'Zap', order: 1, isDefault: true, boardId },
  { id: 'done', title: 'Done', color: '#22C55E', icon: 'CheckCircle2', order: 2, isDefault: true, boardId },
];

export const useColumnStore = create<ColumnStore>()(
  persist(
    (set, get) => ({
      columns: [],

      ensureDefaultColumns: (boardId) => {
        const existing = get().columns.filter(c => c.boardId === boardId);
        if (existing.length > 0) return;
        
        const defaults = createDefaultColumns(boardId);
        set(state => ({ columns: [...state.columns, ...defaults] }));

        // Emit for each default column created
        defaults.forEach(col => {
          useEventBus.getState().emit('column:created', { id: col.id });
        });
      },

      addColumn: (input) => {
        const boardColumns = get().getColumnsByBoard(input.boardId);
        const maxOrder = Math.max(...boardColumns.map(c => c.order), -1);
        
        const newColumn: KanbanColumn = {
          id: uuidv4().slice(0, 8),
          title: input.title,
          color: input.color || '#6B7280',
          icon: input.icon || 'Circle',
          order: maxOrder + 1,
          wipLimit: input.wipLimit,
          isDefault: false,
          boardId: input.boardId,
        };
        
        set(state => ({
          columns: [...state.columns, newColumn],
        }));

        // EMIT
        useEventBus.getState().emit('column:created', { id: newColumn.id });
        
        return newColumn.id;
      },

      updateColumn: (id, updates) => {
        set(state => ({
          columns: state.columns.map(col =>
            col.id === id ? { ...col, ...updates } : col
          ),
        }));

        // EMIT
        useEventBus.getState().emit('column:updated', { 
          id, 
          changes: updates as Record<string, unknown> 
        });
      },

      deleteColumn: (id) => {
        const column = get().columns.find(c => c.id === id);
        if (column?.isDefault) return;
        
        set(state => ({
          columns: state.columns.filter(c => c.id !== id),
        }));

        // EMIT
        useEventBus.getState().emit('column:deleted', { id });
      },

      reorderColumns: (activeId, overId) => {
        set(state => {
          const columns = [...state.columns].sort((a, b) => a.order - b.order);
          const activeIndex = columns.findIndex(c => c.id === activeId);
          const overIndex = columns.findIndex(c => c.id === overId);
          
          if (activeIndex !== -1 && overIndex !== -1) {
            columns[activeIndex] = { ...columns[activeIndex], order: overIndex };
            columns[overIndex] = { ...columns[overIndex], order: activeIndex };
          }
          
          return { columns };
        });
      },

      getColumnById: (id) => get().columns.find(c => c.id === id),

      getColumnsByBoard: (boardId) => {
        return get().columns
          .filter(c => c.boardId === boardId)
          .sort((a, b) => a.order - b.order);
      },

      getDefaultColumns: () => get().columns.filter(c => c.isDefault),
    }),
    {
      name: 'taskflow-columns-v3',
      version: 2,
    }
  )
);