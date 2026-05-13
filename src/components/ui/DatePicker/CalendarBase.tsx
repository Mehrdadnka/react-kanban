import React, { useCallback } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

interface CalendarBaseProps {
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  
  selectedDays: Date[];
  highlightedRange?: { from?: Date; to?: Date };
  onDayMouseDown?: (day: Date) => void;
  onDayMouseEnter?: (day: Date) => void;
  onDayClick?: (day: Date) => void;
  
  getDayClassName?: (day: Date, isToday: boolean) => string;
  isDayDisabled?: (day: Date) => boolean;
  
  numberOfMonths?: number;
  isDarkMode?: boolean;
  disabled?: boolean;
  
  calendarHeight?: string;
  showNavigation?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const CalendarBase: React.FC<CalendarBaseProps> = ({
  currentMonth,
  onMonthChange,
  selectedDays = [],
  onDayMouseDown,
  onDayMouseEnter,
  onDayClick,
  getDayClassName,
  isDayDisabled,
  numberOfMonths = 1,
  isDarkMode = false,
  disabled = false,
  calendarHeight = '380px',
  showNavigation = true,
}) => {
  const getMonthDays = useCallback((date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  }, []);

  const renderMonth = (monthOffset: number) => {
    const monthDate = addMonths(currentMonth, monthOffset);
    const days = getMonthDays(monthDate);
    const startDay = getDay(monthDate);
    const today = new Date();

    return (
      <div key={monthOffset} className="flex-1 min-w-0">
        <div className="text-center text-sm font-medium mb-3">
          {format(monthDate, 'MMMM yyyy')}
        </div>
        
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${monthOffset}-${i}`} />
          ))}
          
          {days.map(day => {
            const isToday = isSameDay(day, today);
            const isSelected = selectedDays.some(d => isSameDay(day, d));
            const customClass = getDayClassName?.(day, isToday) || '';
            const dayDisabled = isDayDisabled?.(day) || disabled;

            return (
              <button
                key={`${monthOffset}-${day.toISOString()}`}
                type="button"
                onMouseDown={() => !dayDisabled && onDayMouseDown?.(day)}
                onMouseEnter={() => !dayDisabled && onDayMouseEnter?.(day)}
                onClick={(e) => {
                  e.preventDefault();
                  if (!dayDisabled) onDayClick?.(day);
                }}
                disabled={dayDisabled}
                className={cn(
                  'w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all select-none',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  !customClass && cn(
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  ),
                  dayDisabled && 'opacity-50 cursor-not-allowed',
                  !dayDisabled && !customClass && isToday && 'border border-blue-500 text-blue-500',
                  customClass
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
    className={cn(
        'rounded-xl border p-4',
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        disabled && 'opacity-50 pointer-events-none'
      )}
      style={{
        minHeight: calendarHeight
      }}
    >
      {/* Navigation */}
      {showNavigation && (
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
          </button>
          
          {numberOfMonths === 1 && (
            <span className="text-sm font-medium">
              {format(currentMonth, 'MMMM yyyy')}
            </span>
          )}
          
          <button
            type="button"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Months grid */}
      <div className="flex gap-4">
        {Array.from({ length: numberOfMonths }).map((_, i) => renderMonth(i))}
      </div>
    </div>
  );
};

CalendarBase.displayName = 'CalendarBase';