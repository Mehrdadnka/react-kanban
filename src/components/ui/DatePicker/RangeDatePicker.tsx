import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight, Clock, RotateCcw, Calendar } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay, isWithinInterval, isBefore, isAfter } from 'date-fns';
import { cn } from '@/lib/utils';

interface DateRange {
  from: Date | undefined;
  to: Date | undefined;
}

interface DatePickerProps {
  value?: DateRange;
  onChange: (range: DateRange | undefined) => void;
  label?: string;
  disabled?: boolean;
  includeTime?: boolean;
  numberOfMonths?: number;
  className?: string;
  isDarkMode?: boolean;
}

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const RangeDatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  label,
  disabled = false,
  includeTime = false,
  numberOfMonths = 2,
  className,
  isDarkMode = false,
}) => {
  const [range, setRange] = useState<DateRange>(value || { from: undefined, to: undefined });
  const [currentMonth, setCurrentMonth] = useState(value?.from || new Date());
  const [hours, setHours] = useState(12);
  const [minutes, setMinutes] = useState(0);
  const [showTimePicker, setShowTimePicker] = useState(false);
  
  // درگ state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Date | null>(null);
  const [dragEnd, setDragEnd] = useState<Date | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value) {
      setRange(value);
      if (value.from) {
        setHours(value.from.getHours());
        setMinutes(value.from.getMinutes());
        setCurrentMonth(value.from);
      }
    }
  }, [value]);

  // گرفتن روزهای ماه
  const getMonthDays = (date: Date) => {
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    return eachDayOfInterval({ start, end });
  };

  // شروع درگ
  const handleMouseDown = (day: Date) => {
    if (disabled) return;
    setIsDragging(true);
    setDragStart(day);
    setDragEnd(day);
    setRange({ from: day, to: undefined });
  };

  // حرکت موس در حین درگ
  const handleMouseEnter = (day: Date) => {
    if (!isDragging || !dragStart || disabled) return;
    
    setDragEnd(day);
    const from = isBefore(day, dragStart) ? day : dragStart;
    const to = isAfter(day, dragStart) ? day : dragStart;
    setRange({ from, to });
  };

  // پایان درگ
  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    if (dragStart && dragEnd) {
      const from = isBefore(dragEnd, dragStart) ? dragEnd : dragStart;
      const to = isAfter(dragEnd, dragStart) ? dragEnd : dragStart;
      const finalRange = { from, to };
      setRange(finalRange);
      
      if (!includeTime) {
        onChange(finalRange);
      }
    } else if (dragStart) {
      setRange({ from: dragStart, to: undefined });
    }
    
    setDragStart(null);
    setDragEnd(null);
  };

  // کلیک ساده روی روز
  const handleClick = (day: Date) => {
    if (disabled || isDragging) return;
    
    // اگر شروع انتخاب نشده
    if (!range.from) {
      setRange({ from: day, to: undefined });
      return;
    }
    
    // اگر شروع هست ولی پایان نیست
    if (range.from && !range.to) {
      const from = isBefore(day, range.from) ? day : range.from;
      const to = isAfter(day, range.from) ? day : range.from;
      const finalRange = { from, to };
      setRange(finalRange);
      
      if (includeTime) {
        setShowTimePicker(true);
      } else {
        onChange(finalRange);
      }
      return;
    }
    
    // اگر هر دو انتخاب شده، ریست کن و شروع جدید
    setRange({ from: day, to: undefined });
  };

  // Handle global mouse up
  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, [isDragging, dragStart, dragEnd]);

  const goNextMonth = () => setCurrentMonth(prev => addMonths(prev, 1));
  const goPrevMonth = () => setCurrentMonth(prev => subMonths(prev, 1));

  const handleTimeConfirm = () => {
    if (range.from && range.to) {
      const fromWithTime = new Date(range.from);
      fromWithTime.setHours(hours, minutes);
      
      const toWithTime = new Date(range.to);
      toWithTime.setHours(hours + 2, minutes);

      const newRange = { from: fromWithTime, to: toWithTime };
      setRange(newRange);
      onChange(newRange);
    }
    setShowTimePicker(false);
  };

  const handleClear = () => {
    setRange({ from: undefined, to: undefined });
    onChange(undefined);
    setShowTimePicker(false);
  };

  const handleToday = () => {
    const today = new Date();
    today.setHours(hours, minutes, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const newRange = { from: today, to: tomorrow };
    setRange(newRange);
    onChange(newRange);
  };

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
        <div className="grid grid-cols-7 gap-0.5">
          {DAYS.map(day => (
            <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
              {day}
            </div>
          ))}
          
          {/* Empty cells */}
          {Array.from({ length: startDay }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          
          {/* Day cells */}
          {days.map(day => {
            const isToday = isSameDay(day, today);
            const isRangeStart = range.from && isSameDay(day, range.from);
            const isRangeEnd = range.to && isSameDay(day, range.to);
            const isInRange = range.from && range.to && 
              isAfter(day, range.from) && isBefore(day, range.to);
            const isDisabled = disabled;

            return (
              <button
                key={day.toISOString()}
                type="button"
                onMouseDown={() => handleMouseDown(day)}
                onMouseEnter={() => handleMouseEnter(day)}
                onClick={(e) => {
                  e.preventDefault();
                  if (!isDragging) handleClick(day);
                }}
                disabled={isDisabled}
                className={cn(
                  'w-8 h-8 text-xs rounded-full flex items-center justify-center transition-all select-none',
                  'hover:bg-gray-100 dark:hover:bg-gray-700',
                  isRangeStart && 'bg-blue-500 text-white font-bold rounded-r-none',
                  isRangeEnd && 'bg-blue-500 text-white font-bold rounded-l-none',
                  isInRange && !isRangeStart && !isRangeEnd && 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-none',
                  isRangeStart && isRangeEnd && 'rounded-full',
                  !isRangeStart && !isRangeEnd && !isInRange && cn(
                    isDarkMode ? 'text-gray-300' : 'text-gray-700'
                  ),
                  isToday && !isRangeStart && !isRangeEnd && 'border border-blue-500 text-blue-500',
                  isDisabled && 'opacity-50 cursor-not-allowed'
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

  const formatRangeDisplay = useCallback(() => {
    if (!range.from) return 'Select date range';
    if (!range.to) return `${format(range.from, 'MMM dd, yyyy')} — ...`;
    
    let display = `${format(range.from, 'MMM dd, yyyy')} — ${format(range.to, 'MMM dd, yyyy')}`;
    if (includeTime) display += ` at ${format(range.from, 'HH:mm')}`;
    return display;
  }, [range, includeTime]);

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
        <Clock size={16} className="text-gray-400" />
      </div>

      {/* Calendar container */}
      <div className={cn(
        'rounded-xl border p-4',
        'h-[340px]',
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
        disabled && 'opacity-50 pointer-events-none'
      )}>
        {/* Navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={goPrevMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNextMonth}
            className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Months grid */}
        <div className="flex gap-4">
          {Array.from({ length: numberOfMonths }).map((_, i) => renderMonth(i))}
        </div>

        {/* Time picker */}
        {includeTime && showTimePicker && range.from && range.to && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Clock size={14} className="text-gray-400" />
              <span className="text-xs font-medium">Start time:</span>
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
                Apply
              </button>
            </div>
          </div>
        )}
      </div>

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