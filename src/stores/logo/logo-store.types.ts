// features/logo-3d/store/logo-store.types.ts

export type SparkType =
  | 'task:created'
  | 'task:moved'
  | 'task:completed'
  | 'xp:gained'
  | 'achievement_unlocked'

export type Spark = {
  id: string
  boardId: string
  taskId?: string
  from: number
  to: number
  progress: number
  speed: number
  color: string
  type: SparkType
}

export type OrbType = 'task' | 'xp' | 'achievement'

export type OrbData = {
  id: string
  type: OrbType
  title: string
  subtitle?: string
  icon: string
  targetPos: [number, number, number]
  startPos: [number, number, number]
}

export type LogoState = {
  sparks: Spark[]
  orbs: OrbData[]
  addSpark: (spark: Omit<Spark, 'id' | 'progress'>) => void
  addOrb: (orb: Omit<OrbData, 'id'>) => void
  removeOrb: (id: string) => void
}