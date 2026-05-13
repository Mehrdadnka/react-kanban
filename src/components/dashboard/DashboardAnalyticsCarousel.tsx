import React, { useCallback } from 'react';
import { ChartCarousel } from '@/components/charts/chart-carousel';
import { 
  TaskProgressRing, 
  PriorityBreakdown, 
  TaskVelocity, 
  LabelSunburst, 
  SparkLine 
} from '@/components/charts';
import { ChartConfig } from '@/components/charts/chart-carousel/types';
import { cn } from '@/lib/utils';
import { useDashboardChartData } from '@/hooks/useDashboardChartData';
import { ActivityHeatmap as ActivityHeatmapChart } from '@/features/widgets/ActivityHeatmap';
import { Calendar } from 'lucide-react';

interface DashboardAnalyticsCarouselProps {
  className?: string;
  compact?: boolean;
}

export const DashboardAnalyticsCarousel: React.FC<DashboardAnalyticsCarouselProps> = ({
  className,
  compact = false,
}) => {
  const {
    overallProgress,
    boardHealthData,
    globalPriorityData,
    productivityTrend,
    globalLabelData,
    recentActivityData,
    charts,
    heatmapStats,
    xpProgressData,
  } = useDashboardChartData();

  const renderCustomSlide = useCallback((chart: ChartConfig, index: number) => {
    const height = compact ? 320 : 400;

    switch (chart.id) {
      case 'overall-progress':
        return (
          <div className="flex items-center justify-center gap-6 ">
            <TaskProgressRing
              completed={overallProgress.done}
              total={overallProgress.total}
              color="#10b981"
              labelFormat="fraction"
              animate={true}
            />
            {/* Mini stats */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600 dark:text-gray-400">To Do: {overallProgress.todo}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span className="text-gray-600 dark:text-gray-400">In Progress: {overallProgress.inProgress}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-gray-600 dark:text-gray-400">Done: {overallProgress.done}</span>
              </div>
            </div>
          </div>
        );
      
      case 'board-health':
        return (
          <PriorityBreakdown
            data={boardHealthData.map(b => ({
              label: b.name.length > 12 ? b.name.slice(0, 12) + '...' : b.name,
              value: b.value,
              color: b.color,
            }))}
            orientation="horizontal"
            animate={true}
            showValues={true}
          />
        );
       case 'activity-heatmap':
        return (
          <div className="space-y-2">
            <ActivityHeatmapChart />
            {!compact && (
              <div className="text-xs flex items-start gap-2 absolute bottom-0 w-full text-center text-gray-500 dark:text-gray-400">
                <Calendar size={12} /> Last {20} weeks of activity • {heatmapStats.activeDays} active days
              </div>
            )}
          </div>
        );


      case 'priority-distribution':
        return (
          <PriorityBreakdown
            data={globalPriorityData}
            orientation="horizontal"
            animate={true}
            showValues={true}
          />
        );
      
      case 'productivity-trend':
        return (
          <TaskVelocity
            data={productivityTrend}
            showArea={true}
            animate={true}
          />
        );
      
      case 'label-distribution':
        return (
          <LabelSunburst
            data={globalLabelData}
            showLabels={!compact}
            animate={true}
          />
        );
      
      case 'xp-activity':
        return (
          <div className="space-y-3">
            <SparkLine
              data={recentActivityData}
              color="#ec4899"
              areaColor="rgba(236, 72, 153, 0.15)"
              smooth={true}
              animate={true}
            />
            <div className="flex justify-between items-center px-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{getLevelEmoji(xpProgressData.currentLevel)}</span>
                <div>
                  <div className="text-sm font-semibold">Level {xpProgressData.currentLevel}</div>
                  <div className="text-xs text-gray-500">{xpProgressData.title}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-pink-500">{xpProgressData.totalXP.toLocaleString()} XP</div>
                <div className="text-xs text-gray-500">{xpProgressData.progress}% to next</div>
              </div>
            </div>
          </div>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <span className="text-4xl block mb-2">{chart.icon}</span>
              <span className="text-sm">{chart.title}</span>
            </div>
          </div>
        );
    }
  }, [
    overallProgress, 
    boardHealthData, 
    globalPriorityData, 
    productivityTrend, 
    globalLabelData, 
    recentActivityData,
    xpProgressData,
    compact
  ]);

  if (charts.length === 0) {
    return (
      <div className={cn(
        'flex items-center justify-center rounded-xl',
        compact ? 'h-32' : 'h-48',
        'bg-gray-50 dark:bg-gray-800/50 border border-dashed border-gray-300 dark:border-gray-700'
      )}>
        <div className="text-center text-gray-400">
          <span className="text-3xl block mb-2">📊</span>
          <span className="text-sm">No analytics available yet</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border bg-white dark:bg-gray-900/50 dark:border-gray-800',
      'backdrop-blur-sm shadow-lg',
      compact ? 'p-3' : 'p-4',
      className
    )}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-lg">Analytics Dashboard</h3>
            <p className="text-xs text-gray-500">Real-time insights across all boards</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-1 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              {charts.length} charts
            </span>
          </div>
        </div>
      )}

      <ChartCarousel
        charts={charts}
        autoPlayInterval={5000}
        chartHeight={compact ? 200 : 280}
        showControls={true}
        showDots={true}
        renderCustomSlide={renderCustomSlide}
      />
    </div>
  );
};

// Helper function
function getLevelEmoji(level: number): string {
  if (level >= 100) return '🔮';
  if (level >= 75) return '👑';
  if (level >= 50) return '🏆';
  if (level >= 35) return '🎯';
  if (level >= 20) return '⚡';
  if (level >= 10) return '📚';
  return '🌱';
}