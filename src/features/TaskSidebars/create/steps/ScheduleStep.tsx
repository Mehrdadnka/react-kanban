import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Bell } from 'lucide-react';
import { RangeDatePicker } from '@/components/ui/DatePicker/RangeDatePicker';
import { calculateDuration } from '@/features/TaskSidebars/utils';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';

interface ScheduleStepProps {
  startDate?: Date;
  dueDate?: Date;
  reminderDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onDueDateChange?: (date: Date | undefined) => void;
  onReminderDateChange?: (date: Date | undefined) => void;
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
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startDate,
    to: dueDate,
  });

  // Sync external props to internal state
  useEffect(() => {
    setRange({ from: startDate, to: dueDate });
  }, [startDate, dueDate]);

  const hasDateConflict = range.from && range.to && range.from > range.to;
  const durationDays = range.from && range.to && !hasDateConflict
    ? calculateDuration(range.from, range.to)
    : null;

  const handleRangeChange = (newRange: { from: Date | undefined; to: Date | undefined } | undefined) => {
    const updatedRange = newRange || { from: undefined, to: undefined };
    setRange(updatedRange);
    
    onStartDateChange?.(updatedRange.from);
    onDueDateChange?.(updatedRange.to);
  };

  const handleReminderChange = (date: Date | undefined) => {
    onReminderDateChange?.(date);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Calendar size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Schedule
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Select start and due date by dragging. All fields are optional.
          </p>
        </div>
      </div>

<div className="flex flex-row items-start gap-4">
  {/* Date Range Picker for Start + Due Date */}
  <div className="space-y-2 flex-[2]">
    <label className={cn(
      "text-sm font-medium flex items-center gap-1.5",
      isDarkMode ? "text-gray-300" : "text-gray-700"
    )}>
      <Calendar size={14} />
      Date Range
    </label>
    <div className='flex items-center'>

    <RangeDatePicker
      value={range}
      onChange={handleRangeChange}
      disabled={disabled}
      includeTime={true}
      numberOfMonths={2}
      isDarkMode={isDarkMode}
    />
  </div>
  </div>

  {/* Reminder Picker */}
  <div className="space-y-2 flex-1 w-fit">
    <label className={cn(
      "text-sm font-medium !pt-0 flex items-center gap-1.5",
      isDarkMode ? "text-gray-300" : "text-gray-700"
    )}>
      <Bell size={14} />
      Reminder
    </label>
    <div className='flex items-center'>

    <DatePicker
      value={reminderDate}
      onChange={handleReminderChange}
      disabled={disabled}
      includeTime={true}
      isDarkMode={isDarkMode}
      />
      </div>
  </div>
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
          <div className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            {range.from && range.to && 
              `${range.from.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} → ${range.to.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
            }
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