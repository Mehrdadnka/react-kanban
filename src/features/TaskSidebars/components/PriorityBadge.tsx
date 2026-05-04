import { Badge } from "@/components/ui/badge/Badge";
import { PriorityColors } from "@/components/ui/PriorityColors";
import { cn } from "@/lib/utils";
import { Task } from "@/types/task.types";

const PriorityBadge: React.FC<{ priority: Task['priority'] }> = ({ priority }) => (
  <Badge variant="secondary" className={cn("text-xs capitalize", PriorityColors[priority])}>
    {priority}
  </Badge>
);

export default PriorityBadge