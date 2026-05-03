// src/components/board/TaskSidebar/PriorityBadge.tsx

import { Badge } from "@/components/ui/badge/Badge";
import { PriorityColors } from "@/components/ui/PriorityColors";
import { cn } from "@/lib/utils";
import { TaskPriority } from "@/types/task.types";

export const PriorityBadge: React.FC<{ priority: TaskPriority }> = ({ priority }) => (
  <Badge variant="secondary" className={cn("text-xs capitalize", PriorityColors[priority])}>
    {priority}
  </Badge>
);

export default PriorityBadge;