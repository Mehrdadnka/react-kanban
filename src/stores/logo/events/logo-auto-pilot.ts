// features/logo-3d/events/logo-auto-pilot.ts
import { useEffect, useRef } from 'react'
import { useLogoStore } from '../logo-store'
import { useTaskStore } from '@/stores/task.store'
import { useXPStore } from '@/stores/xp/xp.store'
import type { Task } from '@/types/task.types'

const orbPositions: [number, number, number][] = [
  [0, 2.2, 0],
  [1.5, 1.8, 1],
  [-1.5, 1.8, -1],
]

const PRIORITY_WEIGHTS: Record<string, number> = {
  urgent: 8,
  high: 4,
  medium: 1,
  low: 0.3,
}

const pickWeightedRandom = (tasks: Task[]): Task | null => {
  if (tasks.length === 0) return null
  const weighted = tasks.flatMap((t) => {
    const weight = PRIORITY_WEIGHTS[t.priority || 'medium'] || 1
    return Array(Math.ceil(weight)).fill(t)
  })
  return weighted[Math.floor(Math.random() * weighted.length)]
}

export const useLogoAutoPilot = () => {
  const taskTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const xpTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    const showRandomTask = () => {
      const taskStore = useTaskStore.getState()
      const logoStore = useLogoStore.getState()

      const tasks = taskStore.tasks.filter(
        (t) => t.status !== 'archived' && t.status !== 'completed'
      )

      if (tasks.length === 0) return

      const task = pickWeightedRandom(tasks)
      if (!task) return

      const isHigh = task.priority === 'urgent' || task.priority === 'high'

      logoStore.addSpark(isHigh ? 'xp:gained' : 'task:moved')
      logoStore.addOrb({
        type: 'task',
        title: task.title.slice(0, 30),
        subtitle: isHigh ? `⚡ ${task.priority.toUpperCase()}` : 'In progress',
        icon: isHigh ? '🔥' : '📋',
        targetPos: orbPositions[Math.floor(Math.random() * 3)],
        startPos: [0, 0, 0],
      })
    }

    const showXPStatus = () => {
      const xpStore = useXPStore.getState()
      const logoStore = useLogoStore.getState()
      const info = xpStore.getLevelInfo()

      logoStore.addSpark('xp:gained')
      logoStore.addOrb({
        type: 'xp',
        title: `Level ${info.level}`,
        subtitle: `${info.progress}% to next`,
        icon: '⚡',
        targetPos: [0, 2.5, 0],
        startPos: [0, 0, 0],
      })
    }

    // Start timers
    taskTimerRef.current = setInterval(showRandomTask, 12000)
    xpTimerRef.current = setInterval(showXPStatus, 30000)

    // First run delayed
    const t1 = setTimeout(showRandomTask, 3000)
    const t2 = setTimeout(showXPStatus, 8000)

    return () => {
      if (taskTimerRef.current) clearInterval(taskTimerRef.current)
      if (xpTimerRef.current) clearInterval(xpTimerRef.current)
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [])
}