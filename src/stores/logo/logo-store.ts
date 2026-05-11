// features/logo-3d/store/logo-store.ts
import { create } from 'zustand'
import type { LogoState, Spark, SparkType, OrbData } from './logo-store.types'

let sparkId = 0
let orbId = 0

const randomNode = () => Math.floor(Math.random() * 8)
const randomPair = () => {
  let from = randomNode()
  let to = randomNode()
  while (to === from) to = randomNode()
  return { from, to }
}

const sparkColors: Record<string, string> = {
  'task:created': '#3b82f6',
  'task:moved': '#eab308',
  'task:completed': '#22c55e',
  'xp:gained': '#8b5cf6',
  'achievement_unlocked': '#f59e0b',
}

export const useLogoStore = create<LogoState>((set, get) => ({
  sparks: [],
  orbs: [],

  addSpark: (sparkData) => {
    const spark: Spark = {
      id: `spark-${++sparkId}`,
      progress: 0,
      ...sparkData,
    }

    set((s) => ({
      sparks: [...s.sparks.slice(-30), spark],
    }))

    const lifetime = 3000 + spark.speed * 1000
    setTimeout(() => {
      set((s) => ({ sparks: s.sparks.filter((sp) => sp.id !== spark.id) }))
    }, lifetime)
  },

  addOrb: (orb) => {
    const id = `orb-${++orbId}`

    const newOrb: OrbData = {
      ...orb,
      id,
    }

    set((s) => ({
      orbs: [...s.orbs.slice(-3), newOrb],
    }))

    setTimeout(() => {
      get().removeOrb(id)
    }, 6000)
  },

  removeOrb: (id) => {
    set((s) => ({ orbs: s.orbs.filter((o) => o.id !== id) }))
  },
}))