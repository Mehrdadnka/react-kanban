import { Task } from "@/types/task.types";
import { CheckCircle2, ClipboardList, Zap } from "lucide-react";

const StatusIcon: React.FC<{ status: Task['status']; size?: number }> = ({ status, size = 20 }) => {
  const props = { size };
  switch (status) {
    case 'todo': return <ClipboardList {...props} className="text-blue-500" />;
    case 'in-progress': return <Zap {...props} className="text-yellow-500" />;
    case 'done': return <CheckCircle2 {...props} className="text-green-500" />;
  }
};

export default StatusIcon