import React, { useEffect, useState } from 'react';
import ToasterWrapper from './sidebarProvider/ToasterWrapper';
import PanelRenderer from './sidebarProvider/PanelRenderer';

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <>
      <ToasterWrapper />
      {children}
      {mounted && <PanelRenderer />}
    </>
  );
};