import { useCallback } from 'react';
import { useSearchSidebarStore } from '@/stores/sidebar-engine/search-sidebar.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useShallow } from 'zustand/react/shallow';
import { PANEL_ICONS } from '@/config/panel-icons.config';

export const useSearchControl = () => {
  const { openSearch } = useSearchSidebarStore();
  
  const searchPanelState = useSidebarEngineStore(
    useShallow((state) => state.panels['search-sidebar'])
  );
  
  const isSearchOpen = searchPanelState?.isOpen && !searchPanelState?.isMinimized;
  const isSearchMinimized = searchPanelState?.isMinimized;
  
  const searchConfig = PANEL_ICONS['search-sidebar'];
  const SearchIcon = searchConfig.icon;

  const handleSearchClick = useCallback(() => {
    if (isSearchOpen) {
      useSidebarEngineStore.getState().minimize('search-sidebar');
    } else if (isSearchMinimized) {
      openSearch();
    } else {
      openSearch();
    }
  }, [isSearchOpen, isSearchMinimized, openSearch]);

  const searchLabel = isSearchMinimized 
    ? `${searchConfig.label} (Minimized)` 
    : isSearchOpen 
      ? `Close ${searchConfig.label}` 
      : searchConfig.label;

  return {
    SearchIcon,
    isSearchOpen,
    isSearchMinimized,
    handleSearchClick,
    searchLabel,
  };
};