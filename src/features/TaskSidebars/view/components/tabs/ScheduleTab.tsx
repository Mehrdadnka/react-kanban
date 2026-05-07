// features/TaskSidebars/view/components/tabs/ScheduleTab.tsx
import React from 'react';
import { cn } from '@/lib/utils';
import { Calendar, Clock, Bell, AlertTriangle } from 'lucide-react';
import { Task } from '@/types/task.types';
import { formatDate } from '@/features/TaskSidebars/utils';

interface ScheduleTabProps {
  task: Task;
  isDarkMode?: boolean;
}

interface TimeBlockProps {
  icon: React.ElementType;
  label: string;
  value: string;
  isDarkMode?: boolean;
  highlight?: boolean;
}

const TimeBlock: React.FC<TimeBlockProps> = ({ icon: Icon, label, value, isDarkMode, highlight }) => (
  <div className={cn(
    "flex items-start gap-3 p-3 rounded-lg",
    highlight
      ? isDarkMode ? "bg-blue-900/20 border border-blue-800/50" : "bg-blue-50 border border-blue-200"
      : isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
  )}>
    <div className={cn(
      "p-2 rounded-lg",
      highlight
        ? "bg-blue-500/20 text-blue-400"
        : isDarkMode ? "bg-gray-700 text-gray-400" : "bg-gray-200 text-gray-500"
    )}>
      <Icon size={16} />
    </div>
    <div>
      <p className={cn("text-xs font-medium", isDarkMode ? "text-gray-400" : "text-gray-500")}>
        {label}
      </p>
      <p className={cn("text-sm font-semibold mt-0.5", isDarkMode ? "text-gray-200" : "text-gray-800")}>
        {value}
      </p>
    </div>
  </div>
);

export const ScheduleTab: React.FC<ScheduleTabProps> = ({ task, isDarkMode }) => {
  const now = new Date();
  const isOverdue = task.dueDate && new Date(task.dueDate) < now && task.status !== 'completed';
  
  const formatTimeBlock = (date?: Date) => {
    if (!date) return 'Not set';
    return formatDate(date, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const hasAnyDate = task.startDate || task.dueDate || task.reminderDate || task.completedAt;
  const hasWorkingHours = task.workingHoursStart && task.workingHoursEnd;

  return (
    <div className="space-y-4">
      {!hasAnyDate && !hasWorkingHours && (
        <div className={cn(
          "text-center py-12 rounded-xl",
          isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
        )}>
          <Calendar size={32} className="mx-auto mb-3 text-gray-400" />
          <p className="text-sm text-gray-400">No schedule information set</p>
          <p className="text-xs text-gray-500 mt-1">Click edit to add dates</p>
        </div>
      )}

      {hasAnyDate && (
        <div className="space-y-2">
          {/* Start Date */}
          {task.startDate && (
            <TimeBlock
              icon={Calendar}
              label="Start Date"
              value={formatTimeBlock(task.startDate)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Due Date */}
          {task.dueDate && (
            <TimeBlock
              icon={AlertTriangle}
              label="Due Date"
              value={formatTimeBlock(task.dueDate)}
              isDarkMode={isDarkMode}
              highlight={isOverdue}
            />
          )}

          {/* Reminder */}
          {task.reminderDate && (
            <TimeBlock
              icon={Bell}
              label="Reminder"
              value={formatTimeBlock(task.reminderDate)}
              isDarkMode={isDarkMode}
            />
          )}

          {/* Completed */}
          {task.completedAt && (
            <TimeBlock
              icon={Clock}
              label="Completed"
              value={formatTimeBlock(task.completedAt)}
              isDarkMode={isDarkMode}
            />
          )}
        </div>
      )}

      {/* Working Hours */}
      {hasWorkingHours && (
        <div className={cn(
          "p-4 rounded-xl mt-4",
          isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
        )}>
          <p className={cn("text-xs font-medium mb-2", isDarkMode ? "text-gray-400" : "text-gray-500")}>
            Working Hours
          </p>
          <div className="flex items-center gap-3">
            <Clock size={18} className="text-blue-500" />
            <span className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
              {task.workingHoursStart} - {task.workingHoursEnd}
            </span>
          </div>
        </div>
      )}

      {/* Time Tracking Summary */}
      {task.timeSpent !== undefined && task.timeSpent > 0 && (
        <div className={cn(
          "p-4 rounded-xl mt-4",
          isDarkMode ? "bg-gray-800/50" : "bg-gray-50"
        )}>
          <p className={cn("text-xs font-medium mb-2", isDarkMode ? "text-gray-400" : "text-gray-500")}>
            Time Tracking
          </p>
          <div className="flex justify-between text-sm">
            <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
              Logged: {task.timeSpent}h
            </span>
            {task.estimatedHours && (
              <span className={isDarkMode ? "text-gray-300" : "text-gray-600"}>
                Estimated: {task.estimatedHours}h
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};