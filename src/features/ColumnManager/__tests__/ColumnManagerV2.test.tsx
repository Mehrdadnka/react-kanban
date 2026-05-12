import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ColumnManagerV2 } from '../ColumnManagerV2';

// Mock stores with vi.mock
vi.mock('@/stores/column.store', () => ({
  useColumnStore: vi.fn(),
}));

vi.mock('@/stores/task.store', () => ({
  useTaskStore: vi.fn(),
}));

vi.mock('@/providers/AppProvider', () => ({
  useApp: vi.fn(),
}));

// Import after mocks
import { useColumnStore } from '@/stores/column.store';
import { useTaskStore } from '@/stores/task.store';
import { useApp } from '@/providers/AppProvider';

// Mock scrollIntoView
Element.prototype.scrollIntoView = vi.fn();

// Type helpers for mocked functions
const mockedUseColumnStore = vi.mocked(useColumnStore);
const mockedUseTaskStore = vi.mocked(useTaskStore);
const mockedUseApp = vi.mocked(useApp);

describe('ColumnManagerV2', () => {
  const mockBoardId = 'test-board-1';
  const mockOnClose = vi.fn();
  
  const mockColumns = [
    { id: 'todo', title: 'To Do', color: '#3B82F6', icon: 'ClipboardList', order: 0, isDefault: true, wipLimit: undefined },
    { id: 'in-progress', title: 'In Progress', color: '#EAB308', icon: 'Zap', order: 1, isDefault: true, wipLimit: undefined },
    { id: 'done', title: 'Done', color: '#22C55E', icon: 'CheckCircle2', order: 2, isDefault: true, wipLimit: undefined },
  ];

  const mockTasks = [
    { id: 'task-1', columnId: 'todo', boardId: 'test-board-1', title: 'Task 1' },
    { id: 'task-2', columnId: 'todo', boardId: 'test-board-1', title: 'Task 2' },
    { id: 'task-3', columnId: 'in-progress', boardId: 'test-board-1', title: 'Task 3' },
    { id: 'task-4', columnId: 'done', boardId: 'test-board-2', title: 'Task 4 (other board)' },
  ];

  const mockAddColumn = vi.fn();
  const mockUpdateColumn = vi.fn();
  const mockDeleteColumn = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default mocks
    mockedUseApp.mockReturnValue({ isDarkMode: false } as any);
    
    mockedUseColumnStore.mockReturnValue({
      columns: mockColumns,
      addColumn: mockAddColumn,
      updateColumn: mockUpdateColumn,
      deleteColumn: mockDeleteColumn,
    } as any);
    
    mockedUseTaskStore.mockReturnValue({
      tasks: mockTasks,
    } as any);
  });

  describe('Rendering', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <ColumnManagerV2 
          isOpen={false} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      expect(container.innerHTML).toBe('');
    });

    it('should render when isOpen is true', () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      expect(screen.getByText(/Columns for Board:/)).toBeInTheDocument();
      expect(screen.getByText('test-board-1')).toBeInTheDocument();
    });

    it('should render all existing columns', () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      expect(screen.getByText('To Do')).toBeInTheDocument();
      expect(screen.getByText('In Progress')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should show correct task counts per column', () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      // todo: 2 tasks, in-progress: 1 task, done: 0 tasks (task-4 is from board-2)
      expect(screen.getByText('2 tasks')).toBeInTheDocument();
      expect(screen.getByText('1 tasks')).toBeInTheDocument();
      expect(screen.getByText('0 tasks')).toBeInTheDocument();
    });

    it('should show empty state when no columns exist', () => {
      mockedUseColumnStore.mockReturnValue({
        columns: [],
        addColumn: mockAddColumn,
        updateColumn: mockUpdateColumn,
        deleteColumn: mockDeleteColumn,
      } as any);

      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      expect(screen.getByText('No columns yet. Create your first one!')).toBeInTheDocument();
    });
  });

  describe('Interactions', () => {
    it('should call onClose when clicking overlay', async () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeTruthy();
      
      if (overlay) {
        await userEvent.click(overlay);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      }
    });

    it('should add new column when clicking Add button', async () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      const input = screen.getByPlaceholderText('Column name...');
      await userEvent.type(input, 'Review');
      
      const addButton = screen.getByText('Add');
      await userEvent.click(addButton);
      
      expect(mockAddColumn).toHaveBeenCalledWith({ 
        title: 'Review', 
        color: '#6B7280' 
      });
    });

    it('should not add column with empty title', async () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      const addButton = screen.getByText('Add');
      await userEvent.click(addButton);
      
      expect(mockAddColumn).not.toHaveBeenCalled();
    });

    it('should add column when pressing Enter', async () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      const input = screen.getByPlaceholderText('Column name...');
      await userEvent.type(input, 'Testing');
      fireEvent.keyDown(input, { key: 'Enter' });
      
      expect(mockAddColumn).toHaveBeenCalledWith({ 
        title: 'Testing', 
        color: '#6B7280' 
      });
    });

    it('should enter edit mode when clicking edit button', async () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      // Find the first edit button (on To Do column)
      const editButtons = screen.getAllByRole('button');
      // Filter buttons that contain Edit3 icon (they don't have text)
      const editButton = editButtons.find(btn => 
        btn.closest('[class*="flex items-center gap-3"]')?.textContent?.includes('To Do')
      );
      
      expect(editButton).toBeTruthy();
      
      if (editButton) {
        await userEvent.click(editButton);
        // Check if edit mode is activated
        expect(screen.getByDisplayValue('To Do')).toBeInTheDocument();
      }
    });

    it('should update column when saving edit', async () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      // Enter edit mode for To Do
      const todoColumn = screen.getByText('To Do').closest('[class*="flex items-center gap-3"]');
      expect(todoColumn).toBeTruthy();
      
      if (todoColumn) {
        const editButton = todoColumn.querySelector('button:not([title])') as HTMLElement;
        await userEvent.click(editButton);
      }
      
      // Change title
      const editInput = screen.getByDisplayValue('To Do');
      await userEvent.clear(editInput);
      await userEvent.type(editInput, 'Backlog');
      
      // Click Save
      const saveButton = screen.getByText('Save');
      await userEvent.click(saveButton);
      
      expect(mockUpdateColumn).toHaveBeenCalledWith('todo', {
        title: 'Backlog',
        wipLimit: undefined,
      });
    });

    it('should not allow deleting default columns', () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      // Default columns should show "default" badge
      const defaultBadges = screen.getAllByText('default');
      expect(defaultBadges).toHaveLength(3);
      
      // Delete button should not exist for default columns
      expect(screen.queryByTitle('Delete column')).not.toBeInTheDocument();
    });

    it('should delete non-default column', async () => {
      const columnsWithCustom = [
        ...mockColumns,
        { id: 'review', title: 'Review', color: '#8B5CF6', icon: 'Circle', order: 3, isDefault: false, wipLimit: undefined },
      ];

      mockedUseColumnStore.mockReturnValue({
        columns: columnsWithCustom,
        addColumn: mockAddColumn,
        updateColumn: mockUpdateColumn,
        deleteColumn: mockDeleteColumn,
      } as any);

      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      const deleteButton = screen.getByTitle('Delete column');
      expect(deleteButton).toBeInTheDocument();
      
      await userEvent.click(deleteButton);
      expect(mockDeleteColumn).toHaveBeenCalledWith('review');
    });
  });

  describe('Board isolation', () => {
    it('should only count tasks from the current board', () => {
      render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId="test-board-1"
        />
      );
      
      // done column should have 0 tasks because the done task belongs to board-2
      const doneColumn = screen.getByText('Done').closest('[class*="flex items-center gap-3"]');
      
      if (doneColumn) {
        expect(within(doneColumn as HTMLElement).getByText('0 tasks')).toBeInTheDocument();
      }
    });
  });

  describe('Dark mode', () => {
    it('should apply dark mode styles when dark mode is enabled', () => {
      mockedUseApp.mockReturnValue({ isDarkMode: true } as any);

      const { container } = render(
        <ColumnManagerV2 
          isOpen={true} 
          onClose={mockOnClose} 
          boardId={mockBoardId} 
        />
      );
      
      const darkElement = container.querySelector('.bg-gray-900');
      expect(darkElement).toBeInTheDocument();
    });
  });
});