import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useSidebarEngineStore } from '../stores/sidebar-engine/sidebar-engine.store';

const PanelRenderer: React.FC = () => {
  const panels = useSidebarEngineStore(state => state.panels);
  const closeTop = useSidebarEngineStore(state => state.closeTop);

  const openPanels = Object.values(panels).filter(p => p.isOpen);
  const topPanelZIndex = openPanels.length > 0 
    ? Math.max(...openPanels.map(p => p.zIndex)) 
    : 0;

  return (
    <>
      {/* Centeral Overlay */}
      <AnimatePresence>
        {openPanels.length > 0 && (
          <motion.div
            key="engine-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ zIndex: topPanelZIndex - 1 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm"
            onClick={closeTop}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

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
};

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