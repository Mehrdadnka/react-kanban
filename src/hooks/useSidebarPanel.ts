import { useEffect } from 'react';
import { useSidebarEngineStore } from '../stores/sidebar-engine/sidebar-engine.store';
import { PanelConfig, PanelProps } from '../stores/sidebar-engine/sidebar-engine.types';

export const useSidebarPanel = (config: PanelConfig) => {
  const { register, unregister, open, close, isPanelOpen, getPanelState } = useSidebarEngineStore();

  useEffect(() => {
    register(config);
    return () => {
      unregister(config.id);
    };
  }, [config.id]);

  const currentState = getPanelState(config.id);
  const metadata = currentState?.metadata;

  return {
    open: (meta?: Record<string, any>) => open(config.id, meta),
    close: () => close(config.id),
    toggle: () => {
      if (isPanelOpen(config.id)) {
        close(config.id);
      } else {
        open(config.id);
      }
    },
    isOpen: isPanelOpen(config.id),
    metadata, 
  };
};