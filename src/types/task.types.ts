export interface Task {
  updatedAt: string | number | Date;
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  attachments?: { name: string; url: string }[];
}