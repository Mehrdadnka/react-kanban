import { create } from 'zustand';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';

interface SettingsSidebarState {
  // Actions
  openSettings: () => void;
  closeSettings: () => void;
}

export const useSettingsSidebarStore = create<SettingsSidebarState>(() => ({
  openSettings: () => {
    const engine = useSidebarEngineStore.getState();
    engine.open('settings-sidebar');
  },
  
  closeSettings: () => {
    const engine = useSidebarEngineStore.getState();
    engine.close('settings-sidebar');
  },
}));