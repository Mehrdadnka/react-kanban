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
          'due_date_changed' | 'priority_changed' | 'subtask_added' | 'subtask_completed' |
          'related_task_added' | 'related_task_removed';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TaskType = 'task' | 'milestone' | 'project' | 'epic';

export interface Task {
  // Core
  id: string;
  title: string;
  description?: string;
  type: TaskType;
  createdAt: Date;
  updatedAt: Date;
  
  // Column
  columnId: string;
  
  // Priority
  priority: TaskPriority;
  
  // Labels
  labels: string[];
  
  // Hierarchy
  parentId?: string;
  subTasks: string[];
  
  // Relations
  relatedTasks: string[];
  
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
  type: 'task',
  columnId,
  priority: 'medium',
  labels: [],
  subTasks: [],
  parentId: undefined,
  relatedTasks: [],
  dueDate: undefined,
  startDate: undefined,
  completedAt: undefined,
  cover: undefined,
  attachments: [],
  order,
  activityLog: [],
  updatedAt: new Date(),
});