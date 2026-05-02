import { SidebarProgressBar, SidebarStatsCard } from "@/components/sidebar-ui-engine";
import { cn } from "@/lib/utils";
import { Button } from "@radix-ui/themes";
import { Activity, ArrowRight, CheckCircle2, ListTodo, TrendingUp, Zap } from "lucide-react";

const TaskOverviewContent: React.FC<{
  widgetData: any;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
}> = ({ widgetData, isDarkMode, onNavigate }) => (
  <div className="space-y-6">
    {/* Stats Cards */}
    <div className="grid grid-cols-2 gap-4">
      <SidebarStatsCard
        icon={ListTodo}
        label="Total Tasks"
        value={widgetData.totalTasks}
        color="text-blue-600"
        bgColor="bg-blue-50 dark:bg-blue-900/30"
        onClick={() => onNavigate('/tasks')}
      />
      <SidebarStatsCard
        icon={Zap}
        label="In Progress"
        value={widgetData.inProgressCount}
        color="text-yellow-600"
        bgColor="bg-yellow-50 dark:bg-yellow-900/30"
        onClick={() => onNavigate('/tasks?filter=in-progress')}
      />
      <SidebarStatsCard
        icon={CheckCircle2}
        label="Completed"
        value={widgetData.completedCount}
        color="text-green-600"
        bgColor="bg-green-50 dark:bg-green-900/30"
        onClick={() => onNavigate('/tasks?filter=done')}
      />
      <SidebarStatsCard
        icon={ListTodo}
        label="Todo"
        value={widgetData.todoCount}
        color="text-gray-600"
        bgColor="bg-gray-50 dark:bg-gray-700/30"
        onClick={() => onNavigate('/tasks?filter=todo')}
      />
    </div>

    {/* Progress Section */}
    <div className={cn(
      'p-4 rounded-xl',
      isDarkMode ? 'bg-gray-800/50' : 'bg-gradient-to-br from-blue-50 to-purple-50'
    )}>
      <div className="flex items-center gap-2 mb-4">
        <Activity size={18} className="text-blue-600" />
        <h3 className="font-semibold">Progress Overview</h3>
      </div>

      <SidebarProgressBar
        label="Completion Rate"
        value={widgetData.completionRate}
        color="from-blue-500 to-purple-500"
        className="mb-4"
      />

      <div className="grid grid-cols-2 gap-3">
        <div className={cn(
          'text-center p-3 rounded-lg',
          isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
        )}>
          <TrendingUp size={16} className="mx-auto mb-1 text-green-500" />
          <div className="text-xs">Completed</div>
          <div className="text-lg font-bold text-green-600">{widgetData.completedCount}</div>
        </div>
        <div className={cn(
          'text-center p-3 rounded-lg',
          isDarkMode ? 'bg-gray-700/50' : 'bg-white/50'
        )}>
          <Zap size={16} className="mx-auto mb-1 text-yellow-500" />
          <div className="text-xs">Active</div>
          <div className="text-lg font-bold text-yellow-600">{widgetData.inProgressCount}</div>
        </div>
      </div>
    </div>

    <Button onClick={() => onNavigate('/tasks')} className="w-full flex items-center justify-center gap-2">
      View All Tasks <ArrowRight size={16} />
    </Button>
  </div>
);

export default TaskOverviewContent;