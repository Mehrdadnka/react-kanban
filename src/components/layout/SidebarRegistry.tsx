import React from 'react';
import { TaskSidebar } from '@/features/TaskSidebar/TaskSidebar';
import { DashboardSidebar } from '@/features/DashboardSidebar/DashboardSidebar';
import { SearchSidebar } from '@/components/search/SearchSidebar/SearchSidebar';
import { useSidebarPanel } from '@/hooks/useSidebarPanel';

const SIDEBAR_POSITION = 'left';

const TaskSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'task-sidebar',
    component: TaskSidebar,
    priority: 10,
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

const SearchSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'search-sidebar',
    component: SearchSidebar,
    priority: 20,
    position: SIDEBAR_POSITION,
  });
  return null;
};

export const SidebarRegistry: React.FC = () => {
  return (
    <>
      <TaskSidebarRegistrar />
      <DashboardSidebarRegistrar />
      <SearchSidebarRegistrar />
    </>
  );
};