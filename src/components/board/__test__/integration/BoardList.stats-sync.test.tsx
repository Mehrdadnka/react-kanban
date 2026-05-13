import React, { ReactNode } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardList } from '@/components/board/BoardList';
import { useBoardStore, useBoardEventListeners } from '@/stores/board.store';
import { useTaskStore } from '@/stores/task.store';
import { useEventBus } from '@/stores/core/event-bus.store';
import { AppProvider } from '@/providers/AppProvider';
import { useColumnStore } from '@/stores/column.store';

// ═══════════════════════════════════════════════
// HARD RESET
// ═══════════════════════════════════════════════
const HARD_RESET_STATE = {
  boards: [
    { id: 'board-1', title: 'Product Launch', description: 'Q1 product launch planning', color: '#6366f1', icon: 'Rocket', createdAt: new Date('2025-01-15'), updatedAt: new Date('2025-03-10') },
    { id: 'board-2', title: 'Engineering', description: 'Engineering team tasks', color: '#10b981', icon: 'Code2', createdAt: new Date('2025-01-20'), updatedAt: new Date('2025-03-12') },
    { id: 'board-3', title: 'Design System', description: 'UI/UX design system', color: '#f59e0b', icon: 'Palette', createdAt: new Date('2025-02-01'), updatedAt: new Date('2025-03-08') },
  ] as any[],
  
  columns: [
    { id: 'todo', title: 'To Do', color: '#3b82f6', icon: 'Circle', order: 0, wipLimit: 5, isDefault: true },
    { id: 'in-progress', title: 'In Progress', color: '#f59e0b', icon: 'Clock3', order: 1, wipLimit: 3, isDefault: true },
    { id: 'done', title: 'Done', color: '#22c55e', icon: 'CheckCircle2', order: 2 },
  ] as any[],

  tasks: [
    { id: 'task-b1-1', title: 'Setup Project', columnId: 'done', boardId: 'board-1', priority: 'high', type: 'task', order: 0, status: 'completed' as const, labels: [], milestoneIds: [], projectIds: [], subTasks: [], relatedTasks: [], attachments: [], activityLog: [], timeLogs: [], timeSpent: 0, description: '', shortDescription: '', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-12'), completedAt: new Date('2025-03-10'), dueDate: null, startDate: null, reminderDate: null, estimatedHours: null, parentId: null, assigneeId: null, workingHoursStart: null, workingHoursEnd: null },
    { id: 'task-b1-2', title: 'Design Database Schema', columnId: 'in-progress', boardId: 'board-1', priority: 'urgent', type: 'task', order: 1, status: 'active' as const, labels: [], milestoneIds: [], projectIds: [], subTasks: [], relatedTasks: [], attachments: [], activityLog: [], timeLogs: [], timeSpent: 0, description: '', shortDescription: '', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-12'), completedAt: null, dueDate: null, startDate: null, reminderDate: null, estimatedHours: null, parentId: null, assigneeId: null, workingHoursStart: null, workingHoursEnd: null },
    { id: 'task-b1-3', title: 'Write API Documentation', columnId: 'todo', boardId: 'board-1', priority: 'medium', type: 'task', order: 2, status: 'active' as const, labels: [], milestoneIds: [], projectIds: [], subTasks: [], relatedTasks: [], attachments: [], activityLog: [], timeLogs: [], timeSpent: 0, description: '', shortDescription: '', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-12'), completedAt: null, dueDate: null, startDate: null, reminderDate: null, estimatedHours: null, parentId: null, assigneeId: null, workingHoursStart: null, workingHoursEnd: null },
    { id: 'task-b2-1', title: 'Implement Authentication', columnId: 'in-progress', boardId: 'board-2', priority: 'high', type: 'task', order: 0, status: 'active' as const, labels: [], milestoneIds: [], projectIds: [], subTasks: [], relatedTasks: [], attachments: [], activityLog: [], timeLogs: [], timeSpent: 0, description: '', shortDescription: '', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-12'), completedAt: null, dueDate: null, startDate: null, reminderDate: null, estimatedHours: null, parentId: null, assigneeId: null, workingHoursStart: null, workingHoursEnd: null },
    { id: 'task-b2-2', title: 'Setup CI/CD Pipeline', columnId: 'todo', boardId: 'board-2', priority: 'medium', type: 'task', order: 1, status: 'active' as const, labels: [], milestoneIds: [], projectIds: [], subTasks: [], relatedTasks: [], attachments: [], activityLog: [], timeLogs: [], timeSpent: 0, description: '', shortDescription: '', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-12'), completedAt: null, dueDate: null, startDate: null, reminderDate: null, estimatedHours: null, parentId: null, assigneeId: null, workingHoursStart: null, workingHoursEnd: null },
    { id: 'task-b3-1', title: 'Create Marketing Plan', columnId: 'todo', boardId: 'board-3', priority: 'low', type: 'task', order: 0, status: 'active' as const, labels: [], milestoneIds: [], projectIds: [], subTasks: [], relatedTasks: [], attachments: [], activityLog: [], timeLogs: [], timeSpent: 0, description: '', shortDescription: '', createdAt: new Date('2025-03-01'), updatedAt: new Date('2025-03-12'), completedAt: null, dueDate: null, startDate: null, reminderDate: null, estimatedHours: null, parentId: null, assigneeId: null, workingHoursStart: null, workingHoursEnd: null },
  ] as any[],
};

const resetAllStoresHard = () => {
  useEventBus.setState({ listeners: new Map(), history: [] });
  
  useBoardStore.setState({
    boards: JSON.parse(JSON.stringify(HARD_RESET_STATE.boards)),
    activeBoardId: null,
  } as any);
  
  useColumnStore.setState({
    columns: JSON.parse(JSON.stringify(HARD_RESET_STATE.columns)),
  } as any);
  
  useTaskStore.setState({
    tasks: JSON.parse(JSON.stringify(HARD_RESET_STATE.tasks)),
  } as any);
  
  window.localStorage.clear();
};

// ═══════════════════════════════════════════════
// Helper
// ═══════════════════════════════════════════════
const getStats = (boardId: string) => {
  useBoardStore.getState().invalidateStatsCache(boardId);
  return useBoardStore.getState().getBoardStats(boardId);
};

const expectStats = (boardId: string, expected: { total: number; todo: number; doing: number; done: number }) => {
  expect(getStats(boardId)).toEqual(expected);
};

// ═══════════════════════════════════════════════
// Test Wrapper
// ═══════════════════════════════════════════════
const TestWrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
  <AppProvider>
    <EventListenerActivator />
    {children}
  </AppProvider>
);

const EventListenerActivator: React.FC = () => {
  useBoardEventListeners();
  return null;
};

// ═══════════════════════════════════════════════
// Tests
// ═══════════════════════════════════════════════
describe('BoardList Integration: Stats Sync', () => {
  beforeEach(() => {
    resetAllStoresHard();
  });

  describe('Initial State', () => {
    it('should have accurate stats for all demo boards', () => {
      expectStats('board-1', { total: 3, todo: 1, doing: 1, done: 1 });
      expectStats('board-2', { total: 2, todo: 1, doing: 1, done: 0 });
      expectStats('board-3', { total: 1, todo: 1, doing: 0, done: 0 });
    });
  });

  describe('Task Creation', () => {
    it('should increase total and todo when task added to todo column', () => {
      useTaskStore.getState().addTask({ title: 'New Feature Task', columnId: 'todo', priority: 'high', boardId: 'board-1' });
      expectStats('board-1', { total: 4, todo: 2, doing: 1, done: 1 });
    });

    it('should increase total and doing when task added to in-progress', () => {
      useTaskStore.getState().addTask({ title: 'In Progress Task', columnId: 'in-progress', priority: 'medium', boardId: 'board-1' });
      expectStats('board-1', { total: 4, todo: 1, doing: 2, done: 1 });
    });

    it('should not affect other boards', () => {
      const initialBoard2 = getStats('board-2');
      useTaskStore.getState().addTask({ title: 'Board 1 Only', columnId: 'todo', priority: 'low', boardId: 'board-1' });
      expectStats('board-2', initialBoard2);
    });
  });

  describe('Task Movement', () => {
    it('should move todo → in-progress correctly', () => {
      useTaskStore.getState().moveTask('task-b1-3', 'in-progress', 0);
      expectStats('board-1', { total: 3, todo: 0, doing: 2, done: 1 });
    });

    it('should move todo → done correctly', () => {
      useTaskStore.getState().moveTask('task-b1-3', 'done', 0);
      expectStats('board-1', { total: 3, todo: 0, doing: 1, done: 2 });
    });

    it('should handle completeTask correctly', () => {
      useTaskStore.getState().completeTask('task-b1-3');
      expectStats('board-1', { total: 3, todo: 0, doing: 1, done: 2 });
    });

    it('should move done → todo correctly', () => {
      useTaskStore.getState().moveTask('task-b1-1', 'todo', 0);
      expectStats('board-1', { total: 3, todo: 2, doing: 1, done: 0 });
    });
  });

  describe('Task Deletion', () => {
    it('should decrease stats when todo task deleted', () => {
      useTaskStore.getState().deleteTask('task-b1-3');
      expectStats('board-1', { total: 2, todo: 0, doing: 1, done: 1 });
    });

    it('should decrease stats when done task deleted', () => {
      useTaskStore.getState().deleteTask('task-b1-1');
      expectStats('board-1', { total: 2, todo: 1, doing: 1, done: 0 });
    });

    it('should decrease stats when in-progress task deleted', () => {
      useTaskStore.getState().deleteTask('task-b1-2');
      expectStats('board-1', { total: 2, todo: 1, doing: 0, done: 1 });
    });
  });

  describe('UI Render', () => {
    it('should render BoardList without crash', async () => {
      const { container } = render(<BoardList />, { wrapper: TestWrapper });
      await waitFor(() => expect(container).toBeTruthy());
    });
  });
});