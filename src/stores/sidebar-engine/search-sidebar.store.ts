
import { create } from 'zustand';
import { Task } from '@/types/task.types';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

interface SearchSidebarState {
  query: string;
  results: Task[];
  isSearching: boolean;
  
  // Actions
  setQuery: (query: string) => void;
  search: (query: string, tasks: Task[]) => void;
  openSearch: () => void;
  closeSearch: () => void;
  minimizeSearch: () => void;
  clearSearch: () => void;
}

export const useSearchSidebarStore = create<SearchSidebarState>((set, get) => ({
  query: '',
  results: [],
  isSearching: false,
  
  setQuery: (query) => set({ query }),
  
  search: (query, tasks) => {
    set({ isSearching: true });
    
    if (!query.trim()) {
      set({ results: [], isSearching: false });
      return;
    }
    
    const searchTerm = query.toLowerCase();
    const results = tasks.filter(task => 
      task.title.toLowerCase().includes(searchTerm) ||
      task.description?.toLowerCase().includes(searchTerm) ||
      task.columnId.toLowerCase().includes(searchTerm) ||
      task.priority.toLowerCase().includes(searchTerm)
    ).slice(0, 20);
    
    set({ results, isSearching: false });
  },
  
  openSearch: () => {
    const engine = useSidebarEngineStore.getState();
    const panel = engine.getPanelState('search-sidebar');

    engine.open('search-sidebar');
    
    if (!panel?.isMinimized) set({ query: '', results: [] });
  },
  
  closeSearch: () => {
    const engine = useSidebarEngineStore.getState();
    engine.close('search-sidebar');
    set({ query: '', results: [] });
  },
  
  minimizeSearch: () => {
    const engine = useSidebarEngineStore.getState();
    engine.minimize('search-sidebar');
  },
  
  clearSearch: () => set({ query: '', results: [] }),
}));