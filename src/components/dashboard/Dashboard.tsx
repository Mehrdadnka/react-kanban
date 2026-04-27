import React from 'react';
import { TaskStatsWidget } from './widgets/TaskStatsWidget';
import { RecentTasksWidget } from './widgets/RecentTasksWidget';
import { PriorityBreakdownWidget } from './widgets/PriorityBreakdownWidget';
import { DashboardSidebar } from './DashboardSidebar/DashboardSidebar';

export const Dashboard: React.FC = () => {
  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full auto-rows-fr">
        <div className="lg:col-span-1 space-y-4">
          <PriorityBreakdownWidget />
          <RecentTasksWidget />
        </div>

        <div className="lg:col-span-2">
          <TaskStatsWidget />
        </div>
      </div>
      <DashboardSidebar />
    </>
  );
};