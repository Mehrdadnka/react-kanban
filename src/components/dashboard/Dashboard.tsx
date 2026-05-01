import React from 'react';
import { TaskStatsWidget } from '@/features/widgets/TaskStatsWidget';
import { RecentTasksWidget } from '@/features/widgets/RecentTasksWidget';
import { PriorityBreakdownWidget } from '@/features/widgets/PriorityBreakdownWidget';

export const Dashboard: React.FC = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
      <div className="lg:col-span-1 flex flex-col gap-4 h-full">
        <div className="flex-1 min-h-0">
          <PriorityBreakdownWidget />
        </div>
        <div className="flex-1 min-h-0">
          <RecentTasksWidget />
        </div>
      </div>

      <div className="lg:col-span-2 h-full">
        <TaskStatsWidget />
      </div>
    </div>
  );
};