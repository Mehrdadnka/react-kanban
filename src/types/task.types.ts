// ──── Enums & Constants ────

export type AttachmentType = 'image' | 'video' | 'document' | 'file' | 'code' | 'other';

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';

export type TaskType = 'task' | 'milestone' | 'project' | 'epic' | 'bug' | 'feature';

export type TaskStatus = 'active' | 'completed' | 'archived' | 'on-hold';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

// ──── Priority Order (for sorting/comparison) ────

export const PRIORITY_ORDER: Record<TaskPriority, number> = {
  urgent: 4,
  high: 3,
  medium: 2,
  low: 1,
};

// ──── Interfaces ────

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: AttachmentType;
  size?: number;
  thumbnailUrl?: string;
  uploadedAt?: Date;
  uploadedBy?: string;
}

export interface ActivityLog {
  id: string;
  taskId: string;
  userId?: string;
  action: 
    | 'created' 
    | 'updated' 
    | 'moved' 
    | 'deleted' 
    | 'attachment_added' 
    | 'attachment_removed'
    | 'label_changed' 
    | 'milestone_changed'
    | 'project_changed'
    | 'due_date_changed' 
    | 'start_date_changed'
    | 'priority_changed' 
    | 'subtask_added' 
    | 'subtask_completed'
    | 'subtask_removed'
    | 'related_task_added' 
    | 'related_task_removed'
    | 'time_logged'
    | 'description_updated'
    | 'assigned';
  field?: string;
  oldValue?: string;
  newValue?: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface TimeLog {
  id: string;
  taskId: string;
  userId?: string;
  description?: string;
  hours: number;
  date: Date;
  createdAt: Date;
}

export interface Comment {
  id: string;
  taskId: string;
  userId?: string;
  content: string;
  createdAt: Date;
  updatedAt?: Date;
  attachments?: Attachment[];
  parentId?: string; // For threaded comments
  reactions?: Record<string, string[]>; // emoji -> userId[]
}

export interface RecurringConfig {
  frequency: RecurringFrequency;
  interval: number; // every X days/weeks/months
  endDate?: Date;
  endAfterOccurrences?: number;
  daysOfWeek?: number[]; // for weekly: [1,3,5] = Mon,Wed,Fri
  dayOfMonth?: number; // for monthly
}

export interface TaskDependency {
  taskId: string;
  type: 'blocks' | 'blocked_by' | 'related_to' | 'duplicates' | 'is_duplicated_by';
}

// ──── Main Task Interface ────

export interface Task {
  // ──── Core Identity ────
  id: string;
  title: string;
  shortDescription: string;
  description?: string;
  
  // ──── Classification ────
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  columnId: string;
  
  // ──── Entity References ────
  labels: string[];           // Label IDs
  milestoneIds: string[];     // Milestone IDs (NEW)
  projectIds: string[];       // Project IDs (NEW)
  assigneeId?: string;        // User ID (for future)
  
  // ──── Dates ────
  startDate?: Date;
  dueDate?: Date;
  reminderDate?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  workingHoursStart?: string;  // "HH:mm"
  workingHoursEnd?: string;    // "HH:mm"
  
  // ──── Time Tracking ────
  estimatedHours?: number;
  timeSpent?: number;         // Total hours logged
  timeLogs?: TimeLog[];
  
  // ──── Hierarchy & Relations ────
  parentId?: string;
  subTasks: string[];         // Task IDs
  relatedTasks: string[];     // Task IDs
  dependencies?: TaskDependency[];
  
  // ──── Content ────
  cover?: string;             // Cover image URL
  attachments: Attachment[];
  comments?: Comment[];
  
  // ──── Recurring Tasks ────
  isRecurring?: boolean;
  recurringConfig?: RecurringConfig;
  
  // ──── Metadata ────
  tags?: string[];            // Free-form tags
  customFields?: Record<string, any>; // For extensibility
  
  // ──── Ordering & Display ────
  order: number;
  color?: string;             // Custom color override
  
  // ──── Activity & Audit ────
  activityLog: ActivityLog[];
  createdBy?: string;
  updatedBy?: string;
  
  // ──── Git/Development Integration (optional future use) ────
  branchName?: string;
  commitSha?: string;
  pullRequestUrl?: string;

  boardId: string;
}

// ──── Factory Functions ────

export const createDefaultTask = (
  columnId: string, 
  order: number,
  boardId: string = 'board-1',
  overrides?: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>
): Omit<Task, 'id' | 'createdAt' | 'updatedAt'> => {
  const now = new Date();
  
  return {
    // Core
    title: '',
    shortDescription: '',
    description: '',
    boardId,    
    // Classification
    type: 'task',
    priority: 'medium',
    status: 'active',
    columnId,
    
    // Entity References
    labels: [],
    milestoneIds: [],
    projectIds: [],
    
    // Dates
    startDate: undefined,
    dueDate: undefined,
    workingHoursStart: undefined,
    workingHoursEnd: undefined,
    reminderDate: undefined,
    completedAt: undefined,
    
    // Time Tracking
    estimatedHours: undefined,
    timeSpent: 0,
    timeLogs: [],
    
    // Hierarchy
    parentId: undefined,
    subTasks: [],
    relatedTasks: [],
    dependencies: [],
    
    // Content
    cover: undefined,
    attachments: [],
    comments: [],
    
    // Recurring
    isRecurring: false,
    
    // Metadata
    tags: [],
    customFields: {},
    
    // Ordering
    order,
    
    // Activity
    activityLog: [{
      id: crypto.randomUUID(),
      taskId: '', // Will be set after creation
      action: 'created',
      timestamp: now,
    }],
    
    // Apply overrides
    ...overrides,
  };
};

// ──── Type Guards ────

export const isMilestone = (task: Task): boolean => task.type === 'milestone';
export const isProject = (task: Task): boolean => task.type === 'project';
export const isEpic = (task: Task): boolean => task.type === 'epic';
export const isOverdue = (task: Task): boolean => {
  if (!task.dueDate || task.status === 'completed') return false;
  return new Date() > new Date(task.dueDate);
};
export const isRecurring = (task: Task): boolean => 
  task.isRecurring === true && !!task.recurringConfig;

// ──── Utility Types ────

export type TaskUpdateData = Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'activityLog'>>;

export type TaskCreateData = Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'activityLog' | 'order' | 'subTasks' | 'comments'> & {
  order?: number;
};

// ──── Filter & Sort Types ────

export interface TaskFilters {
  search?: string;
  priorities?: TaskPriority[];
  types?: TaskType[];
  statuses?: TaskStatus[];
  labels?: string[];
  milestones?: string[];
  projects?: string[];
  assigneeId?: string;
  isOverdue?: boolean;
  isRecurring?: boolean;
  dateRange?: {
    start?: Date;
    end?: Date;
    field: 'dueDate' | 'startDate' | 'createdAt' | 'completedAt';
  };
  hasAttachments?: boolean;
  hasSubtasks?: boolean;
}

export type TaskSortField = 
  | 'title' 
  | 'priority' 
  | 'createdAt' 
  | 'updatedAt' 
  | 'dueDate' 
  | 'startDate' 
  | 'order'
  | 'estimatedHours';

export interface TaskSortConfig {
  field: TaskSortField;
  direction: 'asc' | 'desc';
}

// ──── Board/Column Types ────

export interface ColumnConfig {
  id: string;
  title: string;
  color: string;
  icon: string;
  order: number;
  wipLimit?: number;
  taskLimit?: number;
  allowTypes?: TaskType[];
}

// ──── Statistics Types ────

export interface TaskStatistics {
  total: number;
  byStatus: Record<TaskStatus, number>;
  byPriority: Record<TaskPriority, number>;
  byType: Record<TaskType, number>;
  overdue: number;
  completedThisWeek: number;
  averageCompletionTime?: number; // in hours
}