import { SidebarPriorityList } from "@/components/sidebar-ui-engine";
import { Button } from "@/components/ui/button/Button";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowRight, Flag } from "lucide-react";

const PriorityBreakdownContent: React.FC<{
  widgetData: any;
  isDarkMode: boolean;
  onNavigate: (path: string) => void;
}> = ({ widgetData, isDarkMode, onNavigate }) => (
  <div className="space-y-6">
    <SidebarPriorityList
      items={[
        {
          key: 'high',
          label: 'High Priority',
          count: widgetData.priorityData.high,
          total: widgetData.totalTasks,
          color: 'from-red-500 to-red-600',
          textColor: 'text-red-600',
          icon: AlertTriangle,
        },
        {
          key: 'medium',
          label: 'Medium Priority',
          count: widgetData.priorityData.medium,
          total: widgetData.totalTasks,
          color: 'from-yellow-500 to-yellow-600',
          textColor: 'text-yellow-600',
          icon: Flag,
        },
        {
          key: 'low',
          label: 'Low Priority',
          count: widgetData.priorityData.low,
          total: widgetData.totalTasks,
          color: 'from-green-500 to-green-600',
          textColor: 'text-green-600',
          icon: Flag,
        },
      ]}
    />

    {widgetData.priorityData.high > 0 && (
      <div className={cn(
        'p-4 rounded-lg border-l-4 border-red-500',
        isDarkMode ? 'bg-red-900/20' : 'bg-red-50'
      )}>
        <div className="flex items-center gap-2">
          <AlertTriangle size={16} className="text-red-500" />
          <span className="font-medium text-red-700 dark:text-red-300">
            {widgetData.priorityData.high} high priority task{widgetData.priorityData.high !== 1 ? 's' : ''} need{widgetData.priorityData.high === 1 ? 's' : ''} attention
          </span>
        </div>
      </div>
    )}

    <Button 
      onClick={() => onNavigate('/tasks')} 
      className="w-full flex items-center justify-center gap-2"
    >
      Manage Priorities <ArrowRight size={16} />
    </Button>
  </div>
);

export default PriorityBreakdownContent