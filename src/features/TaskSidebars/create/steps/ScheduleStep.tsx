// ScheduleStep.tsx
import React, { useState, useEffect, useCallback } from 'react';
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
      setReminderTime((prev) => (prev === newTime ? prev : newTime));
    }
  }, [reminderDate?.getTime()]);

  const hasDateConflict = range.from && range.to && range.from > range.to;
  const durationDays =
    range.from && range.to && !hasDateConflict ? calculateDuration(range.from, range.to) : null;

  const applyTimeToDate = useCallback((date: Date, timeStr: string): Date => {
    const [h, m] = timeStr.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(h ?? 0, m ?? 0, 0, 0);
    return newDate;
  }, []);

  const handleWorkingHoursConfirm = useCallback(
    (startTime: string, endTime: string) => {
      onWorkingHoursChange?.(startTime, endTime);

      if (range.from) {
        const updatedStart = applyTimeToDate(range.from, startTime);
        onStartDateChange?.(updatedStart);
      }
      if (range.to) {
        const updatedDue = applyTimeToDate(range.to, endTime);
        onDueDateChange?.(updatedDue);
      }
    },
    [range.from, range.to, onWorkingHoursChange, onStartDateChange, onDueDateChange, applyTimeToDate]
  );

  const handleRangeChange = (
    newRange: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!newRange) {
      onStartDateChange?.(undefined);
      onDueDateChange?.(undefined);
      return;
    }

    const ws = workingHoursStart || '09:00';
    const we = workingHoursEnd || '17:00';

    // Apply working hours to new dates
    const fromWithTime = newRange.from ? applyTimeToDate(newRange.from, ws) : undefined;
    const toWithTime = newRange.to ? applyTimeToDate(newRange.to, we) : undefined;

    onStartDateChange?.(fromWithTime);
    onDueDateChange?.(toWithTime);
  };

  // Reminder handlers
  const handleReminderDateChange = (date: Date | undefined) => {
    if (date && reminderTime) {
      const updatedDate = applyTimeToDate(date, reminderTime);
      onReminderDateChange?.(updatedDate);
    } else {
      onReminderDateChange?.(undefined);
    }
  };

  const handleReminderTimeConfirm = (event: { formatted24: string }) => {
    const time = event.formatted24;

    if (time === reminderTime) return;

    setReminderTime(time);

    if (reminderDate) {
      const updatedDate = applyTimeToDate(reminderDate, time);
      onReminderDateChange?.(updatedDate);
    }
  };

  const formatDateDisplay = (date?: Date): string => {
    if (!date) return '';
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const tabItems: TabItem[] = [
    {
      id: 'dates',
      label: 'Date Range',
      icon: <Calendar size={16} />,
      content: (
        <div className="space-y-4">
          <div className="flex flex-row items-start justify-center gap-4">
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
                onChange={handleWorkingHoursConfirm}
                label="Working Hours"
                size="md"
                minDuration={30}
                showDuration={false}
                showPresets={false}
                showConfirmButtons
              />
            </div>
          </div>

          {range.from && range.to && !hasDateConflict && (
            <div className="flex flex-col gap-2">
              <div
                className={cn(
                  'p-3 rounded-lg border text-sm',
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-blue-500" />
                  <span className="font-medium">Start Date</span>
                </div>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {formatDateDisplay(range.from)}
                  {workingHoursStart && ` at ${workingHoursStart}`}
                </span>
              </div>

              <div
                className={cn(
                  'p-3 rounded-lg border text-sm',
                  isDarkMode
                    ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                    : 'bg-gray-50 border-gray-200 text-gray-600'
                )}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Calendar size={14} className="text-orange-500" />
                  <span className="font-medium">Due Date</span>
                </div>
                <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                  {formatDateDisplay(range.to)}
                  {workingHoursEnd && ` at ${workingHoursEnd}`}
                </span>
              </div>
            </div>
          )}

          {/* Duration Calculation */}
          {durationDays !== null && (
            <div
              className={cn(
                'p-4 rounded-xl space-y-1 border',
                isDarkMode ? 'bg-blue-900/20 border-blue-800/50' : 'bg-blue-50/50 border-blue-100'
              )}
            >
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-blue-500" />
                <span
                  className={cn(
                    'text-xs font-medium',
                    isDarkMode ? 'text-blue-300' : 'text-blue-700'
                  )}
                >
                  Duration
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-2xl font-bold',
                    isDarkMode ? 'text-gray-100' : 'text-gray-900'
                  )}
                >
                  {durationDays}
                </span>
                <span
                  className={cn('text-sm', isDarkMode ? 'text-gray-400' : 'text-gray-500')}
                >
                  {durationDays === 1 ? 'day' : 'days'}
                </span>
              </div>
            </div>
          )}

          {/* Date Conflict Warning */}
          {hasDateConflict && (
            <div
              className={cn(
                'flex items-center gap-2 p-3 rounded-lg text-xs',
                isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'
              )}
            >
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
        <div className="space-y-4">
          <div className="flex flex-row items-start justify-center gap-4">
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
                showConfirmButtons
                onConfirm={handleReminderTimeConfirm}
                onChange={(e) => {
                  console.log('draft changed:', e.formatted24);
                }}
              />
            </div>
          </div>

          {/* Reminder Summary */}
          {reminderDate && (
            <div
              className={cn(
                'p-3 rounded-lg border text-sm',
                isDarkMode
                  ? 'bg-gray-800/50 border-gray-700 text-gray-300'
                  : 'bg-gray-50 border-gray-200 text-gray-600'
              )}
            >
              <div className="flex items-center gap-2 mb-1">
                <Bell size={14} className="text-purple-500" />
                <span className="font-medium">Reminder set for</span>
              </div>
              <span className={isDarkMode ? 'text-white' : 'text-gray-900'}>
                {formatDateDisplay(reminderDate)} at{' '}
                {String(reminderDate.getHours()).padStart(2, '0')}:
                {String(reminderDate.getMinutes()).padStart(2, '0')}
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Calendar
          size={16}
          className={isDarkMode ? 'text-gray-400' : 'text-gray-500'}
        />
        <div>
          <h3
            className={cn(
              'text-sm font-semibold',
              isDarkMode ? 'text-gray-200' : 'text-gray-800'
            )}
          >
            Schedule
          </h3>
          <p className={cn('text-xs', isDarkMode ? 'text-gray-500' : 'text-gray-400')}>
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