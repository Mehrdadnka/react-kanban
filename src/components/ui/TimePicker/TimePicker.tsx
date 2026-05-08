// components/ui/TimePicker/TimePicker.tsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { sizeConfig } from './config/timePicker.sizeConfig';
import { TimeObject, TimePickerProps } from './types/timePicker.types';
import { parseTimeString, timeObjectToFormatted, timeObjectToMinutes } from './lib/utils';
import { ScrollColumn } from './components/ScrollColumn';

export const TimePicker: React.FC<TimePickerProps> = ({
  value = '09:00',
  onChange,
  label,
  size = 'md',
  className,
  disabled = false,
  visualConfig,
}) => {
  const [timeObject, setTimeObject] = useState<TimeObject>(() => parseTimeString(value));
  
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
    const newTimeObj = parseTimeString(value);
    if (newTimeObj.hour !== timeObject.hour || newTimeObj.minute !== timeObject.minute) {
      setTimeObject(newTimeObj);
    }
  }, [value]);

  // Fire onChange
  const fireChange = useCallback(
    (newTimeObj: TimeObject) => {
      const formatted = timeObjectToFormatted(newTimeObj);
      const totalMinutes = timeObjectToMinutes(newTimeObj);
      onChange({
        formatted24: formatted,
        timeObject: newTimeObj,
        totalMinutes,
      });
    },
    [onChange]
  );

  // Column change handlers
  const handleHourChange = useCallback(
    (index: number) => {
      const newTimeObj = { ...timeObject, hour: hours[index] };
      setTimeObject(newTimeObj);
      fireChange(newTimeObj);
    },
    [timeObject, hours, fireChange]
  );

  const handleMinuteChange = useCallback(
    (index: number) => {
      const newTimeObj = { ...timeObject, minute: minutes[index] };
      setTimeObject(newTimeObj);
      fireChange(newTimeObj);
    },
    [timeObject, minutes, fireChange]
  );

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

  return (
    <div className='flex flex-col'>
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
            {String(timeObject.hour).padStart(2, '0')}
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
            {String(timeObject.minute).padStart(2, '0')}
          </div>
        </div>

        {/* Scrollable Pickers */}
        <div className={cn('flex justify-center', `gap-${s.gap}`)}>
          <ScrollColumn
            label="Hour"
            items={hours}
            selectedIndex={timeObject.hour}
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
            selectedIndex={timeObject.minute}
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
      </div>
    </div>
    </div>
  );
};

TimePicker.displayName = 'TimePicker';