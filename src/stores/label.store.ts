import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { Label } from '@/types/label.types';

interface LabelStore {
  labels: Label[];
  
  addLabel: (name: string, color: string) => string;
  updateLabel: (id: string, updates: Partial<Label>) => void;
  deleteLabel: (id: string) => void;
  getLabelById: (id: string) => Label | undefined;
  getDefaultLabels: () => Label[];
}

const DEFAULT_LABELS: Label[] = [
  { id: 'bug', name: 'Bug', color: '#EF4444' },
  { id: 'feature', name: 'Feature', color: '#3B82F6' },
  { id: 'improvement', name: 'Improvement', color: '#22C55E' },
  { id: 'docs', name: 'Documentation', color: '#6B7280' },
];

export const useLabelStore = create<LabelStore>()(
  persist(
    (set, get) => ({
      labels: DEFAULT_LABELS,

      addLabel: (name, color) => {
        const id = uuidv4().slice(0, 8);
        const newLabel: Label = { id, name, color };
        set(state => ({ labels: [...state.labels, newLabel] }));
        return id;
      },

      updateLabel: (id, updates) => {
        set(state => ({
          labels: state.labels.map(l => l.id === id ? { ...l, ...updates } : l),
        }));
      },

      deleteLabel: (id) => {
        set(state => ({
          labels: state.labels.filter(l => l.id !== id),
        }));
      },

      getLabelById: (id) => get().labels.find(l => l.id === id),

      getDefaultLabels: () => get().labels,
    }),
    {
      name: 'taskflow-labels',
    }
  )
);