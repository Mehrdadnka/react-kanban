// src/features/sidebar/hooks/useMinimizedPanelIcon.ts
import { useMemo } from 'react';
import { Plus, Eye, Edit3 } from 'lucide-react';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { PANEL_ICONS, WIDGET_ICONS } from '@/config/panel-icons.config';
import type { LucideIcon } from 'lucide-react';

interface MinimizedPanelInfo {
  icon: LucideIcon;
  label: string;
}

export const useMinimizedPanelIcon = (panelId: string): MinimizedPanelInfo | null => {
  return useMemo(() => {
    const panel = useSidebarEngineStore.getState().getPanelState(panelId);
    if (!panel) return null;

    // Dashboard sidebar with active widget
    if (panelId === 'dashboard-sidebar' && panel.metadata?.activeWidget) {
      const widgetConfig = WIDGET_ICONS[panel.metadata.activeWidget as string];
      if (widgetConfig) {
        return {
          icon: widgetConfig.icon,
          label: widgetConfig.label,
        };
      }
    }

    // Task sidebar with specific mode
    if (panelId === 'task-sidebar' && panel.metadata?.mode) {
      const mode = panel.metadata.mode as string;
      switch (mode) {
        case 'create':
          return { icon: Plus, label: 'New Task' };
        case 'view':
          return { icon: Eye, label: 'Task Details' };
        case 'edit':
          return { icon: Edit3, label: 'Edit Task' };
      }
    }

    // Default: use panel config
    const baseConfig = PANEL_ICONS[panelId];
    if (!baseConfig) return null;

    return {
      icon: baseConfig.icon,
      label: baseConfig.label,
    };
  }, [panelId]);
};