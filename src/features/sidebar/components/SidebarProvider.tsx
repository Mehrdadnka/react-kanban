import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as Tooltip from '@radix-ui/react-tooltip';

interface SidebarContextType {
  isMobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toggleMobile: () => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) throw new Error('useSidebar must be used within SidebarProvider');
  return context;
};

const MOBILE_BREAKPOINT = 768;

export const SidebarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const toggleMobile = useCallback(() => setMobileOpen(prev => !prev), []);

  return (
    <Tooltip.Provider delayDuration={300}>
      <SidebarContext.Provider value={{ isMobileOpen, setMobileOpen, toggleMobile, isMobile }}>
        {children}
      </SidebarContext.Provider>
    </Tooltip.Provider>
  );
};