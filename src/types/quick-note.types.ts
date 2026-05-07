// types/quick-note.types.ts
export interface QuickNote {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  taskId?: string; 
  taskTitle?: string; 
  color?: string;
  isPinned?: boolean;
}

export type QuickNoteCreateInput = Omit<QuickNote, 'id' | 'createdAt' | 'updatedAt'>;