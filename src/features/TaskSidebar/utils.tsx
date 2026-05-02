// components/board/TaskSidebar/utils.tsx
import { Task } from "@/types/task.types";
import { ClipboardList, Zap, CheckCircle2 } from "lucide-react";

const statusLabels: Record<Task['status'], string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const statusOptions = [
  { 
    value: 'todo' as const, 
    label: 'To Do', 
    icon: <ClipboardList size={16} className="text-blue-500" /> 
  },
  { 
    value: 'in-progress' as const, 
    label: 'In Progress', 
    icon: <Zap size={16} className="text-yellow-500" /> 
  },
  { 
    value: 'done' as const, 
    label: 'Done', 
    icon: <CheckCircle2 size={16} className="text-green-500" /> 
  },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export { statusLabels, statusOptions, priorityOptions }