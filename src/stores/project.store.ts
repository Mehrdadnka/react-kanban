import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  status: 'active' | 'completed' | 'on-hold' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectStore {
  projects: Project[];
  
  // Actions
  addProject: (name: string, color: string, description?: string) => string;
  updateProject: (id: string, data: Partial<Omit<Project, 'id' | 'createdAt'>>) => void;
  deleteProject: (id: string) => void;
  getProjectById: (id: string) => Project | undefined;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (name, color, description) => {
        const id = crypto.randomUUID();
        const now = new Date();
        const project: Project = {
          id,
          name,
          color,
          description,
          status: 'active',
          createdAt: now,
          updatedAt: now,
        };
        set(state => ({ projects: [...state.projects, project] }));
        return id;
      },

      updateProject: (id, data) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === id ? { ...p, ...data, updatedAt: new Date() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
        }));
      },

      getProjectById: (id) => {
        return get().projects.find(p => p.id === id);
      },
    }),
    {
      name: 'project-store',
      partialize: (state) => ({
        projects: state.projects,
      }),
    }
  )
);