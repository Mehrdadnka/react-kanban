// features/logo-3d/events/logo-event-bridge.ts
import { useEffect } from 'react'
import { useEventBus } from '@/stores/core/event-bus.store'
import { useLogoStore } from '../logo-store'
import { COLUMN_TO_VERTEX, SPARK_ORIGIN, DIAMOND_VERTEX } from 
'@/features/logo-3d/data/node-columns'

const COLUMN_COLORS: Record<string, string> = {
  'todo': '#3B82F6',
  'in-progress': '#EAB308',
  'done': '#22C55E',
  'backlog': '#6B7280',
}

export const useLogoEventBridge = () => {
  useEffect(() => {
    const eventBus = useEventBus.getState()
    const logoStore = useLogoStore.getState()

    const handlers = [
      // ===== Task Created =====
      // spark از مرکز (SPARK_ORIGIN) به vertex ستون
      eventBus.on('task:created', ({ id, boardId, columnId }) => {
        const toVertex = COLUMN_TO_VERTEX[columnId] ?? 2
        
        logoStore.addSpark({
          boardId,
          taskId: id,
          from: SPARK_ORIGIN,      // از مرکز board
          to: toVertex,             // به ستون
          speed: 0.004 + Math.random() * 0.003,
          color: COLUMN_COLORS[columnId] || '#3B82F6',
          type: 'task:created',
        })
      }, { priority: 50 }),

      // ===== Task Moved =====
      // spark از vertex قدیم به vertex جدید
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
      // spark از vertex ستون به الماس مرکزی
      eventBus.on('task:completed', ({ id, boardId }) => {
        logoStore.addSpark({
          boardId,
          taskId: id,
          from: 4,                  // از done vertex
          to: DIAMOND_VERTEX,       // به الماس مرکزی
          speed: 0.006 + Math.random() * 0.003,
          color: '#22C55E',
          type: 'task:completed',
        })
        
        // spark اضافی از in-progress هم
        setTimeout(() => {
          logoStore.addSpark({
            boardId,
            taskId: id,
            from: 3,                // از in-progress
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