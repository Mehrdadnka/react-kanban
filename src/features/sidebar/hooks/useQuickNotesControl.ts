// features/sidebar/hooks/useQuickNotesControl.ts
import { useCallback } from 'react';
import { useQuickNotesStore } from '@/stores/quick-notes.store';
import { useSidebarEngineStore } from '@/stores/sidebar-engine/sidebar-engine.store';
import { useShallow } from 'zustand/react/shallow';
import { PANEL_ICONS } from '@/config/panel-icons.config';

export const useQuickNotesControl = () => {
  const { openQuickNotes } = useQuickNotesStore();
  
  const quickNotesPanelState = useSidebarEngineStore(
    useShallow((state) => state.panels['quick-notes-sidebar'])
  );
  
  const isQuickNotesOpen = quickNotesPanelState?.isOpen && !quickNotesPanelState?.isMinimized;
  const isQuickNotesMinimized = quickNotesPanelState?.isMinimized;
  
  const quickNotesConfig = PANEL_ICONS['quick-notes-sidebar'];
  const QuickNotesIcon = quickNotesConfig.icon;

  const handleQuickNotesClick = useCallback(() => {
    if (isQuickNotesOpen) {
      // اگر بازه، مینیمایز کن
      useSidebarEngineStore.getState().minimize('quick-notes-sidebar');
    } else if (isQuickNotesMinimized) {
      // اگر مینیمایزه، بازش کن
      openQuickNotes();
    } else {
      // اگر بسته است، باز کن
      openQuickNotes();
    }
  }, [isQuickNotesOpen, isQuickNotesMinimized, openQuickNotes]);

  const quickNotesLabel = isQuickNotesMinimized 
    ? `${quickNotesConfig.label} (Minimized)` 
    : isQuickNotesOpen 
      ? `Close ${quickNotesConfig.label}` 
      : quickNotesConfig.label;

  return {
    QuickNotesIcon,
    isQuickNotesOpen,
    isQuickNotesMinimized,
    handleQuickNotesClick,
    quickNotesLabel,
  };
};