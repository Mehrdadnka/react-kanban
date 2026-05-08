// ScheduleStep.tsx
import React, { useState, useEffect } from 'react';
import { Calendar, Clock, AlertCircle, Bell } from 'lucide-react';
import { RangeDatePicker } from '@/components/ui/DatePicker/RangeDatePicker';
import { calculateDuration } from '@/features/TaskSidebars/utils';
import { cn } from '@/lib/utils';
import { DatePicker } from '@/components/ui/DatePicker/DatePicker';
import { TimeRangePicker } from '@/components/ui/TimePicker/TimeRangePicker';
import { Tab, TabItem } from '@/components/ui/tab/Tab';
import { TimePicker } from '@/components/ui/TimePicker/TimePicker';

interface ScheduleStepProps {
  startDate?: Date;
  dueDate?: Date;
  reminderDate?: Date;
  onStartDateChange?: (date: Date | undefined) => void;
  onDueDateChange?: (date: Date | undefined) => void;
  onReminderDateChange?: (date: Date | undefined) => void;
  disabled?: boolean;
  isDarkMode?: boolean;
  workingHoursStart?: string;
  workingHoursEnd?: string;
  onWorkingHoursChange?: (startTime: string, endTime: string) => void;
}

export const ScheduleStep: React.FC<ScheduleStepProps> = ({
  startDate,
  dueDate,
  reminderDate,
  onStartDateChange,
  onDueDateChange,
  onReminderDateChange,
  workingHoursStart, 
  workingHoursEnd,
  onWorkingHoursChange,
  disabled = false,
  isDarkMode = false,

}) => {
  const [range, setRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: startDate,
    to: dueDate,
  });
  
  const [reminderTime, setReminderTime] = useState('09:00');

  // Sync external props to internal state
  useEffect(() => {
    setRange({ from: startDate, to: dueDate });
  }, [startDate, dueDate]);

  // Sync reminderDate to reminderTime
  useEffect(() => {
    if (reminderDate) {
      const hours = String(reminderDate.getHours()).padStart(2, '0');
      const minutes = String(reminderDate.getMinutes()).padStart(2, '0');
      const newTime = `${hours}:${minutes}`;
      setReminderTime(prev => prev === newTime ? prev : newTime);
    }
  }, [reminderDate?.getTime()]);

  const hasDateConflict = range.from && range.to && range.from > range.to;
  const durationDays = range.from && range.to && !hasDateConflict
    ? calculateDuration(range.from, range.to)
    : null;

  const handleRangeChange = (newRange: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (newRange) {
      onStartDateChange?.(newRange.from);
      onDueDateChange?.(newRange.to);
    } else {
      onStartDateChange?.(undefined);
      onDueDateChange?.(undefined);
    }
  };

  const handleReminderDateChange = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = reminderTime.split(':').map(Number);
      const newDate = new Date(date); // کپی
      newDate.setHours(hours, minutes, 0, 0);
      onReminderDateChange?.(newDate);
    } else {
      onReminderDateChange?.(undefined);
    }
  };

  // ScheduleStep.tsx
  const handleReminderTimeChange = (event: { formatted24: string }) => {
    const time = event.formatted24; // استخراج string از event
    
    if (time === reminderTime) return;
    
    setReminderTime(time);
    
    if (reminderDate) {
      const [hours, minutes] = time.split(':').map(Number);
      const updatedDate = new Date(reminderDate);
      updatedDate.setHours(hours, minutes, 0, 0);
      onReminderDateChange?.(updatedDate);
    }
  };

  const tabItems: TabItem[] = [
    {
      id: 'dates',
      label: 'Date Range',
      icon: <Calendar size={16} />,
      content: (
        <div className="space-y-2 flex flex-row items-start justify-center gap-4">
          <div className="flex-2 flex flex-row h-fit w-fit">
            <RangeDatePicker
              value={range}
              onChange={handleRangeChange}
              disabled={disabled}
              numberOfMonths={2}
              isDarkMode={isDarkMode}
            />
          </div>          
          <div className="flex-2 flex flex-row h-auto w-auto">
            <TimeRangePicker
              startTime={workingHoursStart || '09:00'}
              endTime={workingHoursEnd || '17:00'}
              onChange={(start, end) => onWorkingHoursChange?.(start, end)}
              label="Working Hours"
              size="md"
              minDuration={30}
              showDuration={false}
              showPresets={false}
              // isDarkMode={isDarkMode}
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
      ),
    },
    {
      id: 'reminder',
      label: 'Reminder',
      icon: <Bell size={16} />,
      content: (
        <div className="space-y-2 flex flex-row items-start justify-center gap-4">
          <div className="flex-2 flex flex-row h-fit w-fit">
            <DatePicker
              value={reminderDate}
              numberOfMonths={2}
              onChange={handleReminderDateChange}
              disabled={disabled}
              isDarkMode={isDarkMode}
            />
          </div>
          <div className="flex-2 flex flex-row h-auto w-auto">
            <TimePicker
              value={reminderTime}
              label="Reminder Time"
              size="md"
              // isDarkMode={isDarkMode} 
              onChange={handleReminderTimeChange}
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar size={16} className={isDarkMode ? "text-gray-400" : "text-gray-500"} />
        <div>
          <h3 className={cn("text-sm font-semibold", isDarkMode ? "text-gray-200" : "text-gray-800")}>
            Schedule
          </h3>
          <p className={cn("text-xs", isDarkMode ? "text-gray-500" : "text-gray-400")}>
            Set up dates and reminders. All fields are optional.
          </p>
        </div>
      </div>

      <Tab 
        items={tabItems} 
        defaultValue="dates" 
        isDarkMode={isDarkMode} 
        variant="underline" 
        size="sm"
      />
    </div>
  );
};

ScheduleStep.displayName = 'ScheduleStep';