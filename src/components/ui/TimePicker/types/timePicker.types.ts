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

export interface TimePickerProps {
  value?: string; // "HH:mm" format (24h)
  onChange: (event: TimePickerChangeEvent) => void;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
  minuteStep?: number; // For future use
  visualConfig?: {
    colors?: {
      selectedText?: string;
      selectedBackground?: string;
      unselectedText?: string;
    };
  };
}