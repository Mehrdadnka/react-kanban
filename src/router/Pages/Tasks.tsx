import { KanbanBoard } from "../../components/board/KanbanBoard";

export function Tasks() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          TaskFlow Board
        </h1>
      </div>
      <KanbanBoard />
    </div>
  );
}