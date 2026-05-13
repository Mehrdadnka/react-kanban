import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, RotateCcw } from 'lucide-react';
import { format, isSameDay, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';
import { CalendarBase } from './CalendarBase';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface RangeDatePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  label?: string;
  disabled?: boolean;
  numberOfMonths?: number;
  className?: string;
  isDarkMode?: boolean;
}

export const RangeDatePicker: React.FC<RangeDatePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  numberOfMonths = 2,
  className,
  isDarkMode = false,
}) => {
  const [range, setRange] = useState<DateRange>(value || { from: undefined, to: undefined });
  const [currentMonth, setCurrentMonth] = useState(value?.from || new Date());
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setRange(value);
      if (value.from) setCurrentMonth(value.from);
    }
  }, [value]);

  const handleDayMouseDown = (day: Date) => {
    if (disabled) return;
    setIsDragging(true);
    setDragStart(day);
    setDragEnd(day);
    setRange({ from: day, to: undefined });
  };

  const handleDayMouseEnter = (day: Date) => {
    if (!isDragging || !dragStart || disabled) return;
    setDragEnd(day);
    const from = isBefore(day, dragStart) ? day : dragStart;
    const to = isAfter(day, dragStart) ? day : dragStart;
    setRange({ from, to });
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragStart && dragEnd) {
      const from = isBefore(dragEnd, dragStart) ? dragEnd : dragStart;
      const to = isAfter(dragEnd, dragStart) ? dragEnd : dragStart;
      const finalRange = { from, to };
      setRange(finalRange);
      onChange(finalRange);
    } else if (dragStart) {
      setRange({ from: dragStart, to: undefined });
    }
    
    setDragStart(null);
    setDragEnd(null);
  };

  // Handle global mouse up
  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  const handleDayClick = (day: Date) => {
    if (disabled || isDragging) return;
    
    if (!range.from) {
      setRange({ from: day, to: undefined });
      return;
    }
    
    if (range.from && !range.to) {
      const from = isBefore(day, range.from) ? day : range.from;
      const to = isAfter(day, range.from) ? day : range.from;
      const finalRange = { from, to };
      setRange(finalRange);
      onChange(finalRange);
      return;
    }
    
    setRange({ from: day, to: undefined });
  };

  const handleClear = () => {
    setRange({ from: undefined, to: undefined });
    onChange(undefined);
  };

  const handleToday = () => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newRange = { from: today, to: tomorrow };
    setRange(newRange);
    onChange(newRange);
  };

  const getDayClassName = (day: Date, isToday: boolean) => {
    const isRangeStart = range.from && isSameDay(day, range.from);
    const isRangeEnd = range.to && isSameDay(day, range.to);
    const isInRange = range.from && range.to && 
      isAfter(day, range.from) && isBefore(day, range.to);
    
    if (isRangeStart && isRangeEnd) return 'bg-blue-500 text-white font-bold rounded-full';
    if (isRangeStart) return 'bg-blue-500 text-white font-bold rounded-r-none';
    if (isRangeEnd) return 'bg-blue-500 text-white font-bold rounded-l-none';
    if (isInRange) return 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-none';
    if (isToday) return 'border border-blue-500 text-blue-500';
    return '';
  };

  const selectedDays = [
    ...(range.from ? [range.from] : []),
    ...(range.to ? [range.to] : [])
  ];

  const formatRangeDisplay = useCallback(() => {
    if (!range.from) return 'Select date range';
    if (!range.to) return `${format(range.from, 'MMM dd, yyyy')} — ...`;
    return `${format(range.from, 'MMM dd, yyyy')} — ${format(range.to, 'MMM dd, yyyy')}`;
  }, [range]);

  return (
    <div ref={containerRef} className={cn('flex flex-col select-none', className)}>
      {label && (
        <label className={cn(
          "text-sm mb-2 block font-medium",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          {label}
        </label>
      )}

      {/* Selected range display */}
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border mb-3 text-sm',
        isDarkMode ? 'bg-gray-800 border-gray-700 text-gray-100' : 'bg-white border-gray-200 text-gray-900'
      )}>
        <Calendar size={16} className={range.from ? 'text-blue-500' : 'text-gray-400'} />
        <span className="flex-1 truncate">{formatRangeDisplay()}</span>
      </div>

      {/* Calendar */}
      <CalendarBase
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
        selectedDays={selectedDays}
        onDayMouseDown={handleDayMouseDown}
        onDayMouseEnter={handleDayMouseEnter}
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

RangeDatePicker.displayName = 'RangeDatePicker';