// src/features/TaskSidebar/utils.tsx

import { Task } from "@/types/task.types";
import { ClipboardList, Zap, CheckCircle2 } from "lucide-react";

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

export const getColumnLabel = (columnId: string): string => {
  return columnLabels[columnId] || columnId;
};

export const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export const getBreakpoint = (width: number = typeof window !== 'undefined' ? window.innerWidth : 1024) => {
  if (width < BREAKPOINTS.sm) return 'mobile';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
};