import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Milestone {
  id: string;
  name: string;
  color: string;
  description?: string;
  dueDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface MilestoneStore {
  milestones: Milestone[];
  
  // Actions
  addMilestone: (name: string, color: string, description?: string) => string;
  updateMilestone: (id: string, data: Partial<Omit<Milestone, 'id' | 'createdAt'>>) => void;
  deleteMilestone: (id: string) => void;
  getMilestoneById: (id: string) => Milestone | undefined;
}

export const useMilestoneStore = create<MilestoneStore>()(
  persist(
    (set, get) => ({
      milestones: [],

      addMilestone: (name, color, description) => {
        const id = crypto.randomUUID();
        const now = new Date();
        const milestone: Milestone = {
          id,
          name,
          color,
          description,
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ milestones: [...state.milestones, milestone] }));
        return id;
      },

      updateMilestone: (id, data) => {
        set(state => ({
          milestones: state.milestones.map(m =>
            m.id === id ? { ...m, ...data, updatedAt: new Date() } : m
          ),
        }));
      },

      deleteMilestone: (id) => {
        set(state => ({
          milestones: state.milestones.filter(m => m.id !== id),
        }));
      },

      getMilestoneById: (id) => {
        return get().milestones.find(m => m.id === id);
      },
    }),
    {
      name: 'milestone-store',
      // Optional: merge persist with state
      partialize: (state) => ({
        milestones: state.milestones,
      }),
    }
  )
);