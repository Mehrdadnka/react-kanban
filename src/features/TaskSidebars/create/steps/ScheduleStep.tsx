// src/features/TaskSidebars/create/steps/ScheduleStep.tsx
import React from 'react';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { calculateDuration } from '@/features/TaskSidebars/utils';
import { cn } from '@/lib/utils';

interface ScheduleStepProps {
  startDate?: Date;
  dueDate?: Date;
  reminderDate?: Date;
  onStartDateChange?: (date: Date) => void;
  onDueDateChange?: (date: Date) => void;
  onReminderDateChange?: (date: Date) => void;
  disabled?: boolean;
  isDarkMode?: boolean;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  startDate,
  dueDate,
  reminderDate,
  onStartDateChange,
  onDueDateChange,
  onReminderDateChange,
  disabled = false,
  isDarkMode = false,
}) => {
  const hasDateConflict = startDate && dueDate && startDate > dueDate;
  const durationDays = startDate && dueDate && !hasDateConflict
    ? calculateDuration(startDate, dueDate)
    : null;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Calendar size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Schedule
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Set dates for this task. All fields are optional.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={onStartDateChange as any}
          disabled={disabled}
        />

        <DatePicker
          label="Due Date"
          value={dueDate}
          onChange={onDueDateChange as any}
          disabled={disabled}
          includeTime
        />

        <DatePicker
          label="Reminder"
          value={reminderDate}
          onChange={onReminderDateChange as any}
          disabled={disabled}
          includeTime
        />
      </div>

      {/* Duration Calculation */}
      {durationDays !== null && (
        <div className={cn(
          'p-4 rounded-xl space-y-1 border',
          isDarkMode
            ? 'bg-blue-900/20 border-blue-800/50'
            : 'bg-blue-50/50 border-blue-100'
        )}>
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-blue-500" />
            <span className={cn("text-xs font-medium", isDarkMode ? "text-blue-300" : "text-blue-700")}>
              Duration
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn("text-2xl font-bold", isDarkMode ? "text-gray-100" : "text-gray-900")}>
              {durationDays}
            </span>
            <span className={cn("text-sm", isDarkMode ? "text-gray-400" : "text-gray-500")}>
              {durationDays === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      )}

      {/* Date Conflict Warning */}
      {hasDateConflict && (
        <div className={cn(
          "flex items-center gap-2 p-3 rounded-lg text-xs",
          isDarkMode ? "bg-red-900/20 text-red-400" : "bg-red-50 text-red-600"
        )}>
          <AlertCircle size={14} />
          Start date must be before due date
        </div>
      )}
    </div>
  );
};

ScheduleStep.displayName = 'ScheduleStep';