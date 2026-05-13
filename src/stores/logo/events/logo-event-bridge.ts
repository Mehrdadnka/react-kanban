// features/logo-3d/events/logo-event-bridge.ts
import { useEffect } from 'react'
import { useEventBus } from '@/stores/core/event-bus.store'
import { useLogoStore } from '../logo-store'
import { COLUMN_TO_VERTEX, SPARK_ORIGIN, DIAMOND_VERTEX, COLUMN_COLORS } from 
'@/features/logo-3d/data/node-columns'
import { createPolyhedron } from '@/features/logo-3d/data/polyhedron-factory'
import { useBoardStore } from '@/stores/board.store'
import { useTaskStore } from '@/stores/task.store'


const getColumnsForBoard = (boardId: string): string[] => {
  const tasks = useTaskStore.getState().tasks
  const columns = new Set<string>()
  tasks
    .filter(t => t.boardId === boardId)
    .forEach(t => columns.add(t.columnId))
  
  const defaults = ['todo', 'in-progress', 'done']
  defaults.forEach(c => columns.add(c))
  
  return Array.from(columns)
}
export const useLogoEventBridge = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState()
    const logoStore = useLogoStore.getState()

    const handlers = [
      // ===== Task Created =====
      eventBus.on('task:created', ({ id, boardId, columnId }) => {
        const boardStore = useBoardStore.getState()
        const board = boardStore.boards.find(b => b.id === boardId)
  
        const columns = getColumnsForBoard(boardId)
        const polyhedron = createPolyhedron(columns)
        const toVertex = polyhedron.columnToVertex[columnId] ?? polyhedron.activeVertices[0]

        logoStore.addSpark({
          boardId,
          taskId: id,
          from: SPARK_ORIGIN,    
          to: toVertex,         
          speed: 0.004 + Math.random() * 0.003,
          color: COLUMN_COLORS[columnId] || '#3B82F6',
          type: 'task:created',
        })
      }, { priority: 50 }),

      // ===== Task Moved =====
      eventBus.on('task:moved', ({ id, from, to, boardId }) => {
        const fromVertex = COLUMN_TO_VERTEX[from] ?? 2
        const toVertex = COLUMN_TO_VERTEX[to] ?? 4
        
        logoStore.addSpark({
          boardId,
          taskId: id,
          from: fromVertex,
          to: toVertex,
          speed: 0.005 + Math.random() * 0.004,
          color: COLUMN_COLORS[to] || '#EAB308',
          type: 'task:moved',
        })
      }, { priority: 50 }),

      // ===== Task Completed =====
      eventBus.on('task:completed', ({ id, boardId }) => {
        logoStore.addSpark({
          boardId,
          taskId: id,
          from: 4,               
          to: DIAMOND_VERTEX,  
          speed: 0.006 + Math.random() * 0.003,
          color: '#22C55E',
          type: 'task:completed',
        })
        
        setTimeout(() => {
          logoStore.addSpark({
            boardId,
            taskId: id,
            from: 3,
            to: DIAMOND_VERTEX,
            speed: 0.005,
            color: '#22C55E',
            type: 'task:completed',
          })
        }, 150)
      }, { priority: 50 }),

      // ===== XP Gained =====
      eventBus.on('xp:gained', ({ amount }) => {
        if (amount >= 30) {
          logoStore.addSpark({
            boardId: 'global',
            from: Math.floor(Math.random() * 4) + 2,
            to: DIAMOND_VERTEX,
            speed: 0.004,
            color: '#8B5CF6',
            type: 'xp:gained',
          })
        }
      }, { priority: 100 }),

      // ===== Achievement Unlocked =====
      eventBus.on('xp:achievement_unlocked', () => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            logoStore.addSpark({
              boardId: 'global',
              from: Math.floor(Math.random() * 4) + 2,
              to: DIAMOND_VERTEX,
              speed: 0.005 + Math.random() * 0.003,
              color: '#F59E0B',
              type: 'achievement_unlocked',
            })
          }, i * 100)
        }
      }, { priority: 100 }),
    ]

    return () => {
      handlers.forEach(id => eventBus.off(id))
    }
  }, [])
}