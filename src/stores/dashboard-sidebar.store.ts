import { create } from 'zustand';
import { Task } from '@/types/task.types';

export type DashboardWidgetType = 
  | 'task-overview'
  | 'recent-tasks'
  | 'priority-breakdown'
  | 'total-tasks'
  | 'in-progress'
  | 'completed'
  | 'todo';

export type TaskFilterType = 'all' | 'in-progress' | 'done' | 'todo';

interface WidgetData {
  totalTasks: number;
  inProgressCount: number;
  completedCount: number;
  todoCount: number;
  completionRate: number;
  recentTasks: Task[];
  priorityData: {
    high: number;
    medium: number;
    low: number;
  };
  filteredTasks?: Task[];
  activeFilter?: TaskFilterType;
}

interface DashboardSidebarState {
  activeWidget: DashboardWidgetType | null;
  widgetData: WidgetData;
  
  // Actions
  openSidebar: (widgetType: DashboardWidgetType, data: WidgetData) => void;
  closeSidebar: () => void;
  updateWidgetData: (data: Partial<WidgetData>) => void;
}

export const useDashboardSidebarStore = create<DashboardSidebarState>((set) => ({
  activeWidget: null,
  widgetData: {
    totalTasks: 0,
    inProgressCount: 0,
    completedCount: 0,
    todoCount: 0,
    completionRate: 0,
    recentTasks: [],
    priorityData: {
      high: 0,
      medium: 0,
      low: 0,
    },
    filteredTasks: [],
    activeFilter: 'all',
  },
  
  openSidebar: (widgetType, data) => {
    set({
      activeWidget: widgetType,
      widgetData: data,
    });
  },
  
  closeSidebar: () => {
    set({
      activeWidget: null,
    });
  },
  
  updateWidgetData: (data) => {
    set((state) => ({
      widgetData: { ...state.widgetData, ...data },
    }));
  },
}));