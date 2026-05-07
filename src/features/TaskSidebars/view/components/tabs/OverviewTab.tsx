// features/TaskSidebars/view/components/tabs/OverviewTab.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task.types';
import { Badge } from '@/components/ui/badge/Badge';
import { PriorityColors } from '@/components/ui/PriorityColors';

interface OverviewTabProps {
  task: Task;
  isDarkMode?: boolean;
}

const FieldRow: React.FC<{
  label: string;
  children: React.ReactNode;
  isDarkMode?: boolean;
}> = ({ label, children, isDarkMode }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 py-2.5 border-b border-gray-100 dark:border-gray-800 last:border-0">
    <span className={cn(
      "text-xs font-medium uppercase tracking-wider min-w-[120px]",
      isDarkMode ? "text-gray-400" : "text-gray-500"
    )}>
      {label}
    </span>
    <div className="flex-1 text-sm">{children}</div>
  </div>
);

export const OverviewTab: React.FC<OverviewTabProps> = ({ task, isDarkMode }) => {
  return (
    <div className="space-y-1">
      <div className={cn(
        "p-4 rounded-xl mb-4",
        isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
      )}>
        <h3 className={cn(
          "text-lg font-semibold mb-2",
          isDarkMode ? "text-gray-100" : "text-gray-900"
        )}>
          {task.title}
        </h3>
        {task.shortDescription && (
          <p className={cn(
            "text-sm",
            isDarkMode ? "text-gray-400" : "text-gray-600"
          )}>
            {task.shortDescription}
          </p>
        )}
      </div>

      <div className={cn(
        "rounded-xl border",
        isDarkMode ? "border-gray-800 divide-gray-800" : "border-gray-200 divide-gray-200"
      )}>
        <FieldRow label="Type" isDarkMode={isDarkMode}>
          <Badge variant="outline" className="capitalize">{task.type}</Badge>
        </FieldRow>

        <FieldRow label="Status" isDarkMode={isDarkMode}>
          <Badge variant="outline" className="capitalize">{task.status}</Badge>
        </FieldRow>

        <FieldRow label="Priority" isDarkMode={isDarkMode}>
          <Badge className={cn("capitalize", PriorityColors[task.priority])}>
            {task.priority}
          </Badge>
        </FieldRow>

        <FieldRow label="Column" isDarkMode={isDarkMode}>
          <span className="capitalize">{task.columnId}</span>
        </FieldRow>

        {task.labels.length > 0 && (
          <FieldRow label="Labels" isDarkMode={isDarkMode}>
            <div className="flex flex-wrap gap-1.5">
              {task.labels.map(label => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
          </FieldRow>
        )}

        {task.milestoneIds.length > 0 && (
          <FieldRow label="Milestones" isDarkMode={isDarkMode}>
            <div className="flex flex-wrap gap-1.5">
              {task.milestoneIds.map(id => (
                <Badge key={id} variant="outline" className="text-xs">
                  {id}
                </Badge>
              ))}
            </div>
          </FieldRow>
        )}

        {task.projectIds.length > 0 && (
          <FieldRow label="Projects" isDarkMode={isDarkMode}>
            <div className="flex flex-wrap gap-1.5">
              {task.projectIds.map(id => (
                <Badge key={id} variant="outline" className="text-xs">
                  {id}
                </Badge>
              ))}
            </div>
          </FieldRow>
        )}
      </div>
    </div>
  );
};