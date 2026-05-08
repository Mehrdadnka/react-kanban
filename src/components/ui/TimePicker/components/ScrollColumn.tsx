import { cn } from "@/lib/utils";
import { useTimePickerScroll } from "../hooks/useTimePickerScroll";
import { ScrollColumnProps } from "../types/timePicker.types";

export const ScrollColumn: React.FC<ScrollColumnProps> = ({
  label,
  items,
  selectedIndex,
  itemHeight,
  visibleItems,
  labelClass,
  colors,
  disabled,
  padZero,
  onChange,
  gradientClass,
  indicatorClass,
}) => {
  const {
    containerRef,
    virtualItems,
    isDragging,
    focusedIndex,
    containerHeight,
    handlers,
  } = useTimePickerScroll({
    items,
    selectedIndex,
    itemHeight,
    visibleItems,
    onChange,
    disabled,
    padZero,
  });

  return (
    <div className="flex flex-col items-center gap-2">
      <span className={labelClass}>{label}</span>
      <div
        ref={containerRef}
        className={cn(
          'relative overflow-hidden select-none rounded-lg',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500',
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        )}
        style={{ height: containerHeight, width: 64 }}
        tabIndex={disabled ? -1 : 0}
        role="listbox"
        aria-label={label}
        onMouseDown={handlers.onMouseDown}
        onWheel={handlers.onWheel}
        onTouchStart={handlers.onTouchStart}
        onKeyDown={handlers.onKeyDown}
      >
        {/* Gradient Overlays */}
        <div
          className={cn(
            gradientClass,
            'absolute top-0 left-0 right-0 z-10 pointer-events-none'
          )}
        />
        <div
          className={cn(
            gradientClass,
            'absolute bottom-0 left-0 right-0 z-10 pointer-events-none rotate-180'
          )}
        />

        {/* Center Indicator */}
        <div
          className={cn(
            indicatorClass,
            'absolute top-1/2 left-0 right-0 -translate-y-1/2 pointer-events-none z-5',
            'mx-2 border-t border-b border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50/30 dark:bg-gray-600/5'
          )}
          style={{ height: itemHeight }}
        />

        {/* Virtual Items Container */}
        <div className="relative w-full h-full overflow-hidden">
          {virtualItems.map(({ index, value, label, offset, isSelected, opacity, scale }) => (
            <div
              key={value}
              role="option"
              aria-selected={isSelected}
              className={cn(
                'absolute left-0 right-0 flex items-center justify-center',
                'transition-opacity duration-150',
                isSelected ? cn('font-bold', colors.selectedText) : cn('font-medium', colors.unselectedText),
                disabled && 'opacity-40 cursor-not-allowed'
              )}
              style={{
                height: itemHeight,
                top: offset,
                opacity: disabled ? 0.4 : opacity,
                transform: `scale(${scale})`,
                fontSize: isSelected ? '1.1em' : '0.95em',
              }}
              onClick={() => !disabled && handlers.onItemClick(index)}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};