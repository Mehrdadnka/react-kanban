import React from 'react';
import { TaskStatsWidget } from '@/features/widgets/TaskStatsWidget';
import { RecentTasksWidget } from '@/features/widgets/RecentTasksWidget';
import { PriorityBreakdownWidget } from '@/features/widgets/PriorityBreakdownWidget';
import { LogoCanvas } from '@/features/logo-3d';

export const Dashboard: React.FC = () => {
  return (
    <div className="w-fit m-auto flex items-center justify-center">
   {/* <h1 className="text-6xl my-auto font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
            Synapse
          </h1> */}
        <LogoCanvas size={1200} />

      <div className="lg:col-span-2 h-fit z-40 absolute bottom-2 right-2">
        <TaskStatsWidget />
      </div>
    </div>
  );
};