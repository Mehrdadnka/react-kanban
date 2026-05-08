import { TimeObject } from "../types/timePicker.types";

export const parseTimeString = (timeStr: string | TimeObject): TimeObject => {
  if (typeof timeStr === 'object' && 'hour' in timeStr && 'minute' in timeStr) {
    return {
      hour: Math.min(Math.max(timeStr.hour, 0), 23),
      minute: Math.min(Math.max(timeStr.minute, 0), 59),
    };
  }

  if (typeof timeStr === 'string' && timeStr.includes(':')) {
    const [h, m] = timeStr.split(':').map(Number);
    return {
      hour: Math.min(Math.max(h ?? 9, 0), 23),
      minute: Math.min(Math.max(m ?? 0, 0), 59),
    };
  }

  // fallback
  return { hour: 9, minute: 0 };
};

export const timeObjectToFormatted = (timeObj: TimeObject): string => {
  return `${String(timeObj.hour).padStart(2, '0')}:${String(timeObj.minute).padStart(2, '0')}`;
};

export const timeObjectToMinutes = (timeObj: TimeObject): number => {
  return timeObj.hour * 60 + timeObj.minute;
};