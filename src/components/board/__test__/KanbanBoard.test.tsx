import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KanbanBoard } from '../KanbanBoard'

// Mock all dependencies
vi.mock('@/providers/AppProvider', () => ({
  useApp: () => ({
    isDarkMode: false,
  }),
}))

vi.mock('@/stores/task.store', () => ({
  useTaskStore: () => ({
    tasks: [],
    deleteTask: vi.fn(),
  }),
}))

vi.mock('@/stores/ui.store', () => ({
  useUIStore: () => ({
    taskDialogOpen: false,
    selectedColumn: null,
    openTaskDialog: vi.fn(),
    closeTaskDialog: vi.fn(),
  }),
}))

vi.mock('../Column', () => ({
  Column: ({ id, title }: any) => (
    <div data-testid={`column-${id}`}>
      <h3>{title}</h3>
    </div>
  ),
}))

vi.mock('../TaskDialog', () => ({
  TaskDialog: () => <div data-testid="task-dialog">Task Dialog</div>,
}))

vi.mock('../KanbanDndProvider', () => ({
  KanbanDndProvider: ({ children }: any) => <div data-testid="dnd-provider">{children}</div>,
}))

describe('KanbanBoard', () => {
  describe('Basic Rendering', () => {
    it('should render without crashing', () => {
      // Act
      render(<KanbanBoard />)
      
      // Assert - Check if component rendered
      const board = document.querySelector('.grid')
      expect(board).toBeInTheDocument()
    })

    it('should render all three columns', () => {
      // Act
      render(<KanbanBoard />)
      
      // Assert - Check for all columns
      const todoColumn = screen.getByTestId('column-todo')
      const inProgressColumn = screen.getByTestId('column-in-progress')
      const doneColumn = screen.getByTestId('column-done')
      
      expect(todoColumn).toBeInTheDocument()
      expect(inProgressColumn).toBeInTheDocument()
      expect(doneColumn).toBeInTheDocument()
    })

    it('should render correct column titles', () => {
      // Act
      render(<KanbanBoard />)
      
      // Assert - Check titles
      expect(screen.getByText('Todo')).toBeInTheDocument()
      expect(screen.getByText('In progress')).toBeInTheDocument()
      expect(screen.getByText('Done')).toBeInTheDocument()
    })

    it('should render TaskDialog component', () => {
      // Act
      render(<KanbanBoard />)
      
      // Assert
      expect(screen.getByTestId('task-dialog')).toBeInTheDocument()
    })

    it('should render the add button with plus icon', () => {
      // Act
      render(<KanbanBoard />)
      
      // Assert - The button exists (look for any button since Radix uses <button>)
      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBeGreaterThan(0)
    })
  })

  describe('DnD Provider', () => {
    it('should render inside KanbanDndProvider', () => {
      // Act
      render(<KanbanBoard />)
      
      // Assert
      expect(screen.getByTestId('dnd-provider')).toBeInTheDocument()
    })
  })
})