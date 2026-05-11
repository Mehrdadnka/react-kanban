// features/logo-3d/events/logo-event-bridge.ts
import { useEffect } from 'react'
import { useEventBus } from '@/stores/core/event-bus.store'
import { useLogoStore } from './logo-store'
import { useXPStore } from '@/stores/xp/xp.store'
import { useTaskStore } from '@/stores/task.store'
import { useBoardStore } from '@/stores/board.store'
import { createPolyhedron } from '@/features/logo-3d/data/polyhedron-factory'
import { COLUMN_COLORS, DIAMOND_VERTEX, SPARK_ORIGIN } from '@/features/logo-3d/data/node-columns'

// Helper: get columns for a board
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
    const xpStore = useXPStore.getState()

    const handlers = [
      // ===== Task Created =====
      eventBus.on('task:created', ({ id, boardId, columnId }) => {
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
        const columns = getColumnsForBoard(boardId)
        const polyhedron = createPolyhedron(columns)
        const fromVertex = polyhedron.columnToVertex[from] ?? polyhedron.activeVertices[0]
        const toVertex = polyhedron.columnToVertex[to] ?? polyhedron.activeVertices[0]
        
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

      // ===== Task Completed → spark to diamond =====
      eventBus.on('task:completed', ({ id, boardId }) => {
        const columns = getColumnsForBoard(boardId)
        const polyhedron = createPolyhedron(columns)
        const doneVertex = polyhedron.columnToVertex['done'] ?? 4
        
        logoStore.addSpark({
          boardId,
          taskId: id,
          from: doneVertex,
          to: DIAMOND_VERTEX,
          speed: 0.006 + Math.random() * 0.003,
          color: '#22C55E',
          type: 'task:completed',
        })
        
        // Second spark from in-progress
        setTimeout(() => {
          const inProgressVertex = polyhedron.columnToVertex['in-progress'] ?? 3
          logoStore.addSpark({
            boardId,
            taskId: id,
            from: inProgressVertex,
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
        
        // Add orb for large XP
        if (amount >= 50) {
          logoStore.addOrb({
            type: 'xp',
            title: `+${amount} XP`,
            subtitle: '',
            icon: '⚡',
            targetPos: [0, 2, 0],
            startPos: [0, 0, 0],
          })
        }
      }, { priority: 100 }),

      // ===== Level Up =====
      eventBus.on('xp:level_up', ({ newLevel, title }) => {
        // Burst of sparks
        for (let i = 0; i < 8; i++) {
          setTimeout(() => {
            logoStore.addSpark({
              boardId: 'global',
              from: Math.floor(Math.random() * 4) + 2,
              to: DIAMOND_VERTEX,
              speed: 0.006 + Math.random() * 0.004,
              color: '#8B5CF6',
              type: 'xp:gained',
            })
          }, i * 80)
        }
        
        logoStore.addOrb({
          type: 'xp',
          title: `Level ${newLevel}!`,
          subtitle: title,
          icon: '🏆',
          targetPos: [0, 3, 0],
          startPos: [0, 0, 0],
        })
      }, { priority: 100 }),

      // ===== Achievement Unlocked =====
      eventBus.on('xp:achievement_unlocked', ({ name, rewards }) => {
        // Golden sparks
        for (let i = 0; i < 5; i++) {
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
        
        logoStore.addOrb({
          type: 'achievement',
          title: name,
          subtitle: rewards.badge ? `Badge: ${rewards.badge}` : '',
          icon: '🏅',
          targetPos: [0, 2.5, 0],
          startPos: [0, 0, 0],
        })
      }, { priority: 100 }),

      // ===== PowerUp Used =====
      eventBus.on('powerup:used', ({ powerUpId }) => {
        logoStore.addSpark({
          boardId: 'global',
          from: Math.floor(Math.random() * 4) + 2,
          to: DIAMOND_VERTEX,
          speed: 0.005,
          color: '#EC4899',
          type: 'xp:gained',
        })
        
        logoStore.addOrb({
          type: 'xp',
          title: 'PowerUp!',
          subtitle: powerUpId,
          icon: '⚡',
          targetPos: [0, 2, 0],
          startPos: [0, 0, 0],
        })
      }, { priority: 50 }),

      // ===== Challenge Completed =====
      eventBus.on('challenge:completed', ({ title, reward }) => {
        for (let i = 0; i < 3; i++) {
          setTimeout(() => {
            logoStore.addSpark({
              boardId: 'global',
              from: Math.floor(Math.random() * 4) + 2,
              to: DIAMOND_VERTEX,
              speed: 0.005,
              color: '#F59E0B',
              type: 'achievement_unlocked',
            })
          }, i * 100)
        }
        
        logoStore.addOrb({
          type: 'achievement',
          title: 'Challenge Done!',
          subtitle: title,
          icon: '🎯',
          targetPos: [0, 2.5, 0],
          startPos: [0, 0, 0],
        })
      }, { priority: 50 }),
    ]

    // ===== Initial boot spark =====
    setTimeout(() => {
      logoStore.addSpark({
        boardId: 'global',
        from: SPARK_ORIGIN,
        to: DIAMOND_VERTEX,
        speed: 0.005,
        color: '#6366f1',
        type: 'xp:gained',
      })
    }, 500)

    return () => {
      handlers.forEach(id => eventBus.off(id))
    }
  }, [])
}