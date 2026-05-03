// src/components/ui/DatePicker/DatePicker.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useApp } from '@/providers/AppProvider';

interface DatePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  label?: string;
  disabled?: boolean;
  includeTime?: boolean;
  className?: string;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

export const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  placeholder = 'Pick a date',
  label,
  disabled = false,
  includeTime = false,
  className,
}) => {
  const { isDarkMode } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(value || new Date());
  const [hours, setHours] = useState(value ? value.getHours() : 12);
  const [minutes, setMinutes] = useState(value ? value.getMinutes() : 0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (value) {
      setViewDate(value);
      setHours(value.getHours());
      setMinutes(value.getMinutes());
    }
  }, [value]);

  const currentMonth = viewDate.getMonth();
  const currentYear = viewDate.getFullYear();

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const formatDisplay = useCallback(() => {
    if (!value) return '';
    const d = value;
    const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (includeTime) {
      const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      return `${dateStr} at ${timeStr}`;
    }
    return dateStr;
  }, [value, includeTime]);

  const handleSelectDay = (day: number) => {
    const newDate = new Date(currentYear, currentMonth, day, hours, minutes);
    onChange(newDate);
    if (!includeTime) {
      setIsOpen(false);
    }
  };

  const handleTimeConfirm = () => {
    if (value) {
      const newDate = new Date(value);
      newDate.setHours(hours, minutes);
      onChange(newDate);
    }
    setIsOpen(false);
  };

  const goNextMonth = () => {
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const goPrevMonth = () => {
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      {label && (
        <label className={cn(
          "text-sm mb-1.5 block",
          isDarkMode ? "text-gray-300" : "text-gray-700"
        )}>
          {label}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm transition-colors text-left',
          isDarkMode
            ? 'bg-gray-800 border-gray-700 text-gray-100 hover:border-gray-600'
            : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          !value && 'text-gray-400'
        )}
      >
        <Calendar size={16} className={value ? 'text-blue-500' : 'text-gray-400'} />
        <span className="flex-1 truncate">
          {formatDisplay() || placeholder}
        </span>
      </button>

      {isOpen && (
        <div className={cn(
          'absolute top-full mt-2 left-0 w-72 rounded-xl shadow-2xl border z-50 p-4',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
        )}>
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={goPrevMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-medium">
              {MONTHS[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={goNextMonth}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day labels */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-[10px] font-medium text-gray-400 py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const date = new Date(currentYear, currentMonth, day);
              const isSelected = value && value.toDateString() === date.toDateString();
              const isToday = new Date().toDateString() === date.toDateString();

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={cn(
                    'w-8 h-8 rounded-full text-xs font-medium transition-colors',
                    isSelected && 'bg-blue-500 text-white',
                    !isSelected && isToday && 'text-blue-500 border border-blue-500',
                    !isSelected && !isToday && 'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isDarkMode ? 'text-gray-200' : 'text-gray-700'
                  )}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Time picker */}
          {includeTime && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <Clock size={14} className="text-gray-400" />
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className={cn(
                    'px-2 py-1 rounded border text-xs',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  )}
                >
                  {Array.from({ length: 24 }).map((_, h) => (
                    <option key={h} value={h}>{String(h).padStart(2, '0')}</option>
                  ))}
                </select>
                <span className="text-sm">:</span>
                <select
                  value={minutes}
                  onChange={(e) => setMinutes(Number(e.target.value))}
                  className={cn(
                    'px-2 py-1 rounded border text-xs',
                    isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
                  )}
                >
                  {[0, 15, 30, 45].map(m => (
                    <option key={m} value={m}>{String(m).padStart(2, '0')}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleTimeConfirm}
                  className="ml-auto text-xs px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Done
                </button>
              </div>
            </div>
          )}

          {/* Clear & Today */}
          <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <button
              type="button"
              onClick={() => { onChange(undefined); setIsOpen(false); }}
              className="text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 flex-1"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => {
                const now = new Date();
                onChange(now);
                setViewDate(now);
                if (!includeTime) setIsOpen(false);
              }}
              className="text-xs text-blue-500 hover:text-blue-600 font-medium flex-1 text-right"
            >
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

DatePicker.displayName = 'DatePicker';