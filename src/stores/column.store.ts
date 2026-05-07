import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { KanbanColumn } from '@/types/column.types';

interface ColumnStore {
  columns: KanbanColumn[];
  
  addColumn: (input: { title: string; color?: string; icon?: string; wipLimit?: number }) => string;
  updateColumn: (id: string, updates: Partial<KanbanColumn>) => void;
  deleteColumn: (id: string) => void;
  reorderColumns: (activeId: string, overId: string) => void;
  getColumnById: (id: string) => KanbanColumn | undefined;
  getDefaultColumns: () => KanbanColumn[];
}

const DEFAULT_COLUMNS: KanbanColumn[] = [
  { id: 'todo', title: 'To Do', color: '#3B82F6', icon: 'ClipboardList', order: 0, isDefault: true },
  { id: 'in-progress', title: 'In Progress', color: '#EAB308', icon: 'Zap', order: 1, isDefault: true },
  { id: 'done', title: 'Done', color: '#22C55E', icon: 'CheckCircle2', order: 2, isDefault: true },
];

export const useColumnStore = create<ColumnStore>()(
  persist(
    (set, get) => ({
      columns: DEFAULT_COLUMNS,

      addColumn: (input) => {
        const id = uuidv4().slice(0, 8);
        const maxOrder = Math.max(...get().columns.map(c => c.order), -1);
        
        const newColumn: KanbanColumn = {
          id,
          title: input.title,
          color: input.color || '#6B7280',
          icon: input.icon || 'Circle',
          order: maxOrder + 1,
          wipLimit: input.wipLimit,
          isDefault: false,
        };
        
        set(state => ({
          columns: [...state.columns, newColumn],
        }));
        
        return id;
      },

      updateColumn: (id, updates) => {
        set(state => ({
          columns: state.columns.map(col =>
            col.id === id ? { ...col, ...updates } : col
          ),
        }));
      },

      deleteColumn: (id) => {
        const column = get().columns.find(c => c.id === id);
        if (column?.isDefault) return; // can't delete defaults
        
        set(state => ({
          columns: state.columns.filter(c => c.id !== id),
        }));
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

      getDefaultColumns: () => get().columns.filter(c => c.isDefault),
    }),
    {
      name: 'taskflow-columns',
    }
  )
);