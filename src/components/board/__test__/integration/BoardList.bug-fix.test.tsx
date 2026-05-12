// src/components/board/__test__/integration/BoardList.bug-fix.test.tsx
import React, { ReactNode } from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { BoardList } from '@/components/board/BoardList';
import { KanbanBoard } from '@/components/board/KanbanBoard';
import { useBoardStore, useBoardEventListeners } from '@/stores/board.store';
import { useTaskStore } from '@/stores/task.store';
import { useColumnStore } from '@/stores/column.store';
import { AppProvider } from '@/providers/AppProvider';
import { resetAllStores, getBoardStats, expectBoardStats } from '@/test/helpers/store-reset';

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

describe('🐛 BUG FIX: Stats Cache Invalidation', () => {
  beforeEach(() => {
    resetAllStores();
  });

  it('BUG-01: Stats should update after task movement in KanbanBoard', async () => {
    act(() => {
      useBoardStore.getState().setActiveBoard('board-1');
    });

    render(<KanbanBoard boardId="board-1" />, { wrapper: TestWrapper });

    const initial = getBoardStats('board-1');

    act(() => {
      useTaskStore.getState().moveTask('task-b1-3', 'done', 0);
    });

    await waitFor(() => {
      const stats = getBoardStats('board-1');
      expect(stats.done).toBe(initial.done + 1);
      expect(stats.todo).toBe(initial.todo - 1);
    });
  });

  it('BUG-02: Cache should persist when switching between views', async () => {
    // Start in KanbanBoard
    act(() => {
      useBoardStore.getState().setActiveBoard('board-1');
    });

    const { unmount } = render(
      <KanbanBoard boardId="board-1" />,
      { wrapper: TestWrapper }
    );

    // Complete a task
    act(() => {
      useTaskStore.getState().completeTask('task-b1-3');
    });

    await waitFor(() => {
      expectBoardStats('board-1', { total: 3, todo: 0, doing: 1, done: 2 });
    });

    // Switch to BoardList
    unmount();
    act(() => {
      useBoardStore.getState().setActiveBoard(null);
    });

    render(<BoardList />, { wrapper: TestWrapper });

    await waitFor(() => {
      expectBoardStats('board-1', { total: 3, todo: 0, doing: 1, done: 2 });
    });
  });

  it('BUG-03: Multiple rapid changes should not corrupt stats', async () => {
    render(<BoardList />, { wrapper: TestWrapper });

    act(() => {
      const taskStore = useTaskStore.getState();
      taskStore.addTask({ title: 'Task A', columnId: 'todo', priority: 'low', boardId: 'board-1' });
      taskStore.addTask({ title: 'Task B', columnId: 'in-progress', priority: 'high', boardId: 'board-1' });
      taskStore.moveTask('task-b1-3', 'done', 0);
      taskStore.deleteTask('task-b1-1');
    });

    // Wait for all events to process
    await waitFor(() => {
      const stats = getBoardStats('board-1');
      // Started: 3, Added: 2, Deleted: 1 = 4 total
      // task-b1-1 (done) deleted, task-b1-3 moved todo→done
      // Task A added to todo, Task B added to in-progress
      // task-b1-2 still in-progress
      expect(stats.total).toBe(4);
      expect(stats.todo).toBe(1);  // Only Task A
      expect(stats.doing).toBe(2); // task-b1-2 + Task B
      expect(stats.done).toBe(1);  // task-b1-3
    });
  });

  it('BUG-04: Stats should not change when column structure changes', async () => {
    render(<KanbanBoard boardId="board-1" />, { wrapper: TestWrapper });

    const initial = getBoardStats('board-1');

    act(() => {
      useColumnStore.getState().addColumn({
        title: 'Review',
        color: '#8b5cf6',
        icon: 'Eye',
      });
    });

    await waitFor(() => {
      expectBoardStats('board-1', initial);
    });
  });

  it('BUG-05: EventBus listeners cleanup after unmount', async () => {
    // Mount and unmount
    const { unmount: u1 } = render(<KanbanBoard boardId="board-1" />, { wrapper: TestWrapper });
    u1();

    const { unmount: u2 } = render(<KanbanBoard boardId="board-1" />, { wrapper: TestWrapper });
    u2();

    // Final mount - BoardList
    render(<BoardList />, { wrapper: TestWrapper });

    const initial = getBoardStats('board-1');

    act(() => {
      useTaskStore.getState().addTask({
        title: 'After Mount/Unmount',
        columnId: 'todo',
        priority: 'medium',
        boardId: 'board-1',
      });
    });

    await waitFor(() => {
      const stats = getBoardStats('board-1');
      expect(stats.total).toBe(initial.total + 1);
    });
  });
});