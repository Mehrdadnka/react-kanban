// components/ui/DatePicker/DatePicker.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  disabled?: boolean;
  includeTime?: boolean;
  className?: string;
  isDarkMode?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  includeTime = false,
  className,
  isDarkMode = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());
  const [hours, setHours] = useState(value?.getHours() || 12);
  const [minutes, setMinutes] = useState(value?.getMinutes() || 0);
  const [showTimePicker, setShowTimePicker] = useState(false);

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
      setHours(value.getHours());
      setMinutes(value.getMinutes());
    }
  }, [value]);

  const getMonthDays = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  const handleDayClick = (day: Date) => {
    if (disabled) return;
    
    const newDate = new Date(day);
    newDate.setHours(hours, minutes);
    setSelectedDate(newDate);
    
    if (includeTime) {
      setShowTimePicker(true);
    } else {
      onChange(newDate);
    }
  };

  const handleTimeConfirm = () => {
    if (selectedDate) {
      const dateWithTime = new Date(selectedDate);
      dateWithTime.setHours(hours, minutes);
      setSelectedDate(dateWithTime);
      onChange(dateWithTime);
    }
    setShowTimePicker(false);
  };

  const goNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goPrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  const days = getMonthDays(currentMonth);
  const startDay = getDay(currentMonth);
  const today = new Date();

  return (
    <div className={cn('flex flex-col', className)}>
      {label && (
        <label className={cn(
          "text-sm mb-2 block font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          {label}
        </label>
      )}

      {/* Selected date display */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 text-sm',
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900',
        !selectedDate && 'text-gray-400'
      )}>
        <Calendar size={16} className={selectedDate ? 'text-blue-500' : 'text-gray-400'} />
        <span className="flex-1 truncate">
          {selectedDate 
            ? format(selectedDate, includeTime ? "MMM dd, yyyy 'at' HH:mm" : 'MMM dd, yyyy')
            : 'Select a date'
          }
        </span>
        {includeTime && <Clock size={16} className="text-gray-400" />}
      </div>

      {/* Calendar */}
      <div className={cn(
        'rounded-xl border p-4',
        'h-[340px]',
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        disabled && 'opacity-50 pointer-events-none'
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <button type="button" onClick={goPrevMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronLeft size={16} />
          </button>
          <span className="text-sm font-medium">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button type="button" onClick={goNextMonth} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day labels */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-0.5">
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(day => {
            const isSelected = selectedDate && isSameDay(day, selectedDate);
            const isToday = isSameDay(day, today);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => handleDayClick(day)}
                disabled={disabled}
                className={cn(
                  'w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isSelected && 'bg-blue-500 text-white font-bold',
                  isToday && !isSelected && 'border border-blue-500 text-blue-500',
                  !isSelected && !isToday && cn(
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  ),
                  disabled && 'opacity-50 cursor-not-allowed'
                )}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>

        {/* Time picker */}
        {includeTime && showTimePicker && selectedDate && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs font-medium">Time:</span>
              <select
                value={hours}
                onChange={(e) => setHours(Number(e.target.value))}
                className={cn(
                  'px-2 py-1 rounded border text-xs',
                  isDarkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
                )}
              >
                {Array.from({ length: 24 }).map((_, h) => (
                  <option key={h} value={h}>{String(h).padStart(2, '0')}:00</option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleTimeConfirm}
                className="ml-auto text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

DatePicker.displayName = 'DatePicker';