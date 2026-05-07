import { ClipboardList, Zap, CheckCircle2 } from "lucide-react";

const iconMap: Record<string, React.FC<{ size?: number; className?: string }>> = {
  'todo': ClipboardList,
  'in-progress': Zap,
  'done': CheckCircle2,
};

const iconColors: Record<string, string> = {
  'todo': "text-blue-500",
  'in-progress': "text-yellow-500",
  'done': "text-green-500",
};

export const StatusIcon: React.FC<{ columnId: string; size?: number }> = ({ columnId, size = 20 }) => {
  const Icon = iconMap[columnId] || ClipboardList;
  return <Icon size={size} className={iconColors[columnId] || "text-gray-500"} />;
};

export default StatusIcon;