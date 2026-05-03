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