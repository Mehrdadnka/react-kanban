import React from 'react';
import { DashboardSidebar } from '@/features/DashboardSidebar/DashboardSidebar';
import { SearchSidebar } from '@/components/search/SearchSidebar/SearchSidebar';
import { useSidebarPanel } from '@/hooks/useSidebarPanel';
import { MegaTaskSidebar } from '@/features/TaskSidebars/MegaTaskSidebar';
import { CreateTaskSidebar } from '@/features/TaskSidebars/create/CreateTaskSidebar';


const SIDEBAR_POSITION = 'left';

const MegaTaskSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'task-sidebar',
    component: MegaTaskSidebar,
    priority: 12,
    position: SIDEBAR_POSITION,
  });
  return null;
};
// 2. اضافه کردن رجیسترار جدید برای CreateTaskSidebar
const CreateTaskSidebarRegistrar: React.FC = () => {
  useSidebarPanel({
    id: 'create-task-sidebar',
    component: CreateTaskSidebar,
    priority: 15,
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
      <MegaTaskSidebarRegistrar />
      <CreateTaskSidebarRegistrar />
      <DashboardSidebarRegistrar />
      <SearchSidebarRegistrar />
    </>
  );
};