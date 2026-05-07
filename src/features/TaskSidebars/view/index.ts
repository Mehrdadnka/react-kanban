// features/TaskSidebars/view/index.ts
export { TaskViewSidebar } from './TaskViewSidebar';
export { TaskViewLayout } from './TaskViewLayout';

// Components
export { TabNavigation } from './components/TabNavigation';

// Tabs
export { OverviewTab } from './components/tabs/OverviewTab';
export { DescriptionTab } from './components/tabs/DescriptionTab';
export { ScheduleTab } from './components/tabs/ScheduleTab';
export { MetaDocsTab } from './components/tabs/MetaDocsTab';
export { RelatedTasksTab } from './components/tabs/RelatedTasksTab';
export { RelatedNotesTab } from './components/tabs/RelatedNotesTab';

// Shared
export { EmptyState } from './components/shared/EmptyState';
export { InfoField } from './components/shared/InfoField';
export { EditableInfoField } from './components/shared/EditableInfoField';
export { SectionHeader } from './components/shared/SectionHeader';

// Hooks
export { useTaskViewTabs } from './hooks/useTaskViewTabs';
export type { TabConfig } from './hooks/useTaskViewTabs';