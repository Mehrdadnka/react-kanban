// features/logo-3d/data/board-layout.ts

import { createPolyhedron, PolyhedronData } from "./polyhedron-factory"
import { GALAXY } from "../constants/galaxy.constants"

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

export const calculateBoardLayout = (
  boards: { id: string; title: string; color: string; taskCount?: number; columns?: string[]; }[]
): BoardCubeData[] => {
  if (boards.length === 0) return []

  const sorted = [...boards].sort((a, b) => a.id.localeCompare(b.id))
  const totalBoards = sorted.length
  const ringRadius = GALAXY.BOARD_RING_RADIUS

  return sorted.map((board, index) => {
    const columns = board.columns || ['todo', 'in-progress', 'done']
    const polyhedron = createPolyhedron(columns)
    
    const seed = hashString(board.id)
    
    const angle = (index / totalBoards) * Math.PI * 2
    const x = Math.cos(angle) * ringRadius
    const z = Math.sin(angle) * ringRadius
    const y = Math.sin(angle * 2) * GALAXY.BOARD_RING_HEIGHT_VARIATION
    
    const taskBonus = (board.taskCount || 0) * GALAXY.BOARD_SCALE_PER_TASK
    let scale = GALAXY.BOARD_BASE_SCALE + taskBonus
    scale = Math.max(GALAXY.BOARD_MIN_SCALE, Math.min(GALAXY.BOARD_MAX_SCALE, scale))
    
    const rx = pseudoRandom(seed + 1) * Math.PI * 0.5
    const ry = pseudoRandom(seed + 2) * Math.PI * 2
    const rz = pseudoRandom(seed + 3) * Math.PI * 0.3
    
    const sx = 0.001 * (0.5 + pseudoRandom(seed + 4))
    const sy = 0.002 * (0.5 + pseudoRandom(seed + 5))
    const sz = 0.0005 * (0.3 + pseudoRandom(seed + 6))

    return {
      id: board.id,
      title: board.title,
      color: board.color,
      position: [x, y, z],
      rotation: [rx, ry, rz],
      scale,
      rotationSpeed: [sx, sy, sz],
      taskCount: board.taskCount || 0,
      columns,
      polyhedron,
    }
  })
}

function hashString(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  return Math.abs(hash) / 2147483647
}

function pseudoRandom(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}