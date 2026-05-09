import React from 'react';
import { DashboardSidebar } from '@/features/DashboardSidebar/DashboardSidebar';
import { SearchSidebar } from '@/components/search/SearchSidebar/SearchSidebar';
import { useSidebarPanel } from '@/hooks/useSidebarPanel';
import { CreateTaskSidebar } from '@/features/TaskSidebars/create/CreateTaskSidebar';
import { QuickNotesSidebar } from '@/features/QuickNotesSidebar/QuickNotesSidebar';
import { SettingsSidebar } from '@/features/SettingsSidebar/SettingsSidebar';
import { TaskViewSidebar } from '@/features/TaskSidebars/view/TaskViewSidebar';
import { CreateBoardSidebar } from '@/features/BoardSidebars/create/CreateBoardSidebar';


const SIDEBAR_POSITION = 'left';

const CreateBoardSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'create-board-sidebar',
    component: CreateBoardSidebar,
    priority: 14,
    position: 'left',
  });
  return null;
};
const CreateTaskSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'create-task-sidebar',
    component: CreateTaskSidebar,
    priority: 15,
    position: SIDEBAR_POSITION,
  });
  return null;
};
const TaskViewSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'task-view-sidebar',
    component: TaskViewSidebar,
    priority: 13,
    position: SIDEBAR_POSITION,
  });
  return null;
};
const DashboardSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'dashboard-sidebar',
    component: DashboardSidebar,
    priority: 5,
    position: SIDEBAR_POSITION,
  });
  return null;
};
const QuickNotesSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'quick-notes-sidebar',
    component: QuickNotesSidebar,
    priority: 18, 
    position: 'left',
  });
  return null;
};
const SearchSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'search-sidebar',
    component: SearchSidebar,
    priority: 20,
    position: SIDEBAR_POSITION,
  });
  return null;
};
const SettingsSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'settings-sidebar',
    component: SettingsSidebar,
    priority: 10, 
    position: 'left',
  });
  return null;
};
export const SidebarRegistry: React.FC = () => {
  return (
    <>
      <CreateBoardSidebarRegistrar />
      <CreateTaskSidebarRegistrar />
      <TaskViewSidebarRegistrar />
      <DashboardSidebarRegistrar />
      <QuickNotesSidebarRegistrar />
      <SearchSidebarRegistrar />
      <SettingsSidebarRegistrar />
    </>
  );
};