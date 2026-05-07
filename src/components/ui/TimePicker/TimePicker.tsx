// components/ui/TimePicker/TimePicker.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TimePickerProps {
  value?: string; // "HH:mm" format
  onChange: (time: string) => void;
  label?: string;
  isDarkMode?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: {
    container: 'rounded-xl p-2',
    header: 'text-xs mb-3 gap-1.5',
    icon: 14,
    display: 'text-sm py-1 rounded-lg',
    colon: 'text-sm',
    scroll: 'h-[80px]',
    itemHeight: 'h-[28px]',
    itemFont: 'text-sm',
    itemSelectedFont: 'text-lg',
    ampm: 'px-2 py-0.5 text-[10px]',
    gradient: 'h-[35px]',
    indicator: 'h-[28px]',
    label: 'text-[10px]',
    gap: 4,
  },
  md: {
    container: 'rounded-2xl p-5',
    header: 'text-sm mb-4 gap-2',
    icon: 16,
    display: 'text-3xl px-3 py-1.5 rounded-xl',
    colon: 'text-xl',
    scroll: 'h-[150px]',
    itemHeight: 'h-[32px]',
    itemFont: 'text-base',
    itemSelectedFont: 'text-xl',
    ampm: 'px-2.5 py-1 text-[11px]',
    gradient: 'h-[42px]',
    indicator: 'h-[32px]',
    label: 'text-[11px]',
    gap: 6,
  },
  lg: {
    container: 'rounded-3xl p-6',
    header: 'text-base mb-5 gap-2',
    icon: 18,
    display: 'text-4xl px-4 py-2 rounded-xl',
    colon: 'text-2xl',
    scroll: 'h-[180px]',
    itemHeight: 'h-[36px]',
    itemFont: 'text-lg',
    itemSelectedFont: 'text-2xl',
    ampm: 'px-3 py-1 text-xs',
    gradient: 'h-[50px]',
    indicator: 'h-[36px]',
    label: 'text-xs',
    gap: 8,
  },
};

export const TimePicker: React.FC<TimePickerProps> = ({
  value = '09:00',
  onChange,
  label,
  isDarkMode = false,
  size = 'md',
  className,
}) => {
  const [hour, setHour] = useState(() => parseInt(value.split(':')[0]) || 9);
  const [minute, setMinute] = useState(() => parseInt(value.split(':')[1]) || 0);
  const [isAM, setIsAM] = useState(() => {
    const h = parseInt(value.split(':')[0]) || 9;
    return h < 12;
  });
  
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const isInternalChange = useRef(false); 
  const hours = Array.from({ length: 12 }, (_, i) => i + 1);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const s = sizeConfig[size];

  useEffect(() => {
    if (!isInternalChange.current) return;
    const displayHour = isAM ? (hour === 12 ? 0 : hour) : (hour === 12 ? 12 : hour + 12);
    const formattedHour = String(displayHour).padStart(2, '0');
    const formattedMinute = String(minute).padStart(2, '0');
    onChange(`${formattedHour}:${formattedMinute}`);
    isInternalChange.current = false;
  }, [hour, minute, isAM]);

  // Scroll to center on mount
  useEffect(() => {
    const scrollToCenter = (
      ref: React.RefObject<HTMLDivElement | null>,
      items: number[],
      selected: number,
      itemHeight: number
    ) => {
      if (ref.current) {
        const selectedIndex = items.findIndex(item => item === selected);
        const scrollTo = selectedIndex * itemHeight - itemHeight * 2;
        ref.current.scrollTop = Math.max(0, scrollTo);
      }
    };

    const itemHeight = parseInt(s.itemHeight.replace('h-[', '').replace('px]', ''));
    scrollToCenter(hourRef, hours, hour, itemHeight);
    scrollToCenter(minuteRef, minutes, minute, itemHeight);
  }, []);

  const renderScrollable = (
    ref: React.RefObject<HTMLDivElement | null>,
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
        'px-4'
      )}
      style={{
        scrollSnapType: 'y mandatory',
        WebkitOverflowScrolling: 'touch',
      }}
    >
      {/* Top padding */}
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
              'transition-all duration-200 select-none',
              isSelected
                ? cn(
                    s.itemSelectedFont,
                    'font-bold scale-110',
                    isDarkMode ? 'text-white' : 'text-gray-900'
                  )
                : cn(
                    s.itemFont,
                    isDarkMode ? 'text-gray-600' : 'text-gray-400',
                    'hover:text-gray-600 dark:hover:text-gray-300'
                  )
            )}
          >
            {padZero ? String(item).padStart(2, '0') : item}
          </div>
        );
      })}

      {/* Bottom padding */}
      <div className="h-[72px]" />
    </div>
  );
    
  useEffect(() => {
    const [h, m] = value.split(':').map(Number);
    const newHour = h % 12 || 12;
    const newMinute = m;
    const newIsAM = h < 12;
    
    if (newHour !== hour || newMinute !== minute || newIsAM !== isAM) {
      setHour(newHour);
      setMinute(newMinute);
      setIsAM(newIsAM);
    }
  }, [value]);

  const handleHourChange = (h: number) => {
    isInternalChange.current = true;
    setHour(h);
  };

  const handleMinuteChange = (m: number) => {
    isInternalChange.current = true;
    setMinute(m);
  };

  const handleAMPMChange = (am: boolean) => {
    isInternalChange.current = true;
    setIsAM(am);
  };
  return (
    <div className={cn(
      s.container,
      'w-fit',
      className
    )}>
      {/* Header */}
      {label && (
        <div className={cn('flex items-center py-2 px-1 rounded-lg',
              isDarkMode ? 'bg-gray-800/50' : 'bg-white',
      'backdrop-blur-sm border',
      isDarkMode ? 'border-gray-700' : 'border-gray-200'
        , s.header)}>
          <Clock size={s.icon} className={isDarkMode ? 'text-blue-400' : 'text-blue-500'} />
          <span className={cn(
            'font-medium',
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          )}>
            {label}
          </span>
        </div>
      )}
      <div className={cn('flex flex-col items-center py-2 px-1 rounded-lg',
              isDarkMode ? 'bg-gray-800/50' : 'bg-white',
      'backdrop-blur-sm border',
      isDarkMode ? 'border-gray-700' : 'border-gray-200')}>

        {/* Time Display & AM/PM */}
        <div className={cn('flex items-center justify-center', `gap-${s.gap / 2}`, 'mb-4')}>
            {/* Hour Display */}
            <div className={cn(
            s.display,
            'font-mono font-bold tracking-tight',
            isDarkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-100 text-gray-900',
            'min-w-[60px] text-center'
            )}>
            {String(hour).padStart(2, '0')}
            </div>
            
            <span className={cn(
            s.colon,
            'font-light',
            isDarkMode ? 'text-gray-500' : 'text-gray-300'
            )}>
            :
            </span>
            
            {/* Minute Display */}
            <div className={cn(
            s.display,
            'font-mono font-bold tracking-tight',
            isDarkMode ? 'bg-gray-700/50 text-white' : 'bg-gray-100 text-gray-900',
            'min-w-[60px] text-center'
            )}>
            {String(minute).padStart(2, '0')}
            </div>
            
            {/* AM/PM Toggle */}
            <div className={cn('flex flex-col', `gap-1`, 'ml-3')}>
            <button
                onClick={() => handleAMPMChange(true)}
                className={cn(
                s.ampm,
                'font-medium border rounded-lg transition-all duration-200',
                isAM 
                    ? cn(
                        'border-blue-500 text-white',
                    )
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
                onClick={() => handleAMPMChange(false)}
                className={cn(
                s.ampm,
                'font-medium rounded-lg border transition-all duration-200',
                !isAM 
                    ? cn(
                        'border border-blue-500 text-white',
                    )
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
            {/* Hours */}
            <div className="flex flex-col items-center gap-2">
            <span className={cn(
                s.label,
                'uppercase tracking-wider font-semibold',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
            )}>
                Hour
            </span>
            <div className="relative">
                {/* Gradient overlays */}
                <div className={cn(
                s.gradient,
                'absolute top-0 left-0 right-0 z-10 pointer-events-none',
                'bg-gradient-to-b from-gray-800/50 via-transparent to-transparent',
                isDarkMode ? 'from-gray-800/50' : 'from-white/80'
                )} />
                <div className={cn(
                s.gradient,
                'absolute bottom-0 left-0 right-0 z-10 pointer-events-none',
                'bg-gradient-to-t from-gray-800/50 via-transparent to-transparent',
                isDarkMode ? 'from-gray-800/50' : 'from-white/80'
                )} />
                
                {/* Center line indicator */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
                <div className={cn(
                    s.indicator,
                    'border-t border-b',
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                )} />
                </div>
                {renderScrollable(hourRef, hours, hour, handleHourChange, true)}
            </div>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center gap-2">
            <span className={cn(
                s.label,
                'uppercase tracking-wider font-semibold',
                isDarkMode ? 'text-gray-500' : 'text-gray-400'
            )}>
                Minute
            </span>
            <div className="relative">
                {/* Gradient overlays */}
                <div className={cn(
                s.gradient,
                'absolute top-0 left-0 right-0 z-10 pointer-events-none',
                'bg-gradient-to-b from-gray-800/50 via-transparent to-transparent',
                isDarkMode ? 'from-gray-800/50' : 'from-white/80'
                )} />
                <div className={cn(
                s.gradient,
                'absolute bottom-0 left-0 right-0 z-10 pointer-events-none',
                'bg-gradient-to-t from-gray-800/50 via-transparent to-transparent',
                isDarkMode ? 'from-gray-800/50' : 'from-white/80'
                )} />
                
                {/* Center line indicator */}
                <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none">
                <div className={cn(
                    s.indicator,
                    'border-t border-b',
                    isDarkMode ? 'border-gray-600' : 'border-gray-200'
                )} />
                </div>
                {renderScrollable(minuteRef, minutes, minute, handleMinuteChange, true)}
            </div>
            </div>
        </div>

      </div>
    </div>
  );
};

TimePicker.displayName = 'TimePicker';