// src/components/layout/Sidebar.tsx
import React from 'react';
import { SidebarProvider } from '@/features/sidebar/components/SidebarProvider';
import { SidebarContainer } from '@/features/sidebar/components/SidebarContainer';
import { SidebarNavSection } from '@/features/sidebar/components/SidebarNavSection';
import { SidebarMinimizedSection } from '@/features/sidebar/components/SidebarMinimizedSection';
import { SidebarToolsSection } from '@/features/sidebar/components/SidebarToolsSection';
import { SidebarClock } from '@/features/sidebar/components/SidebarClock';

const Sidebar = () => {
  return (
    <SidebarProvider>
      <SidebarContainer>
        {(variant) => (
          <>
            <SidebarNavSection variant={variant} />
            <SidebarMinimizedSection variant={variant} />
            <div className="flex-1" />
            <SidebarToolsSection variant={variant} />
            <SidebarClock variant={variant} />
          </>
        )}
      </SidebarContainer>
    </SidebarProvider>
  );
};

export default Sidebar;