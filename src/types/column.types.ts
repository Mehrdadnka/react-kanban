export interface KanbanColumn {
  id: string;
  title: string;
  color: string;
  icon: string;   
  order: number;
  wipLimit?: number;
  isDefault: boolean;
  boardId: string;
}