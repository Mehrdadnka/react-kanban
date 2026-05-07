import { 
  CheckSquare, LayoutDashboard, Search, 
  Settings, Bell, Calendar, FileText,
  Home, ListTodo, Clock, Flag,
  CheckCircle2, ClipboardList, Zap,
  LucideIcon, AlertTriangle, TrendingUp,
  Activity, ArrowRight,
  Eye
} from 'lucide-react';

export type { LucideIcon } from 'lucide-react';

export interface PanelIconConfig {
  icon: LucideIcon;
  label: string;
  description?: string;
}

export const PANEL_ICONS: Record<string, PanelIconConfig> = {
  'create-task-sidebar': {
    icon: CheckSquare,
    label: 'Task Panel',
    description: 'Create, view, and edit tasks',
  },
  'task-view-sidebar': {
    icon: Eye,
    label: 'Task View',
    description: 'View task details and information',
  },
  'dashboard-sidebar': {
    icon: LayoutDashboard,
    label: 'Dashboard',
    description: 'Task overview and statistics',
  },
  'quick-notes-sidebar': {
    icon: FileText,
    label: 'Quick Notes',
    description: 'Write and manage quick notes',
  },
  'search-sidebar': {
    icon: Search,
    label: 'Search',
    description: 'Search across all tasks',
  },
  'settings-sidebar': {
    icon: Settings,
    label: 'Settings',
    description: 'Application settings',
  },
  'notifications-panel': {
    icon: Bell,
    label: 'Notifications',
    description: 'Task notifications',
  },
} as const;

export const NAV_ICONS: Record<string, PanelIconConfig> = {
  'home': {
    icon: Home,
    label: 'Home',
  },
  'tasks': {
    icon: ListTodo,
    label: 'Tasks',
  },
} as const;

export const WIDGET_ICONS: Record<string, PanelIconConfig> = {
  'task-overview': {
    icon: CheckSquare,
    label: 'Task Overview',
  },
  'total-tasks': {
    icon: ListTodo,
    label: 'All Tasks',
  },
  'in-progress': {
    icon: Zap,
    label: 'In Progress',
  },
  'completed': {
    icon: CheckCircle2,
    label: 'Completed',
  },
  'todo': {
    icon: ClipboardList,
    label: 'Todo',
  },
  'recent-tasks': {
    icon: Clock,
    label: 'Recent Tasks',
  },
  'priority-breakdown': {
    icon: Flag,
    label: 'Priorities',
  },
} as const;

export const COLUMN_ICONS: Record<string, PanelIconConfig> = {
  'todo': {
    icon: ClipboardList,
    label: 'To Do',
  },
  'in-progress': {
    icon: Zap,
    label: 'In Progress',
  },
  'done': {
    icon: CheckCircle2,
    label: 'Done',
  },
} as const;