// components/board/Tasks.tsx
import { KanbanBoard } from "@/components/board/KanbanBoard";
import { BoardList } from "@/components/board/BoardList";
import { useBoardStore } from "@/stores/board.store";
import { useApp } from "@/providers/AppProvider";
import { cn } from "@/lib/utils";
import { Home, ChevronRight, ArrowLeft } from "lucide-react";

export function Tasks() {
  const { activeBoardId, setActiveBoard, getActiveBoard } = useBoardStore();
  const { isDarkMode } = useApp();
  const activeBoard = getActiveBoard();
  
  const handleBackToBoards = () => {
    setActiveBoard(null);
  };

  // Board List - Full Screen
  if (!activeBoardId || !activeBoard) {
    return (
      <div className="h-full w-full overflow-auto">
        <BoardList />
      </div>
    );
  }

  // Board View - Full Screen with breadcrumb
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Kanban Board - Takes remaining space */}
      <div className="flex-1 overflow-hidden">
        <KanbanBoard boardId={activeBoardId} />
      </div>
    </div>
  );
}