import { Task } from "@/types/task.types";
import { CheckCircle2, ClipboardList, Zap } from "lucide-react";

const statusLabels: Record<Task['status'], string> = {
  'todo': 'Todo',
  'in-progress': 'In Progress',
  'done': 'Done',
};

const statusOptions = [
  { value: 'todo', label: 'Todo', icon: <ClipboardList size={16} className="text-blue-500" /> },
  { value: 'in-progress', label: 'In Progress', icon: <Zap size={16} className="text-yellow-500" /> },
  { value: 'done', label: 'Done', icon: <CheckCircle2 size={16} className="text-green-500" /> },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export { statusLabels, statusOptions, priorityOptions }