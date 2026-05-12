import React from 'react';
import { TaskStatsWidget } from '@/features/widgets/TaskStatsWidget';
import { RecentTasksWidget } from '@/features/widgets/RecentTasksWidget';
import { PriorityBreakdownWidget } from '@/features/widgets/PriorityBreakdownWidget';
import { LogoCanvas } from '@/features/logo-3d';
import { DashboardAnalyticsCarousel } from './DashboardAnalyticsCarousel';
import { useDashboardChartData } from '@/hooks/useDashboardChartData';

export const Dashboard: React.FC = () => {

  return (
    <div className="w-fit m-auto flex items-center justify-center">
      <LogoCanvas size={1200} />

      <div className="w-[400px] z-40 absolute bottom-2 right-2">
        <DashboardAnalyticsCarousel />
      </div>

    </div>
  );
};