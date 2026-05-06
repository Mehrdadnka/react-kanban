// components/ui/TimeRangePicker/TimeRangePicker.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Clock, ArrowRight, Zap, Coffee, Moon, Sunrise, Calendar, Timer, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimeRangePickerProps {
  startTime?: string; // "HH:mm" format
  endTime?: string; // "HH:mm" format
  onChange: (startTime: string, endTime: string) => void;
  label?: string;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  minDuration?: number; // حداقل مدت زمان به دقیقه
  maxDuration?: number; // حداکثر مدت زمان به دقیقه
  showDuration?: boolean;
  showPresets?: boolean;
  className?: string;
  error?: string;
}

const sizeConfig = {
  sm: {
    container: 'rounded-xl p-3',
    header: 'text-xs mb-3 gap-1.5',
    icon: 14,
    display: 'text-sm py-1 rounded-lg min-w-[45px]',
    colon: 'text-sm mx-0.5',
    arrow: 12,
    scroll: 'h-[100px]',
    itemHeight: 'h-[28px]',
    itemFont: 'text-sm',
    itemSelectedFont: 'text-lg',
    ampm: 'px-2 py-0.5 text-[10px]',
    gradient: 'h-[35px]',
    indicator: 'h-[28px]',
    label: 'text-[10px]',
    gap: 3,
    preset: 'text-[10px] px-2 py-1',
    duration: 'text-xs',
  },
  md: {
    container: 'rounded-2xl p-5',
    header: 'text-sm mb-4 gap-2',
    icon: 16,
    display: 'text-2xl px-2 py-1.5 rounded-xl min-w-[55px]',
    colon: 'text-lg mx-1',
    arrow: 16,
    scroll: 'h-[150px]',
    itemHeight: 'h-[32px]',
    itemFont: 'text-base',
    itemSelectedFont: 'text-xl',
    ampm: 'px-2.5 py-1 text-[11px]',
    gradient: 'h-[42px]',
    indicator: 'h-[32px]',
    label: 'text-[11px]',
    gap: 4,
    preset: 'text-[11px] px-2.5 py-1.5',
    duration: 'text-sm',
  },
  lg: {
    container: 'rounded-3xl p-6',
    header: 'text-base mb-5 gap-2',
    icon: 18,
    display: 'text-3xl px-3 py-2 rounded-xl min-w-[70px]',
    colon: 'text-xl mx-1.5',
    arrow: 20,
    scroll: 'h-[180px]',
    itemHeight: 'h-[36px]',
    itemFont: 'text-lg',
    itemSelectedFont: 'text-2xl',
    ampm: 'px-3 py-1 text-xs',
    gradient: 'h-[50px]',
    indicator: 'h-[36px]',
    label: 'text-xs',
    gap: 5,
    preset: 'text-xs px-3 py-1.5',
    duration: 'text-base',
  },
};

const presets = [
  {
    label: 'Morning',
    icon: Coffee,
    start: '09:00',
    end: '12:00',
    color: 'text-amber-500',
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
  },
  {
    label: 'Afternoon',
    icon: Sunrise,
    start: '13:00',
    end: '17:00',
    color: 'text-orange-500',
    bg: 'bg-orange-50 dark:bg-orange-950',
    border: 'border-orange-200 dark:border-orange-800',
  },
  {
    label: 'Evening',
    icon: Moon,
    start: '18:00',
    end: '21:00',
    color: 'text-indigo-500',
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    border: 'border-indigo-200 dark:border-indigo-800',
  },
  {
    label: 'Full Day',
    icon: Zap,
    start: '09:00',
    end: '18:00',
    color: 'text-emerald-500',
    bg: 'bg-emerald-50 dark:bg-emerald-950',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
];

export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime = '09:00',
  endTime = '17:00',
  onChange,
  label,
  isDarkMode = false,
  size = 'md',
  minDuration,
  maxDuration,
  showDuration = true,
  showPresets = true,
  className,
  error,
}) => {
  const parseTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return { hour: h || 9, minute: m || 0, isAM: h < 12 };
  };

  const [startHour, setStartHour] = useState(() => parseTime(startTime).hour % 12 || 12);
  const [startMinute, setStartMinute] = useState(() => parseTime(startTime).minute);
  const [startIsAM, setStartIsAM] = useState(() => parseTime(startTime).isAM);
  
  const [endHour, setEndHour] = useState(() => parseTime(endTime).hour % 12 || 12);
  const [endMinute, setEndMinute] = useState(() => parseTime(endTime).minute);
  const [endIsAM, setEndIsAM] = useState(() => parseTime(endTime).isAM);

  const [validationError, setValidationError] = useState<string | null>(null);

  const startHourRef = useRef<HTMLDivElement>(null);
  const startMinuteRef = useRef<HTMLDivElement>(null);
  const endHourRef = useRef<HTMLDivElement>(null);
  const endMinuteRef = useRef<HTMLDivElement>(null);

  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const s = sizeConfig[size];

  // Convert 12h to 24h
  const to24Hour = (hour: number, isAM: boolean) => {
    if (isAM) return hour === 12 ? 0 : hour;
    return hour === 12 ? 12 : hour + 12;
  };

  // Get current time range
  const getCurrentRange = useCallback(() => {
    const start24 = to24Hour(startHour, startIsAM);
    const end24 = to24Hour(endHour, endIsAM);
    
    return {
      start: `${String(start24).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`,
      end: `${String(end24).padStart(2, '0')}:${String(endMinute).padStart(2, '0')}`,
      startMinutes: start24 * 60 + startMinute,
      endMinutes: end24 * 60 + endMinute,
    };
  }, [startHour, startMinute, startIsAM, endHour, endMinute, endIsAM]);

  // Calculate duration
  const duration = useMemo(() => {
    const range = getCurrentRange();
    let diff = range.endMinutes - range.startMinutes;
    if (diff <= 0) diff += 24 * 60; // If end is next day
    
    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;
    
    return { hours, minutes, totalMinutes: diff };
  }, [getCurrentRange]);

  // Validate
  useEffect(() => {
    const range = getCurrentRange();
    let diff = range.endMinutes - range.startMinutes;
    if (diff <= 0) diff += 24 * 60;

    if (diff <= 0) {
      setValidationError('End time must be after start time');
    } else if (minDuration && diff < minDuration) {
      setValidationError(`Minimum duration is ${minDuration} minutes`);
    } else if (maxDuration && diff > maxDuration) {
      setValidationError(`Maximum duration is ${Math.floor(maxDuration / 60)}h ${maxDuration % 60}m`);
    } else {
      setValidationError(null);
      onChange(range.start, range.end);
    }
  }, [startHour, startMinute, startIsAM, endHour, endMinute, endIsAM, minDuration, maxDuration, onChange, getCurrentRange]);

  // Scroll to center on mount
  useEffect(() => {
    const scrollRef = (ref: React.RefObject<HTMLDivElement>, items: number[], selected: number) => {
      if (ref.current) {
        const itemHeightValue = parseInt(s.itemHeight.replace('h-[', '').replace('px]', ''));
        const index = items.findIndex(item => item === selected);
        const scrollTo = index * itemHeightValue - itemHeightValue * 2;
        ref.current.scrollTop = Math.max(0, scrollTo);
      }
    };

    const itemHeightValue = parseInt(s.itemHeight.replace('h-[', '').replace('px]', ''));
    setTimeout(() => {
      scrollRef(startHourRef, hours, startHour);
      scrollRef(startMinuteRef, minutes, startMinute);
      scrollRef(endHourRef, hours, endHour);
      scrollRef(endMinuteRef, minutes, endMinute);
    }, 50);
  }, []);

  // Apply preset
  const applyPreset = (preset: typeof presets[0]) => {
    const start = parseTime(preset.start);
    const end = parseTime(preset.end);
    
    setStartHour(start.hour % 12 || 12);
    setStartMinute(start.minute);
    setStartIsAM(start.isAM);
    setEndHour(end.hour % 12 || 12);
    setEndMinute(end.minute);
    setEndIsAM(end.isAM);
  };

  const renderScrollable = (
    ref: React.RefObject<HTMLDivElement>,
    items: number[],
    selected: number,
    onSelect: (val: number) => void,
    padZero: boolean = true
  ) => (
    <div
      ref={ref}
      className={cn(
        s.scroll,
        'overflow-y-auto snap-y snap-mandatory scroll-smooth',
        'scrollbar-hide',
        'px-3'
      )}
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      <div className="h-[72px]" />
      {items.map((item) => {
        const isSelected = item === selected;
        return (
          <div
            key={item}
            onClick={() => onSelect(item)}
            className={cn(
              s.itemHeight,
              'flex items-center justify-center cursor-pointer snap-center',
              'transition-all duration-200 select-none rounded-lg',
              isSelected
                ? cn(
                    s.itemSelectedFont,
                    'font-bold scale-110',
                    isDarkMode ? 'text-blue-400 bg-blue-500/10' : 'text-blue-600 bg-blue-50'
                  )
                : cn(
                    s.itemFont,
                    isDarkMode ? 'text-gray-600' : 'text-gray-400',
                    'hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                  )
            )}
          >
            {padZero ? String(item).padStart(2, '0') : item}
          </div>
        );
      })}
      <div className="h-[72px]" />
    </div>
  );

  const renderTimePicker = (
    label: string,
    hourValue: number,
    minuteValue: number,
    isAM: boolean,
    onHourChange: (h: number) => void,
    onMinuteChange: (m: number) => void,
    onAMPMChange: (isAM: boolean) => void,
    hourRef: React.RefObject<HTMLDivElement>,
    minuteRef: React.RefObject<HTMLDivElement>
  ) => (
    <div className="flex flex-col items-center">
      <span className={cn(
        s.label,
        'uppercase tracking-wider font-semibold mb-2',
        isDarkMode ? 'text-gray-400' : 'text-gray-500'
      )}>
        {label}
      </span>
      
      {/* Displays & AM/PM */}
      <div className={cn('flex items-center justify-center mb-3', `gap-${s.gap / 2}`)}>
        <div className={cn(
          s.display,
          'font-mono font-bold tracking-tight text-center',
          isDarkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-100 text-gray-900'
        )}>
          {String(hourValue).padStart(2, '0')}
        </div>
        <span className={cn(s.colon, 'font-light', isDarkMode ? 'text-gray-500' : 'text-gray-300')}>:</span>
        <div className={cn(
          s.display,
          'font-mono font-bold tracking-tight text-center',
          isDarkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-100 text-gray-900'
        )}>
          {String(minuteValue).padStart(2, '0')}
        </div>
        <div className={cn('flex flex-col ml-2', `gap-0.5`)}>
          <button
            onClick={() => onAMPMChange(true)}
            className={cn(
              s.ampm,
              'font-medium border rounded-md transition-all duration-200',
              isAM 
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                : cn(
                    'border-transparent',
                    isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600',
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )
            )}
          >
            AM
          </button>
          <button
            onClick={() => onAMPMChange(false)}
            className={cn(
              s.ampm,
              'font-medium border rounded-md transition-all duration-200',
              !isAM 
                ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-500/25'
                : cn(
                    'border-transparent',
                    isDarkMode ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600',
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )
            )}
          >
            PM
          </button>
        </div>
      </div>

      {/* Scrollable Pickers */}
      <div className={cn('flex justify-center', `gap-${s.gap}`)}>
        <div className="relative">
          <div className={cn(
            s.gradient,
            'absolute top-0 left-0 right-0 z-10 pointer-events-none rounded-t-lg',
            isDarkMode ? 'from-gray-800/50' : 'from-white/80'
          )} />
          <div className={cn(
            s.gradient,
            'absolute bottom-0 left-0 right-0 z-10 pointer-events-none rounded-b-lg',
            isDarkMode ? 'from-gray-800/50' : 'from-white/80'
          )} />
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
            <div className={cn(
              s.indicator,
              'mx-3 border-t border-b rounded-lg',
              isDarkMode ? 'border-gray-600/50 bg-gray-600/10' : 'border-gray-200 bg-gray-50'
            )} />
          </div>
          {renderScrollable(hourRef, hours, hourValue, onHourChange, true)}
        </div>
        <div className="relative">
          <div className={cn(
            s.gradient,
            'absolute top-0 left-0 right-0 z-10 pointer-events-none rounded-t-lg',
            isDarkMode ? 'from-gray-800/50' : 'from-white/80'
          )} />
          <div className={cn(
            s.gradient,
            'absolute bottom-0 left-0 right-0 z-10 pointer-events-none rounded-b-lg',
            isDarkMode ? 'from-gray-800/50' : 'from-white/80'
          )} />
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
            <div className={cn(
              s.indicator,
              'mx-3 border-t border-b rounded-lg',
              isDarkMode ? 'border-gray-600/50 bg-gray-600/10' : 'border-gray-200 bg-gray-50'
            )} />
          </div>
          {renderScrollable(minuteRef, minutes, minuteValue, onMinuteChange, true)}
        </div>
      </div>
    </div>
  );

  return (
    <div className={cn(
      s.container,
      'w-fit',
      isDarkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
      'border shadow-xl',
      isDarkMode ? 'border-gray-700 shadow-gray-900/50' : 'border-gray-200 shadow-gray-200/50',
      className
    )}>
      {/* Header */}
      {label && (
        <div className={cn(
          'flex items-center py-2 px-3 rounded-lg mb-4',
          isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50',
          'backdrop-blur-sm border',
          isDarkMode ? 'border-gray-700' : 'border-gray-200',
          s.header
        )}>
          <Clock size={s.icon} className={cn('mr-2', isDarkMode ? 'text-blue-400' : 'text-blue-500')} />
          <span className={cn('font-semibold', isDarkMode ? 'text-gray-200' : 'text-gray-700')}>
            {label}
          </span>
        </div>
      )}

      <div className="space-y-4">
        {/* Time Pickers Side by Side */}
        <div className={cn(
          'flex items-start justify-center',
          `gap-${Math.max(s.gap + 4, 6)}`
        )}>
          {/* Start Time */}
          <div className="flex-1">
            {renderTimePicker(
              'Start Time',
              startHour, startMinute, startIsAM,
              setStartHour, setStartMinute, setStartIsAM,
              startHourRef, startMinuteRef
            )}
          </div>

          {/* Arrow connector */}
          <div className="flex items-center pt-8">
            <div className={cn(
              'p-1.5 rounded-full',
              isDarkMode ? 'bg-gray-800' : 'bg-gray-100'
            )}>
              <ArrowRight 
                size={s.arrow} 
                className={isDarkMode ? 'text-blue-400' : 'text-blue-500'} 
              />
            </div>
          </div>

          {/* End Time */}
          <div className="flex-1">
            {renderTimePicker(
              'End Time',
              endHour, endMinute, endIsAM,
              setEndHour, setEndMinute, setEndIsAM,
              endHourRef, endMinuteRef
            )}
          </div>
        </div>

        {/* Duration Display */}
        {showDuration && (
          <div className={cn(
            'flex items-center justify-center gap-2 px-4 py-2 rounded-xl',
            'border',
            isDarkMode ? 'bg-gray-800/20 border-gray-700' : 'bg-gray-50 border-gray-200',
            s.duration
          )}>
            <Timer size={14} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'} />
            <span className={cn(
              'font-medium',
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            )}>
              Duration: 
              <span className={cn(
                'ml-1 font-bold',
                isDarkMode ? 'text-white' : 'text-gray-900'
              )}>
                {duration.hours > 0 && `${duration.hours}h `}
                {duration.minutes > 0 && `${duration.minutes}m`}
                {duration.totalMinutes === 0 && '24h'}
              </span>
            </span>
            {validationError && (
              <AlertCircle size={14} className="text-amber-500 ml-1" />
            )}
          </div>
        )}

        {/* Error Message */}
        {(error || validationError) && (
          <div className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-lg',
            'bg-red-50 border border-red-200',
            'dark:bg-red-950/20 dark:border-red-800',
            'text-red-600 dark:text-red-400',
            'text-sm'
          )}>
            <AlertCircle size={14} />
            <span>{error || validationError}</span>
          </div>
        )}

        {/* Presets */}
        {showPresets && (
          <div className="space-y-2">
            <div className={cn(
              'flex items-center gap-1.5',
              s.label,
              'uppercase tracking-wider font-semibold',
              isDarkMode ? 'text-gray-500' : 'text-gray-400'
            )}>
              <Zap size={12} />
              Quick Select
            </div>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => applyPreset(preset)}
                  className={cn(
                    'flex items-center gap-2 rounded-lg border transition-all duration-200',
                    'hover:scale-[1.02] active:scale-95',
                    preset.bg,
                    preset.border,
                    preset.color,
                    s.preset,
                    'font-medium'
                  )}
                >
                  <preset.icon size={12} />
                  <div className="flex flex-col items-start">
                    <span className="font-semibold">{preset.label}</span>
                    <span className="opacity-70 text-[10px]">
                      {preset.start} - {preset.end}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

TimeRangePicker.displayName = 'TimeRangePicker';