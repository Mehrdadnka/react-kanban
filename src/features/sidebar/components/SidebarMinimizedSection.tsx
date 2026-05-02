// src/features/sidebar/components/SidebarMinimizedSection.tsx
import React, { useCallback } from 'react';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useShallow } from 'zustand/react/shallow';
import { Separator } from '@/components/ui/separator/Separator';
import { useApp } from '@/providers/AppProvider';
import { SidebarItem } from './SidebarItem';
import { useMinimizedPanelIcon } from '../hooks/useMinimizedPanelIcon';
import { cn } from '@/lib/utils';

interface SidebarMinimizedSectionProps {
  variant?: 'icon-only' | 'full';
}

export const SidebarMinimizedSection: React.FC<SidebarMinimizedSectionProps> = ({ variant = 'icon-only' }) => {
  const { isDarkMode } = useApp();
  
  const minimizedPanelIds = useSidebarEngineStore(
    useShallow((state) => 
      Object.keys(state.panels).filter(id => state.panels[id].isMinimized)
    )
  );

  const restorePanel = useCallback((panelId: string) => {
    useSidebarEngineStore.getState().open(panelId);
  }, []);

  const filteredMinimized = minimizedPanelIds.filter(id => id !== 'search-sidebar');
  
  if (filteredMinimized.length === 0) return null;

  return (
    <>
      <Separator isDarkMode={isDarkMode} className={cn(
        'mx-auto',
        variant === 'full' ? 'w-full' : 'w-10'
      )} size='2' />
      <div className={cn(
        'flex flex-col gap-2 mt-4',
        variant === 'full' ? 'px-3' : 'items-center'
      )}>
        {filteredMinimized.map((panelId) => (
          <MinimizedPanelButton
            key={panelId}
            panelId={panelId}
            isDarkMode={isDarkMode}
            onRestore={restorePanel}
            variant={variant}
          />
        ))}
      </div>
    </>
  );
};

const MinimizedPanelButton: React.FC<{
  panelId: string;
  isDarkMode: boolean;
  onRestore: (panelId: string) => void;
  variant: 'icon-only' | 'full';
}> = ({ panelId, isDarkMode, onRestore, variant }) => {
  const panelInfo = useMinimizedPanelIcon(panelId);
  
  if (!panelInfo) return null;

  const { icon: Icon, label } = panelInfo;

  return (
    <SidebarItem
      id={panelId}
      icon={<Icon size={variant === 'full' ? 20 : 20} />}
      label={`${label} (Minimized)`}
      isDarkMode={isDarkMode}
      onClick={() => onRestore(panelId)}
      variant={variant}
      className={cn(
        'text-gray-400 ring-1',
        isDarkMode
          ? 'hover:text-gray-200 hover:bg-gray-800 bg-gray-800/30 ring-gray-500'
          : 'hover:text-gray-700 hover:bg-gray-100 bg-gray-100/50 ring-gray-400'
      )}
    />
  );
};