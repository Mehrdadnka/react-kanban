// src/test/helpers/store-reset.ts
import { useBoardStore, Board } from '@/stores/board.store';
import { useTaskStore } from '@/stores/task.store';
import { useColumnStore} from '@/stores/column.store';
import { useEventBus } from '@/stores/core/event-bus.store';
import { Task, TaskType, TaskPriority } from '@/types/task.types';
import { expect } from 'vitest';
import { KanbanColumn } from '@/types/column.types';
import { waitFor } from '@testing-library/react';

// ═══════════════════════════════════════════
// Deep clone helper
// ═══════════════════════════════════════════
const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

// ═══════════════════════════════════════════
// Demo Data Factory Functions
// ═══════════════════════════════════════════

const createDemoBoards = (): Board[] => [
  {
    id: 'board-1',
    title: 'Product Launch',
    description: 'Q1 product launch planning',
    color: '#6366f1',
    icon: 'Rocket',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-03-10'),
  },
  {
    id: 'board-2',
    title: 'Engineering',
    description: 'Engineering team tasks',
    color: '#10b981',
    icon: 'Code2',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-03-12'),
  },
  {
    id: 'board-3',
    title: 'Design System',
    description: 'UI/UX design system',
    color: '#f59e0b',
    icon: 'Palette',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-03-08'),
  },
];

const createDemoColumns = (): KanbanColumn[] => [
  { id: 'todo', title: 'To Do', color: '#3b82f6', icon: 'Circle', order: 0, isDefault: true, wipLimit: 5 },
  { id: 'in-progress', title: 'In Progress', color: '#f59e0b', icon: 'Clock3', order: 1, isDefault: true, wipLimit: 3 },
  { id: 'done', title: 'Done', color: '#22c55e', icon: 'CheckCircle2', order: 2, isDefault: true },
];

interface DemoTaskInput {
  id: string;
  title: string;
  columnId: string;
  boardId: string;
  priority: TaskPriority;
  order: number;
  status?: 'active' | 'completed';
  shortDescription?: string;
  completedAt?: Date;
  type?: TaskType;
}

const makeDemoTask = (input: DemoTaskInput): Task => ({
  // Required fields
  id: input.id,
  title: input.title,
  columnId: input.columnId,
  boardId: input.boardId,
  priority: input.priority,
  
  // Fields with defaults
  type: input.type || 'task',
  order: input.order,
  status: input.status || 'active',
  shortDescription: input.shortDescription || '',
  description: '',
  
  // Arrays
  labels: [],
  milestoneIds: [],
  projectIds: [],
  subTasks: [],
  relatedTasks: [],
  attachments: [],
  activityLog: [{
    id: `log-${input.id}`,
    taskId: input.id,
    action: 'created' as const,
    timestamp: new Date('2025-03-01'),
  }],
  timeLogs: [],
  
  // Numbers
  timeSpent: 0,
  
  // Dates
  createdAt: new Date('2025-03-01'),
  updatedAt: new Date('2025-03-12'),
  completedAt: input.completedAt || undefined,
  
  // Optionals
  dueDate: undefined,
  startDate: undefined,
  reminderDate: undefined,
  estimatedHours: undefined,
  parentId: undefined,
  assigneeId: undefined,
  workingHoursStart: undefined,
  workingHoursEnd: undefined,
} as Task);

const createDemoTasks = (): Task[] => [
  makeDemoTask({ id: 'task-b1-1', title: 'Setup Project', columnId: 'done', boardId: 'board-1', priority: 'high', order: 0, status: 'completed', shortDescription: 'Initial setup', completedAt: new Date('2025-03-10') }),
  makeDemoTask({ id: 'task-b1-2', title: 'Design Database Schema', columnId: 'in-progress', boardId: 'board-1', priority: 'urgent', order: 1, shortDescription: 'Schema design' }),
  makeDemoTask({ id: 'task-b1-3', title: 'Write API Documentation', columnId: 'todo', boardId: 'board-1', priority: 'medium', order: 2, shortDescription: 'API docs' }),
  makeDemoTask({ id: 'task-b2-1', title: 'Implement Authentication', columnId: 'in-progress', boardId: 'board-2', priority: 'high', order: 0, shortDescription: 'Auth module' }),
  makeDemoTask({ id: 'task-b2-2', title: 'Setup CI/CD Pipeline', columnId: 'todo', boardId: 'board-2', priority: 'medium', order: 1, shortDescription: 'CI/CD' }),
  makeDemoTask({ id: 'task-b3-1', title: 'Create Marketing Plan', columnId: 'todo', boardId: 'board-3', priority: 'low', order: 0, shortDescription: 'Marketing' }),
];

// ═══════════════════════════════════════════
// Reset All Stores
// ═══════════════════════════════════════════
export const resetAllStores = () => {
  // Reset event bus
  useEventBus.setState({
    listeners: new Map(),
    history: [],
  });

  // Reset boards - call factory function to get proper types
  useBoardStore.setState({
    boards: createDemoBoards(),
    activeBoardId: null,
  });

  // Reset columns - call factory function
  useColumnStore.setState({
    columns: createDemoColumns(),
  });

  // Reset tasks - call factory function
  useTaskStore.setState({
    tasks: createDemoTasks(),
  });

  window.localStorage.clear();
};

// ═══════════════════════════════════════════
// Stats Helpers
// ═══════════════════════════════════════════
export const getBoardStats = (boardId: string) => {
  return useBoardStore.getState().getBoardStats(boardId);
};

export const expectBoardStats = (
  boardId: string,
  expected: { total: number; todo: number; doing: number; done: number }
) => {
  const stats = getBoardStats(boardId);
  expect(stats).toEqual(expected);
};

export const waitForStatsUpdate = async (
  boardId: string,
  expected: { total: number; todo: number; doing: number; done: number },
  timeout = 2000
) => {
  await waitFor(() => {
    const stats = getBoardStats(boardId);
    expect(stats).toEqual(expected);
  }, { timeout, interval: 50 });
};