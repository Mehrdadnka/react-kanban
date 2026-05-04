// src/features/TaskSidebar/utils.tsx

import React from 'react';
import { ClipboardList, Zap, CheckCircle2, FileText, Calendar, Tag } from 'lucide-react';
import { StepId } from '@/stores/sidebar-engine/task-sidebar.store';

// ──── Constants ────

export const columnLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

export const columnOptions = [
  { 
    value: 'todo', 
    label: 'To Do', 
    icon: <ClipboardList size={16} className="text-blue-500" /> 
  },
  { 
    value: 'in-progress', 
    label: 'In Progress', 
    icon: <Zap size={16} className="text-yellow-500" /> 
  },
  { 
    value: 'done', 
    label: 'Done', 
    icon: <CheckCircle2 size={16} className="text-green-500" /> 
  },
];

export const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const typeOptions = [
  { value: 'task', label: 'Task' },
  { value: 'bug', label: 'Bug' },
  { value: 'milestone', label: 'Milestone' },
  { value: 'epic', label: 'Epic' },
];

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// ──── Step Icons ────

export const STEP_ICONS: Record<StepId, React.ReactNode> = {
  'quick-create': <Zap size={14} />,
  'full-details': <FileText size={14} />,
  'schedule': <Calendar size={14} />,
  'meta': <Tag size={14} />,
};

// ──── Pure Utility Functions ────

export const getColumnLabel = (columnId: string): string => {
  return columnLabels[columnId] || columnId;
};

export const getBreakpoint = (width: number = typeof window !== 'undefined' ? window.innerWidth : 1024) => {
  if (width < BREAKPOINTS.sm) return 'mobile';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
};

/**
 * Creates a new attachment object from a File
 * Pure function - no side effects
 */
export const createAttachmentFromFile = (file: File): Promise<{
  id: string;
  name: string;
  type: 'image' | 'file';
  url: string;
}> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const url = e.target?.result as string;
      resolve({
        id: crypto.randomUUID(),
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Extract files from a drag event
 * Pure function - no side effects
 */
export const getFilesFromDragEvent = (event: React.DragEvent): File[] => {
  return Array.from(event.dataTransfer.files);
};

/**
 * Extract files from an input change event
 * Pure function - no side effects
 */
export const getFilesFromInputEvent = (event: React.ChangeEvent<HTMLInputElement>): File[] => {
  return Array.from(event.target.files || []);
};

/**
 * Calculate duration between two dates in days
 */
export const calculateDuration = (startDate: Date, endDate: Date): number => {
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Truncate text to a maximum length
 */
export const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

/**
 * Format a date to a human-readable string
 */
export const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...options,
  });
};

/**
 * Toggle an item in an array immutably
 */
export const toggleArrayItem = <T extends unknown>(array: T[], item: T): T[] => {
  return array.includes(item) ? array.filter(i => i !== item) : [...array, item];
};