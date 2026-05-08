// components/ui/TimePicker/TimeRangePicker.tsx
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { ArrowRight, Timer, AlertCircle, Zap, Coffee, Moon, Sunrise, Check, X } from 'lucide-react';
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
  showConfirmButtons?: boolean;
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
  sm: { container: 'rounded-xl p-3', gap: 3, preset: 'text-[10px] px-2 py-1', duration: 'text-xs', arrow: 12, button: 'text-xs px-2 py-1' },
  md: { container: 'rounded-2xl p-5', gap: 6, preset: 'text-[11px] px-2.5 py-1.5', duration: 'text-sm', arrow: 16, button: 'text-xs px-3 py-1.5' },
  lg: { container: 'rounded-3xl p-6', gap: 8, preset: 'text-xs px-3 py-2', duration: 'text-base', arrow: 20, button: 'text-sm px-4 py-2' },
};

// --- Helpers ---
const timeStrToMinutes = (timeStr: string): number => {
  const [h, m] = timeStr.split(':').map(Number);
  return (h ?? 0) * 60 + (m ?? 0);
};

const minutesToTimeStr = (mins: number): string => {
  const h = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

const calculateDuration = (startMin: number, endMin: number) => {
  let diff = endMin - startMin;
  if (diff <= 0) diff += 24 * 60;
  return {
    hours: Math.floor(diff / 60),
    minutes: diff % 60,
    totalMinutes: diff,
  };
};

const validateRange = (startMin: number, endMin: number, min?: number, max?: number): string | null => {
  let diff = endMin - startMin;
  if (diff <= 0) diff += 24 * 60;

  if (diff <= 0) return 'End time must be after start time';
  if (min && diff < min) return `Minimum duration is ${min} minutes`;
  if (max && diff > max) return `Maximum duration is ${Math.floor(max / 60)}h ${max % 60}m`;
  return null;
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
  showConfirmButtons = false,
  className,
  error,
}) => {
  // Draft state (before confirm)
  const [draftStartMinutes, setDraftStartMinutes] = useState(() => timeStrToMinutes(startTime));
  const [draftEndMinutes, setDraftEndMinutes] = useState(() => timeStrToMinutes(endTime));
  
  // Committed values
  const committedStartRef = useRef(draftStartMinutes);
  const committedEndRef = useRef(draftEndMinutes);
  
  const [validationError, setValidationError] = useState<string | null>(null);
  const rs = rangeSizeConfig[size];

  // Duration calculation
  const duration = useMemo(
    () => calculateDuration(draftStartMinutes, draftEndMinutes),
    [draftStartMinutes, draftEndMinutes]
  );

  // Validation on draft changes
  useEffect(() => {
    const err = validateRange(draftStartMinutes, draftEndMinutes, minDuration, maxDuration);
    setValidationError(err);
  }, [draftStartMinutes, draftEndMinutes, minDuration, maxDuration]);

  // Emit committed values
  const commitChange = useCallback(
    (startMin: number, endMin: number) => {
      committedStartRef.current = startMin;
      committedEndRef.current = endMin;
      onChange(minutesToTimeStr(startMin), minutesToTimeStr(endMin));
    },
    [onChange]
  );

  // Auto-commit when no confirm buttons
  useEffect(() => {
    if (!showConfirmButtons && !validationError) {
      commitChange(draftStartMinutes, draftEndMinutes);
    }
  }, [draftStartMinutes, draftEndMinutes, showConfirmButtons, validationError, commitChange]);

  // TimePicker change handlers (update draft)
  const handleStartChange = useCallback((event: TimePickerChangeEvent) => {
    setDraftStartMinutes(event.totalMinutes);
  }, []);

  const handleEndChange = useCallback((event: TimePickerChangeEvent) => {
    setDraftEndMinutes(event.totalMinutes);
  }, []);

  // Apply preset (updates draft)
  const applyPreset = useCallback((preset: Preset) => {
    setDraftStartMinutes(timeStrToMinutes(preset.start));
    setDraftEndMinutes(timeStrToMinutes(preset.end));
  }, []);

  // Confirm button
  const handleConfirm = useCallback(() => {
    if (!validationError) {
      commitChange(draftStartMinutes, draftEndMinutes);
    }
  }, [validationError, draftStartMinutes, draftEndMinutes, commitChange]);

  // Cancel button
  const handleCancel = useCallback(() => {
    setDraftStartMinutes(timeStrToMinutes(startTime));
    setDraftEndMinutes(timeStrToMinutes(endTime));
  }, [startTime, endTime]);

  // Is dirty?
  const isDirty = useMemo(
    () => draftStartMinutes !== timeStrToMinutes(startTime) || 
           draftEndMinutes !== timeStrToMinutes(endTime),
    [draftStartMinutes, draftEndMinutes, startTime, endTime]
  );

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
          value={minutesToTimeStr(draftStartMinutes)}
          onChange={handleStartChange}
          label="Start Time"
          size={size}
          showConfirmButtons={false} // Range خودش مدیریت می‌کنه
        />

        {/* Arrow Connector */}
        <div className="flex items-center pt-8">
          <div className="p-1.5 rounded-full bg-gray-100 dark:bg-gray-800">
            <ArrowRight size={rs.arrow} className="text-blue-500 dark:text-blue-400" />
          </div>
        </div>

        <TimePicker
          value={minutesToTimeStr(draftEndMinutes)}
          onChange={handleEndChange}
          label="End Time"
          size={size}
          showConfirmButtons={false}
        />
      </div>

      {/* Duration Display */}
      {showDuration && (
        <div
          className={cn(
            'flex items-center justify-center gap-2 mt-4 px-4 py-2 rounded-xl border',
            'bg-gray-50 dark:bg-gray-800/20 border-gray-200 dark:border-gray-700',
            rs.duration
          )}
        >
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

      {/* Validation Error */}
      {validationError && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={14} />
          <span>{validationError}</span>
        </div>
      )}

      {/* External Error */}
      {error && !validationError && (
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle size={14} />
          <span>{error}</span>
        </div>
      )}

      {/* Confirm / Cancel Buttons */}
      {showConfirmButtons && (
        <div className="flex items-center gap-2 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={!isDirty}
            className={cn(
              rs.button,
              'flex-1 flex items-center justify-center gap-1.5 rounded-lg',
              'border border-gray-200 dark:border-gray-600',
              'text-gray-600 dark:text-gray-400',
              'hover:bg-gray-50 dark:hover:bg-gray-800',
              'active:scale-95 transition-all duration-150',
              'font-medium',
              !isDirty && 'opacity-50 cursor-not-allowed'
            )}
          >
            <X size={14} />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!!validationError || !isDirty}
            className={cn(
              rs.button,
              'flex-1 flex items-center justify-center gap-1.5 rounded-lg',
              'bg-blue-500 text-white',
              'hover:bg-blue-600',
              'active:scale-95 transition-all duration-150',
              'font-medium',
              'shadow-lg shadow-blue-500/25',
              (!!validationError || !isDirty) && 'opacity-50 cursor-not-allowed hover:bg-blue-500'
            )}
          >
            <Check size={14} />
            Confirm
          </button>
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
                type="button"
                onClick={() => applyPreset(preset)}
                className={cn(
                  'flex items-center gap-2 rounded-lg border transition-all duration-200 hover:scale-[1.02] active:scale-95',
                  preset.bg,
                  preset.border,
                  preset.color,
                  rs.preset,
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
  );
};

TimeRangePicker.displayName = 'TimeRangePicker';