// stores/board.store.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useTaskStore } from './task.store';

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  icon: string;
  createdAt: Date;
  updatedAt: Date;
}

interface BoardStore {
  boards: Board[];
  activeBoardId: string | null;
  
  // Actions
  addBoard: (input: { title: string; description?: string; color?: string; icon?: string }) => Board;
  updateBoard: (id: string, updates: Partial<Board>) => void;
  deleteBoard: (id: string) => void;
  setActiveBoard: (id: string | null) => void;
  getActiveBoard: () => Board | undefined;
  
  // Stats helpers
  getBoardStats: (boardId: string) => { total: number; todo: number; doing: number; done: number };
}

const DEMO_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: 'Product Launch',
    description: 'Q1 product launch planning and execution',
    color: '#6366f1', // Indigo
    icon: 'Rocket',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-03-10'),
  },
  {
    id: 'board-2',
    title: 'Engineering',
    description: 'Engineering team tasks and sprints',
    color: '#10b981', // Emerald
    icon: 'Code2',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-03-12'),
  },
  {
    id: 'board-3',
    title: 'Design System',
    description: 'UI/UX design system development',
    color: '#f59e0b', // Amber
    icon: 'Palette',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-03-08'),
  },
];

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => ({
      boards: DEMO_BOARDS,
      activeBoardId: null,

      addBoard: (input) => {
        const board: Board = {
          id: uuidv4(),
          title: input.title,
          description: input.description || '',
          color: input.color || '#6366f1',
          icon: input.icon || 'Layout',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          boards: [...state.boards, board],
          activeBoardId: board.id, // Auto-select new board
        }));
        
        return board;
      },

      updateBoard: (id, updates) => {
        set((state) => ({
          boards: state.boards.map((board) =>
            board.id === id
              ? { ...board, ...updates, updatedAt: new Date() }
              : board
          ),
        }));
      },

      deleteBoard: (id) => {
        set((state) => {
          const newBoards = state.boards.filter((b) => b.id !== id);
          return {
            boards: newBoards,
            activeBoardId:
              state.activeBoardId === id
                ? newBoards[0]?.id || null
                : state.activeBoardId,
          };
        });
      },

      setActiveBoard: (id) => {
        set({ activeBoardId: id });
      },

      getActiveBoard: () => {
        const { boards, activeBoardId } = get();
        return boards.find((b) => b.id === activeBoardId);
      },

    getBoardStats: (boardId) => {
    const allTasks = useTaskStore.getState().tasks;
    const boardTasks = allTasks.filter((t: any) => t.boardId === boardId);
    
    const stats = { total: boardTasks.length, todo: 0, doing: 0, done: 0 };
    
    boardTasks.forEach((task: any) => {
        const colId = task.columnId?.toLowerCase();
        if (colId === 'todo' || colId === 'backlog') stats.todo++;
        else if (colId === 'doing' || colId === 'in-progress' || colId === 'inprogress') stats.doing++;
        else if (colId === 'done' || colId === 'completed') stats.done++;
    });
    
    return stats;
    },
    }),
    {
      name: 'taskflow-boards',
      version: 1,
    }
  )
);