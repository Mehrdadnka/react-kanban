import { create } from 'zustand';
import { PanelConfig, PanelState, ISidebarEngine } from './sidebar-engine.types';

const BASE_Z_INDEX = 1000;
const Z_INDEX_STEP = 10;

interface EngineStoreState extends ISidebarEngine {
  panels: Record<string, PanelState>; 
  stack: string[]; 
}

export const useSidebarEngineStore = create<EngineStoreState>((set, get) => ({
  panels: {},
  stack: [],

  register: (config: PanelConfig) => {
    set((state) => ({
      panels: {
        ...state.panels,
        [config.id]: {
          config,
          isOpen: false,
          zIndex: BASE_Z_INDEX,
          isMinimized: false,
          metadata: config.initialProps,
        },
      },
    }));
  },

  unregister: (id: string) => {
    set((state) => {
      const { [id]: removedPanel, ...restPanels } = state.panels;
      return {
        panels: restPanels,
        stack: state.stack.filter(panelId => panelId !== id),
      };
    });
  },

  open: (id: string, metadata?: any) => {
    const state = get();
    const panel = state.panels[id];
    if (!panel) {
      console.error(`Panel with id "${id}" not registered.`);
      return;
    }

    const updatedPanels = { ...state.panels };
    Object.values(updatedPanels).forEach((p) => {
      if (p.isOpen && p.config.priority < panel.config.priority) {
        updatedPanels[p.config.id] = { ...p, isMinimized: true };
      }
    });

    const highestZIndex = Math.max(0, ...state.stack.map(panelId => updatedPanels[panelId]?.zIndex || 0));
    const newZIndex = Math.max(BASE_Z_INDEX, highestZIndex) + Z_INDEX_STEP;

    const newStack = state.stack.filter(panelId => panelId !== id); 
    newStack.push(id); 

    set({
      panels: {
        ...updatedPanels,
        [id]: {
          ...updatedPanels[id],
          isOpen: true,
          isMinimized: false,
          zIndex: newZIndex,
          metadata: { ...updatedPanels[id].metadata, ...metadata },
        },
      },
      stack: newStack,
    });
  },

  close: (id: string) => {
    set((state) => {
      const panel = state.panels[id];
      if (!panel) return state;

      const newStack = state.stack.filter(panelId => panelId !== id);

      const updatedPanels = { ...state.panels };
      const restoredPanels: string[] = [];
      Object.entries(updatedPanels).forEach(([pId, p]) => {
        if (p.isMinimized && p.config.priority > panel.config.priority) {
          updatedPanels[pId] = { ...p, isMinimized: false };
          restoredPanels.push(pId);
        }
      });
      const finalStack = [...newStack, ...restoredPanels];

      return {
        panels: {
          ...updatedPanels,
          [id]: { ...panel, isOpen: false, isMinimized: false },
        },
        stack: finalStack,
      };
    });
  },

  closeTop: () => {
    const { stack } = get();
    if (stack.length > 0) {
      get().close(stack[stack.length - 1]);
    }
  },

  getPanelState: (id: string) => get().panels[id],

  isPanelOpen: (id: string) => {
    const panel = get().panels[id];
    return panel ? panel.isOpen && !panel.isMinimized : false;
  },

  closeAll: () => {
    set((state) => {
      const updatedPanels = { ...state.panels };
      Object.keys(updatedPanels).forEach(id => {
        updatedPanels[id] = {
          ...updatedPanels[id],
          isOpen: false,
          isMinimized: false,
        };
      });
      return {
        panels: updatedPanels,
        stack: [],
      };
    });
  },
}));
export const usePanelIds = () => 
  useSidebarEngineStore(state => Object.keys(state.panels));

export const useOpenPanelIds = () => 
  useSidebarEngineStore(state => 
    Object.values(state.panels)
      .filter(p => p.isOpen)
      .map(p => p.config.id)
  );