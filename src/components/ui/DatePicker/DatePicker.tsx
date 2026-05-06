import React, { useState, useEffect } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarBase } from './CalendarBase';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  isDarkMode?: boolean;
  numberOfMonths?: number;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  numberOfMonths,
  disabled = false,
  className,
  isDarkMode = false,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(value);
  const [currentMonth, setCurrentMonth] = useState(value || new Date());

  useEffect(() => {
    if (value) {
      setSelectedDate(value);
      setCurrentMonth(value);
    }
  }, [value]);

  const handleDayClick = (day: Date) => {
    const newDate = new Date(day);
    setSelectedDate(newDate);
    onChange(newDate);
  };

  const handleClear = () => {
    setSelectedDate(undefined);
    onChange(undefined);
  };

  const handleToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setCurrentMonth(today);
    onChange(today);
  };

  const getDayClassName = (day: Date, isToday: boolean) => {
    const isSelected = selectedDate && isSameDay(day, selectedDate);
    if (isSelected) return 'bg-blue-500 text-white font-bold';
    if (isToday) return 'border border-blue-500 text-blue-500';
    return '';
  };

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
            ? format(selectedDate, 'MMM dd, yyyy')
            : 'Select a date'
          }
        </span>
      </div>

      {/* Calendar */}
      <CalendarBase
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedDays={selectedDate ? [selectedDate] : []}
        onDayClick={handleDayClick}
        getDayClassName={getDayClassName}
        isDarkMode={isDarkMode}
        disabled={disabled}
        numberOfMonths={numberOfMonths}
      />

      {/* Actions */}
      <div className="flex gap-2 mt-3">
        <button
          type="button"
          onClick={handleClear}
          disabled={disabled}
          className={cn(
            'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors flex-1',
            isDarkMode ? 'text-gray-400 hover:bg-gray-800 hover:text-white' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          <RotateCcw size={12} /> Clear
        </button>
        <button
          type="button"
          onClick={handleToday}
          disabled={disabled}
          className={cn(
            'text-xs px-3 py-1.5 rounded-lg transition-colors flex-1 text-right font-medium',
            isDarkMode ? 'text-blue-400 hover:bg-gray-800' : 'text-blue-600 hover:bg-blue-50',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          Today
        </button>
      </div>
    </div>
  );
};

DatePicker.displayName = 'DatePicker';