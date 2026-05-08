// --- Types ---
export interface TimeObject {
  hour: number; // 0-23
  minute: number; // 0-59
}

export interface TimePickerChangeEvent {
  formatted24: string; // "HH:mm"
  timeObject: TimeObject;
  totalMinutes: number; // 0-1439
}

// --- Scroll Column Component ---
export interface ScrollColumnProps {
  label: string;
  items: number[];
  selectedIndex: number;
  itemHeight: number;
  visibleItems: number;
  labelClass: string;
  colors: {
    selectedText: string;
    selectedBackground: string;
    unselectedText: string;
  };
  disabled: boolean;
  padZero: boolean;
  onChange: (index: number) => void;
  gradientClass: string;
  indicatorClass: string;
}

export interface TimePickerProps {
  value?: string; // "HH:mm" format (24h)
  onChange: (event: TimePickerChangeEvent) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  minuteStep?: number;
  showConfirmButtons?: boolean;
  onConfirm?: (event: TimePickerChangeEvent) => void;
  onCancel?: () => void;
  visualConfig?: {
    colors?: {
      selectedText?: string;
      selectedBackground?: string;
      unselectedText?: string;
    };
  };
}