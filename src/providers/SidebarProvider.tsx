import React, { memo, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useSidebarEngineStore } from '../stores/sidebar-engine/sidebar-engine.store';

const PanelRenderer: React.FC = memo(() => {
  const panels = useSidebarEngineStore(state => state.panels);
  const closeTop = useSidebarEngineStore(state => state.closeTop);

  const openPanels = Object.values(panels).filter(p => p.isOpen);
  const topPanelZIndex = openPanels.length > 0 
    ? Math.max(...openPanels.map(p => p.zIndex)) 
    : 0;

  return (
    <>
        {openPanels.length > 0 && (
          <div
            key="engine-overlay"
            style={{ zIndex: topPanelZIndex - 100, marginLeft: '4rem' }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeTop}
            aria-hidden="true"
          />
        )}

      {/* Rendering all open panels */}
      {openPanels.map((panel) => {
        const PanelComponent = panel.config.component;
        
        return createPortal(
          <PanelComponent
            key={panel.config.id}
            panelId={panel.config.id}
            isOpen={panel.isOpen && !panel.isMinimized}
            zIndex={panel.zIndex}
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