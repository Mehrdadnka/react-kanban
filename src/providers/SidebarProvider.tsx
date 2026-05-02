import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarEngineStore } from '../stores/sidebar-engine/sidebar-engine.store';
import { cn } from '@/lib/utils';
import { useApp } from './AppProvider';

const PanelRenderer: React.FC = memo(() => {
  const { isDarkMode } = useApp()
  const panels = useSidebarEngineStore(state => state.panels);
  const closeTop = useSidebarEngineStore(state => state.closeTop);
  const visiblePanels = Object.values(panels).filter(p => p.isOpen && !p.isMinimized);
  const allOpenPanels = Object.values(panels).filter(p => p.isOpen); 
  
  const topPanelZIndex = visiblePanels.length > 0 
    ? Math.max(...visiblePanels.map(p => p.zIndex)) 
    : 0;
  const topPanel = visiblePanels[visiblePanels.length - 1];
  const isTopOverlay = topPanel?.config.priority === 20;

  return (
    <>
      {visiblePanels.length > 0 && (
        <div
          key="engine-overlay"
          style={{ zIndex: topPanelZIndex - 100, marginLeft: isTopOverlay ? '0' : '4rem', }}
          className={cn(
            "fixed inset-0 bg-black/20 backdrop-blur-sm",
            isTopOverlay && "bg-black/50"
          )}
          onClick={closeTop}
          aria-hidden="true"
        />
      )}

      {allOpenPanels.map((panel) => {
        const PanelComponent = panel.config.component;
        const isVisible = panel.isOpen && !panel.isMinimized;
        
        return createPortal(
          <PanelComponent
            key={panel.config.id}
            panelId={panel.config.id}
            isOpen={isVisible} 
            zIndex={panel.zIndex}
            isDarkMode={isDarkMode} // ← از AppProvider بگیر
            metadata={panel.metadata}
            onClose={() => useSidebarEngineStore.getState().close(panel.config.id)}
            onUpdateMetadata={(newMetadata) => {
              useSidebarEngineStore.setState(state => ({
                panels: {
                  ...state.panels,
                  [panel.config.id]: {
                    ...state.panels[panel.config.id],
                    metadata: {
                      ...state.panels[panel.config.id].metadata,
                      ...newMetadata,
                    },
                  },
                },
              }));
            }}
          />,
          document.body
        );
      })}
    </>
  );
});

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      {children}
      {mounted && <PanelRenderer />}
    </>
  );
};