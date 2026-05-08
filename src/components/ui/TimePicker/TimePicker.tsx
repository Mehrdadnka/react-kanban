// components/ui/TimePicker/TimePicker.tsx
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Clock, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sizeConfig } from './config/timePicker.sizeConfig';
import { TimeObject, TimePickerChangeEvent, TimePickerProps } from './types/timePicker.types';
import { parseTimeString, timeObjectToFormatted, timeObjectToMinutes } from './lib/utils';
import { ScrollColumn } from './components/ScrollColumn';

export const TimePicker: React.FC<TimePickerProps> = ({
  value = '09:00',
  onChange,
  label,
  size = 'md',
  className,
  disabled = false,
  showConfirmButtons = false,
  onConfirm,
  onCancel,
  visualConfig,
}) => {
  // State for current "draft" value (before confirm)
  const [draftTimeObject, setDraftTimeObject] = useState<TimeObject>(() => parseTimeString(value));
  
  // Store the last committed value to compare
  const lastCommittedValue = useRef<string>(value);
  
  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);
  const s = useMemo(() => sizeConfig[size], [size]);

  // Parse itemHeight as number
  const itemHeight = useMemo(() => {
    const match = s.itemHeight.match(/h-\[(\d+)px\]/);
    return match ? parseInt(match[1]) : 32;
  }, [s.itemHeight]);

  const colors = useMemo(
    () => ({
      selectedText: 'text-blue-600 dark:text-blue-400',
      selectedBackground: 'bg-blue-50 dark:bg-blue-500/10',
      unselectedText: 'text-gray-400 dark:text-gray-600',
      ...visualConfig?.colors,
    }),
    [visualConfig]
  );

  // Sync external value
  useEffect(() => {
    if (value !== lastCommittedValue.current) {
      const newTimeObj = parseTimeString(value);
      setDraftTimeObject(newTimeObj);
      lastCommittedValue.current = value;
    }
  }, [value]);

  // Fire onChange
  const fireChange = useCallback(
    (newTimeObj: TimeObject) => {
      const formatted = timeObjectToFormatted(newTimeObj);
      const totalMinutes = timeObjectToMinutes(newTimeObj);
      const event: TimePickerChangeEvent = {
        formatted24: formatted,
        timeObject: newTimeObj,
        totalMinutes,
      };
      
      onChange(event);
      lastCommittedValue.current = formatted;
    },
    [onChange]
  );

  // Column change handlers - فقط draft رو آپدیت می‌کنن
  const handleHourChange = useCallback(
    (index: number) => {
      const newTimeObj = { ...draftTimeObject, hour: hours[index] };
      setDraftTimeObject(newTimeObj);
      
      // اگه confirm buttons نباشه، همون موقع emit کن
      if (!showConfirmButtons) {
        fireChange(newTimeObj);
      }
    },
    [draftTimeObject, hours, fireChange, showConfirmButtons]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      const newTimeObj = { ...draftTimeObject, minute: minutes[index] };
      setDraftTimeObject(newTimeObj);
      
      if (!showConfirmButtons) {
        fireChange(newTimeObj);
      }
    },
    [draftTimeObject, minutes, fireChange, showConfirmButtons]
  );

  // Confirm handler
  const handleConfirm = useCallback(() => {
    fireChange(draftTimeObject);
    onConfirm?.({
      formatted24: timeObjectToFormatted(draftTimeObject),
      timeObject: draftTimeObject,
      totalMinutes: timeObjectToMinutes(draftTimeObject),
    });
  }, [draftTimeObject, fireChange, onConfirm]);

  // Cancel/Reset handler
  const handleCancel = useCallback(() => {
    const originalTimeObj = parseTimeString(value);
    setDraftTimeObject(originalTimeObj);
    onCancel?.();
  }, [value, onCancel]);

  // Is dirty? (آیا تغییراتی داده شده)
  const isDirty = useMemo(() => {
    const originalTime = parseTimeString(value);
    return draftTimeObject.hour !== originalTime.hour || 
           draftTimeObject.minute !== originalTime.minute;
  }, [draftTimeObject, value]);

  // Gradient class
  const gradientClass = useMemo(
    () =>
      cn(
        s.gradient,
        'bg-gradient-to-b',
        'from-white dark:from-gray-900',
        'via-white/80 dark:via-gray-900/80',
        'to-transparent'
      ),
    [s.gradient]
  );

  // Label class
  const labelClass = useMemo(
    () => cn(s.label, 'uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500'),
    [s.label]
  );

  // Button size based on picker size
  const buttonSize = useMemo(() => {
    switch (size) {
      case 'sm': return 'text-xs px-2 py-1';
      case 'lg': return 'text-sm px-4 py-2';
      default: return 'text-xs px-3 py-1.5';
    }
  }, [size]);

  return (
    <div className="flex flex-col">
      {/* Header */}
      {label && (
        <div
          className={cn(
            s.header,
            'flex items-center py-2 px-3 rounded-lg',
            'bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700'
          )}
        >
          <Clock size={s.icon} className="mr-2 text-blue-500 dark:text-blue-400" />
          <span className="font-semibold text-gray-700 dark:text-gray-200">{label}</span>
        </div>
      )}
      
      <div
        className={cn(
          s.container,
          'w-fit bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700',
          'shadow-xl shadow-gray-200/50 dark:shadow-gray-900/50',
          'select-none',
          disabled && 'opacity-60 pointer-events-none',
          className
        )}
      >
        {/* Main Picker */}
        <div className="flex flex-col items-center">
          {/* Time Display */}
          <div className={cn('flex items-center justify-center mb-4', `gap-${s.gap / 2}`)}>
            <div
              className={cn(
                s.display,
                'font-mono font-bold tracking-tight text-center min-w-[64px]',
                'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white',
                'rounded-lg'
              )}
            >
              {String(draftTimeObject.hour).padStart(2, '0')}
            </div>
            <span className={cn(s.colon, 'font-light text-gray-300 dark:text-gray-500')}>:</span>
            <div
              className={cn(
                s.display,
                'font-mono font-bold tracking-tight text-center min-w-[64px]',
                'bg-gray-100 dark:bg-gray-700/50 text-gray-900 dark:text-white',
                'rounded-lg'
              )}
            >
              {String(draftTimeObject.minute).padStart(2, '0')}
            </div>
          </div>

          {/* Scrollable Pickers */}
          <div className={cn('flex justify-center', `gap-${s.gap}`)}>
            <ScrollColumn
              label="Hour"
              items={hours}
              selectedIndex={draftTimeObject.hour}
              itemHeight={itemHeight}
              visibleItems={5}
              labelClass={labelClass}
              colors={colors}
              disabled={disabled}
              padZero={true}
              onChange={handleHourChange}
              gradientClass={gradientClass}
              indicatorClass={s.indicator}
            />
            <ScrollColumn
              label="Minute"
              items={minutes}
              selectedIndex={draftTimeObject.minute}
              itemHeight={itemHeight}
              visibleItems={5}
              labelClass={labelClass}
              colors={colors}
              disabled={disabled}
              padZero={true}
              onChange={handleMinuteChange}
              gradientClass={gradientClass}
              indicatorClass={s.indicator}
            />
          </div>

          {/* Confirm / Cancel Buttons */}
          {showConfirmButtons && (
            <div className="flex items-center gap-2 mt-4 w-full">
              <button
                type="button"
                onClick={handleCancel}
                disabled={disabled}
                className={cn(
                  buttonSize,
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg',
                  'border border-gray-200 dark:border-gray-600',
                  'text-gray-600 dark:text-gray-400',
                  'hover:bg-gray-50 dark:hover:bg-gray-800',
                  'active:scale-95 transition-all duration-150',
                  'font-medium'
                )}
              >
                <X size={14} />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={disabled || !isDirty}
                className={cn(
                  buttonSize,
                  'flex-1 flex items-center justify-center gap-1.5 rounded-lg',
                  'bg-blue-500 text-white',
                  'hover:bg-blue-600',
                  'active:scale-95 transition-all duration-150',
                  'font-medium',
                  'shadow-lg shadow-blue-500/25',
                  (!isDirty || disabled) && 'opacity-50 cursor-not-allowed hover:bg-blue-500'
                )}
              >
                <Check size={14} />
                Confirm
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

TimePicker.displayName = 'TimePicker';