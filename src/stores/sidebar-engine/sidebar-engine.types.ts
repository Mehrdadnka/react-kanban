import React from 'react';

export interface PanelConfig {
  id: string;
  component: React.ComponentType<PanelProps>; 
  priority: number;
  initialProps?: Record<string, any>; 
}

export interface PanelProps {
  panelId: string;
  isOpen: boolean;
  zIndex: number;
  metadata?: Record<string, any>;
  onClose: () => void;
  onUpdateMetadata?: (metadata: any) => void;
  onAnimationComplete?: (status: 'open' | 'closed') => void;
}

export interface PanelState {
  config: PanelConfig;
  isOpen: boolean;
  zIndex: number;
  isMinimized: boolean; 
  metadata?: Record<string, any>;
}

export interface ISidebarEngine {
  register: (config: PanelConfig) => void;
  unregister: (id: string) => void;
  open: (id: string, metadata?: Record<string, any>) => void;
  close: (id: string) => void;
  minimize: (id: string) => void;
  closeTop: () => void;
  closeAll: () => void;
  closeAllVisible: () => void; 
  getPanelState: (id: string) => PanelState | undefined;
  isPanelOpen: (id: string) => boolean;
}