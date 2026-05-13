// features/TaskSidebars/view/hooks/useTaskViewTabs.ts
import { useMemo } from 'react';
import { Task } from '@/types/task.types';
import {
  Layout, FileText, Calendar, Paperclip,
  Link2, StickyNote
} from 'lucide-react';

export interface TabConfig {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number }>;
  badge?: number;
  order: number;
}

// Accept null or undefined
export const useTaskViewTabs = (task: Task | null | undefined): TabConfig[] => {
  return useMemo(() => {
    if (!task) return []; // Handle both null and undefined

    const tabs: TabConfig[] = [
      {
        id: 'overview',
        label: 'Overview',
        icon: Layout,
        order: 1,
      },
      ...(task.description ? [{
        id: 'description',
        label: 'Description',
        icon: FileText,
        order: 2,
      }] : []),
      {
        id: 'schedule',
        label: 'Schedule',
        icon: Calendar,
        badge: task.dueDate ? 1 : undefined,
        order: 3,
      },
      ...(task.attachments?.length || task.estimatedHours ? [{
        id: 'meta-docs',
        label: 'Meta & Docs',
        icon: Paperclip,
        badge: task.attachments?.length || undefined,
        order: 4,
      }] : []),
      ...(task.relatedTasks?.length ? [{
        id: 'related-tasks',
        label: 'Related Tasks',
        icon: Link2,
        badge: task.relatedTasks.length,
        order: 5,
      }] : []),
      ...(task.customFields?.relatedNotes?.length ? [{
        id: 'related-notes',
        label: 'Related Notes',
        icon: StickyNote,
        badge: task.customFields.relatedNotes.length,
        order: 6,
      }] : []),
    ];

    return tabs.sort((a, b) => a.order - b.order);
  }, [task]);
};