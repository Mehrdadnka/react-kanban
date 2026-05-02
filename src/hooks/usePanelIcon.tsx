// hooks/usePanelIcon.ts
import { useMemo } from 'react';
import { PANEL_ICONS } from '@/config/panel-icons.config';

export const usePanelIcon = (panelId?: string) => {
  return useMemo(() => {
    if (!panelId) return null;
    return PANEL_ICONS[panelId] || null;
  }, [panelId]);
};

export const usePanelIconComponent = (panelId?: string, size: number = 20) => {
  return useMemo(() => {
    if (!panelId) return null;
    const config = PANEL_ICONS[panelId];
    if (!config) return null;
    
    const Icon = config.icon;
    return <Icon size={size} />;
  }, [panelId, size]);
};


