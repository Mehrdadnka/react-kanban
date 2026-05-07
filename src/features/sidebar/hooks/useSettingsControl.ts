// features/sidebar/hooks/useSettingsControl.ts
import { useCallback } from 'react';
import { useSettingsSidebarStore } from '@/stores/settings-sidebar.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useShallow } from 'zustand/react/shallow';
import { PANEL_ICONS } from '@/config/panel-icons.config';

export const useSettingsControl = () => {
  const { openSettings } = useSettingsSidebarStore();
  
  const settingsPanelState = useSidebarEngineStore(
    useShallow((state) => state.panels['settings-sidebar'])
  );
  
  const isSettingsOpen = settingsPanelState?.isOpen && !settingsPanelState?.isMinimized;
  const isSettingsMinimized = settingsPanelState?.isMinimized;
  
  const settingsConfig = PANEL_ICONS['settings-sidebar'];
  const SettingsIcon = settingsConfig.icon;

  const handleSettingsClick = useCallback(() => {
    if (isSettingsOpen) {
      useSidebarEngineStore.getState().minimize('settings-sidebar');
    } else if (isSettingsMinimized) {
      openSettings();
    } else {
      openSettings();
    }
  }, [isSettingsOpen, isSettingsMinimized, openSettings]);

  const settingsLabel = isSettingsMinimized 
    ? `${settingsConfig.label} (Minimized)` 
    : isSettingsOpen 
      ? `Close ${settingsConfig.label}` 
      : settingsConfig.label;

  return {
    SettingsIcon,
    isSettingsOpen,
    isSettingsMinimized,
    handleSettingsClick,
    settingsLabel,
  };
};