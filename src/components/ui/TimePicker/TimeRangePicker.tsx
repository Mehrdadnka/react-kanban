import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ArrowRight, Timer, AlertCircle, Zap, Coffee, Moon, Sunrise } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TimePicker } from '@/components/ui/TimePicker/TimePicker';
import { TimePickerChangeEvent } from './types/timePicker.types';

// --- Types ---
interface TimeRangePickerProps {
  startTime?: string; // "HH:mm"
  endTime?: string; // "HH:mm"
  onChange: (startTime: string, endTime: string) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  minDuration?: number; // minutes
  maxDuration?: number; // minutes
  showDuration?: boolean;
  showPresets?: boolean;
  className?: string;
  error?: string;
}

// --- Presets ---
interface Preset {
  label: string;
  icon: React.FC<{ size?: number }>;
  start: string;
  end: string;
  color: string;
  bg: string;
  border: string;
}

const presets: Preset[] = [
  { label: 'Morning', icon: Coffee, start: '09:00', end: '12:00', color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-950', border: 'border-amber-200 dark:border-amber-800' },
  { label: 'Afternoon', icon: Sunrise, start: '13:00', end: '17:00', color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-950', border: 'border-orange-200 dark:border-orange-800' },
  { label: 'Evening', icon: Moon, start: '18:00', end: '21:00', color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-950', border: 'border-indigo-200 dark:border-indigo-800' },
  { label: 'Full Day', icon: Zap, start: '09:00', end: '18:00', color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-950', border: 'border-emerald-200 dark:border-emerald-800' },
];

// --- Sizes for range container ---
const rangeSizeConfig = {
  sm: { container: 'rounded-xl p-3', gap: 3, preset: 'text-[10px] px-2 py-1', duration: 'text-xs', arrow: 12 },
  md: { container: 'rounded-2xl p-5', gap: 6, preset: 'text-[11px] px-2.5 py-1.5', duration: 'text-sm', arrow: 16 },
  lg: { container: 'rounded-3xl p-6', gap: 8, preset: 'text-xs px-3 py-2', duration: 'text-base', arrow: 20 },
};

// --- Component ---
export const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime = '09:00',
  endTime = '17:00',
  onChange,
  label,
  size = 'md',
  minDuration,
  maxDuration,
  showDuration = true,
  showPresets = true,
  className,
  error,
}) => {
  const [startMinutes, setStartMinutes] = useState(() => {
    const [h, m] = startTime.split(':').map(Number);
    return (h ?? 9) * 60 + (m ?? 0);
  });
  const [endMinutes, setEndMinutes] = useState(() => {
    const [h, m] = endTime.split(':').map(Number);
    return (h ?? 17) * 60 + (m ?? 0);
  });

  const [validationError, setValidationError] = useState<string | null>(null);
  const rs = rangeSizeConfig[size];

  // Convert minutes to "HH:mm"
  const minutesToTimeStr = (mins: number): string => {
    const h = Math.floor(mins / 60) % 24;
    const m = mins % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  // Duration calculation
  const duration = useMemo(() => {
    let diff = endMinutes - startMinutes;
    if (diff <= 0) diff += 24 * 60; // next day
    return {
      hours: Math.floor(diff / 60),
      minutes: diff % 60,
      totalMinutes: diff,
    };
  }, [startMinutes, endMinutes]);

  // Validation
  useEffect(() => {
    let diff = endMinutes - startMinutes;
    if (diff <= 0) diff += 24 * 60;

    if (diff <= 0) {
      setValidationError('End time must be after start time');
    } else if (minDuration && diff < minDuration) {
      setValidationError(`Minimum duration is ${minDuration} minutes`);
    } else if (maxDuration && diff > maxDuration) {
      setValidationError(`Maximum duration is ${Math.floor(maxDuration / 60)}h ${maxDuration % 60}m`);
    } else {
      setValidationError(null);
      onChange(minutesToTimeStr(startMinutes), minutesToTimeStr(endMinutes));
    }
  }, [startMinutes, endMinutes, minDuration, maxDuration, onChange]);

  // Handlers
  const handleStartChange = useCallback((event: TimePickerChangeEvent) => {
    setStartMinutes(event.totalMinutes);
  }, []);

  const handleEndChange = useCallback((event: TimePickerChangeEvent) => {
    setEndMinutes(event.totalMinutes);
  }, []);

  // Apply preset
  const applyPreset = (preset: Preset) => {
    const [sh, sm] = preset.start.split(':').map(Number);
    const [eh, em] = preset.end.split(':').map(Number);
    setStartMinutes((sh ?? 9) * 60 + (sm ?? 0));
    setEndMinutes((eh ?? 17) * 60 + (em ?? 0));
  };

  return (
    <div
      className={cn(
        rs.container,
        'w-fit bg-white dark:bg-gray-900 text-gray-900 dark:text-white border shadow-xl',
        'border-gray-200 dark:border-gray-700 shadow-gray-200/50 dark:shadow-gray-900/50',
        className
      )}
    >
      {/* Main Range Picker */}
      <div className="flex items-start justify-center gap-2">
        <TimePicker
          value={minutesToTimeStr(startMinutes)}
          onChange={handleStartChange}
          label="Start Time"
          size={size}
        />

        {/* Arrow Connector */}
        <div className="flex items-center pt-8">
          <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <ArrowRight size={rs.arrow} className="text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <TimePicker
          value={minutesToTimeStr(endMinutes)}
          onChange={handleEndChange}
          label="End Time"
          size={size}
        />
      </div>

      {/* Duration Display */}
      {showDuration && (
        <div className={cn(
          'flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-xl border',
          'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700',
          rs.duration
        )}>
          <Timer size={14} className="text-blue-500 dark:text-blue-400" />
          <span className="font-medium text-gray-600 dark:text-gray-300">
            Duration:{' '}
            <span className="ml-1 font-bold text-gray-900 dark:text-white">
              {duration.hours > 0 && `${duration.hours}h `}
              {duration.minutes > 0 && `${duration.minutes}m`}
              {duration.totalMinutes === 0 && '24h'}
            </span>
          </span>
          {validationError && <AlertCircle size={14} className="text-amber-500 ml-1" />}
        </div>
      )}

      {/* Error Message */}
      {(error || validationError) && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={14} />
          <span>{error || validationError}</span>
        </div>
      )}

      {/* Presets */}
      {showPresets && (
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider font-semibold text-gray-400 dark:text-gray-500">
            <Zap size={12} />
            Quick Select
          </div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((preset) => (
              <button
                key={preset.label}
                onClick={() => applyPreset(preset)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-95',
                  preset.bg, preset.border, preset.color,
                  rs.preset, 'font-medium'
                )}
              >
                <preset.icon size={12} />
                <div className="flex flex-col items-start">
                  <span className="font-semibold">{preset.label}</span>
                  <span className="opacity-70 text-[10px]">{preset.start} - {preset.end}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

TimeRangePicker.displayName = 'TimeRangePicker';