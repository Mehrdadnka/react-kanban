import React from 'react';
import { TaskSidebar } from '@/components/board/TaskSidebar/TaskSidebar';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar/DashboardSidebar';
import { SearchSidebar } from '@/components/search/SearchSidebar/SearchSidebar';
import { useSidebarPanel } from '@/hooks/useSidebarPanel';

const TaskSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'task-sidebar',
    component: TaskSidebar,
    priority: 10,
  });
  return null;
};

const DashboardSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'dashboard-sidebar',
    component: DashboardSidebar,
    priority: 5,
  });
  return null;
};

const SearchSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'search-sidebar',
    component: SearchSidebar,
    priority: 15,
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