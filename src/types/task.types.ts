// src/types/task.types.ts

export type AttachmentType = 'image' | 'video' | 'document' | 'other';

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size?: number;
  thumbnailUrl?: string;
}

export interface TaskLabel {
  id: string;
  name: string;
  color: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  action: 'created' | 'updated' | 'moved' | 'deleted' | 'attachment_added' | 'label_changed' | 
          'due_date_changed' | 'priority_changed' | 'subtask_added' | 'subtask_completed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Task {
  // Core
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  
  // Column (replaces static 'status')
  columnId: string;
  
  // Priority
  priority: TaskPriority;
  
  // Labels
  labels: string[];
  
  // Sub-tasks
  parentId?: string;
  subTasks: string[];
  
  // Dates
  dueDate?: Date;
  startDate?: Date;
  completedAt?: Date;
  
  // Content
  cover?: string;
  attachments: Attachment[];
  
  // Ordering
  order: number;
  
  // Activity
  activityLog: ActivityLog[];
}

// Default task factory
export const createDefaultTask = (columnId: string, order: number): Omit<Task, 'id' | 'createdAt'> => ({
  title: '',
  description: '',
  columnId,
  priority: 'medium',
  labels: [],
  subTasks: [],
  parentId: undefined,
  dueDate: undefined,
  startDate: undefined,
  completedAt: undefined,
  cover: undefined,
  attachments: [],
  order,
  activityLog: [],
  updatedAt: new Date(),
});