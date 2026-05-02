import { Task } from "@/types/task.types";
import { ClipboardList, Zap, CheckCircle2 } from "lucide-react";

const iconMap: Record<Task['status'], React.FC<{ size?: number; className?: string }>> = {
  'todo': ClipboardList,
  'in-progress': Zap,
  'done': CheckCircle2,
};

const iconColors: Record<Task['status'], string> = {
  'todo': "text-blue-500",
  'in-progress': "text-yellow-500",
  'done': "text-green-500",
};

const StatusIcon: React.FC<{ status: Task['status']; size?: number }> = ({ status, size = 20 }) => {
  const Icon = iconMap[status];
  return <Icon size={size} className={iconColors[status]} />;
};

export default StatusIcon;