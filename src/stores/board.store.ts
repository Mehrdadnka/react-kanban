import React from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { useTaskStore } from './task.store';
import { useEventBus } from './core/event-bus.store';

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
  
  // Stats with caching
  getBoardStats: (boardId: string) => { total: number; todo: number; doing: number; done: number };
  invalidateStatsCache: (boardId?: string) => void;
}

const DEMO_BOARDS: Board[] = [
  {
    id: 'board-1',
    title: 'Product Launch',
    description: 'Q1 product launch planning and execution',
    color: '#6366f1',
    icon: 'Rocket',
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-03-10'),
  },
  {
    id: 'board-2',
    title: 'Engineering',
    description: 'Engineering team tasks and sprints',
    color: '#10b981',
    icon: 'Code2',
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-03-12'),
  },
  {
    id: 'board-3',
    title: 'Design System',
    description: 'UI/UX design system development',
    color: '#f59e0b',
    icon: 'Palette',
    createdAt: new Date('2025-02-01'),
    updatedAt: new Date('2025-03-08'),
  },
];

export const useBoardStore = create<BoardStore>()(
  persist(
    (set, get) => {
      // Initialize stats cache
      let _statsCache: Record<string, { total: number; todo: number; doing: number; done: number }> = {};

      return {
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
            activeBoardId: board.id,
          }));
          
          // 🎯 EMIT EVENT
          useEventBus.getState().emit('board:created', {
            id: board.id,
            title: board.title,
          });
          
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
          
          // 🎯 EMIT EVENT
          useEventBus.getState().emit('board:updated', {
            id,
            changes: updates as Record<string, unknown>,
          });
        },

        deleteBoard: (id) => {
          set((state) => {
            const newBoards = state.boards.filter((b) => b.id !== id);
            return {
              boards: newBoards,
              activeBoardId: state.activeBoardId === id ? newBoards[0]?.id || null : state.activeBoardId,
            };
          });
          
          // 🎯 EMIT EVENT
          useEventBus.getState().emit('board:deleted', { id });
        },

        setActiveBoard: (id) => {
          set({ activeBoardId: id });
          
          // Invalidate stats when switching boards
          if (id) {
            get().invalidateStatsCache(id);
          }
        },

        getActiveBoard: () => {
          const { boards, activeBoardId } = get();
          return boards.find((b) => b.id === activeBoardId);
        },

        getBoardStats: (boardId) => {
          // Return cached if exists
          if (_statsCache[boardId]) {
            return _statsCache[boardId];
          }

          // Calculate fresh stats
          const allTasks = useTaskStore.getState().tasks;
          const boardTasks = allTasks.filter((t: any) => t.boardId === boardId);
          
          const stats = { 
            total: boardTasks.length, 
            todo: 0, 
            doing: 0, 
            done: 0 
          };
          
          boardTasks.forEach((task: any) => {
            const colId = task.columnId?.toLowerCase();
            if (colId === 'todo' || colId === 'backlog') stats.todo++;
            else if (colId === 'in-progress' || colId === 'doing' || colId === 'inprogress') stats.doing++;
            else if (colId === 'done' || colId === 'completed') stats.done++;
          });
          
          // Cache the result
          _statsCache[boardId] = stats;
          
          return stats;
        },

        invalidateStatsCache: (boardId) => {
          if (boardId) {
            delete _statsCache[boardId];
          } else {
            _statsCache = {};
          }
        },
      };
    },
    {
      name: 'taskflow-boards-v2',
      version: 2,
    }
  )
);

// 🎯 Event Listeners Hook - call this in your app root
export const useBoardEventListeners = () => {
  const boardStore = useBoardStore.getState();
  
  // Listen for task changes to invalidate stats cache
  React.useEffect(() => {
    const eventBus = useEventBus.getState();
    
    const listenerIds = [
      eventBus.on('task:created', ({ boardId }) => {
        boardStore.invalidateStatsCache(boardId);
      }, { priority: 10 }),
      
      eventBus.on('task:deleted', ({ boardId }) => {
        boardStore.invalidateStatsCache(boardId);
      }, { priority: 10 }),
      
      eventBus.on('task:completed', ({ boardId }) => {
        boardStore.invalidateStatsCache(boardId);
      }, { priority: 10 }),
      
      eventBus.on('task:moved', ({ boardId }) => {
        boardStore.invalidateStatsCache(boardId);
      }, { priority: 10 }),
      
      eventBus.on('task:bulk-moved', () => {
        boardStore.invalidateStatsCache(); // Invalidate all
      }, { priority: 10 }),
      
      eventBus.on('task:bulk-deleted', () => {
        boardStore.invalidateStatsCache(); // Invalidate all
      }, { priority: 10 }),
    ];
    
    return () => {
      listenerIds.forEach(id => eventBus.off(id));
    };
  }, []);
};