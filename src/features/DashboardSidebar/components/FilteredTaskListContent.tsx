import { Button } from "@/components/ui/button/Button";
import { ArrowRight } from "lucide-react";
import { filterLabels, filterRoutes } from "../utils";
import { cn } from "@/lib/utils";
import { SidebarProgressBar, SidebarTaskCard } from "@/components/sidebar-ui-engine";

const FilteredTaskListContent: React.FC<{
  activeWidget: string;
  widgetData: any;
  isDarkMode: boolean;
  onTaskClick: (taskId: string) => void;
  onNavigate: (path: string) => void;
}> = ({ activeWidget, widgetData, isDarkMode, onTaskClick, onNavigate }) => {
  const currentFilterLabel = filterLabels[activeWidget] || 'tasks';
  const currentFilterRoute = filterRoutes[activeWidget] || '/tasks';
  const filteredTasksCount = widgetData.filteredTasks?.length || 0;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className={cn('p-4 rounded-xl', isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50')}>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-lg">
            {filteredTasksCount} {currentFilterLabel}
          </h3>
        </div>
        <SidebarProgressBar
          label="Completion Rate"
          value={widgetData.completionRate}
          color="from-blue-500 to-purple-500"
        >
          <span className="text-xs text-gray-500">Total: {widgetData.totalTasks}</span>
        </SidebarProgressBar>
      </div>

      {/* Tasks List */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 mb-4">
          Tasks List
        </h3>
        {filteredTasksCount === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p>No {currentFilterLabel} found</p>
          </div>
        ) : (
          <div className="space-y-2">
            {widgetData.filteredTasks?.map((task: any) => (
              <SidebarTaskCard
                key={task.id}
                task={task}
                onClick={onTaskClick}
                variant="detailed"
              />
            ))}
          </div>
        )}
      </div>

      <Button
        onClick={() => onNavigate(currentFilterRoute)}
        className="w-full flex items-center justify-center gap-2"
        variant="outline"
      >
        View in Board <ArrowRight size={16} />
      </Button>
    </div>
  );
};

export default FilteredTaskListContent;