// features/logo-3d/data/board-layout.ts

import { createPolyhedron, PolyhedronData } from "./polyhedron-factory"

export interface BoardCubeData {
  id: string
  title: string
  color: string
  position: [number, number, number]
  rotation: [number, number, number]
  scale: number
  rotationSpeed: [number, number, number]
  taskCount: number
  columns: string[]
  polyhedron: PolyhedronData
}

const CONFIG = {
  BASE_SCALE: 1,   
  SCALE_STEP: .3,
  BASE_SPEED: 0.05,   
  SPEED_VARIANCE: 0.1,
  ROTATION_VARIANCE: 0.8,
} as const


export const calculateBoardLayout = (
  boards: { id: string; title: string; color: string; taskCount?: number; columns?: string[]; }[]
): BoardCubeData[] => {
  if (boards.length === 0) return []

  const sorted = [...boards].sort((a, b) => a.id.localeCompare(b.id))

  return sorted.map((board, index) => {
    const columns = board.columns || ['todo', 'in-progress', 'done']
    const polyhedron = createPolyhedron(columns)
    
    const seed = hashString(board.id)
    
    const scale = CONFIG.BASE_SCALE + (index + 1) * CONFIG.SCALE_STEP
    
    const rx = pseudoRandom(seed + 1) * Math.PI * CONFIG.ROTATION_VARIANCE
    const ry = pseudoRandom(seed + 2) * Math.PI * CONFIG.ROTATION_VARIANCE
    const rz = pseudoRandom(seed + 3) * Math.PI * CONFIG.ROTATION_VARIANCE
    
    const sx = CONFIG.BASE_SPEED * (0.5 + pseudoRandom(seed + 4))
    const sy = CONFIG.BASE_SPEED * (0.5 + pseudoRandom(seed + 5))
    const sz = CONFIG.BASE_SPEED * (0.3 + pseudoRandom(seed + 6))
    
    return {
      id: board.id,
      title: board.title,
      color: board.color,
      position: [0, 0, 0] as [number, number, number],
      rotation: [rx, ry, rz],
      scale,
      rotationSpeed: [sx, sy, sz],
      taskCount: board.taskCount || 0,
      columns,
      polyhedron,
    }
  })
}

/**
 * Simple string hash 
 */
function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash) / 2147483647
}

/**
 * Pseudo-random number between 0-1 based on seed
 */
function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}