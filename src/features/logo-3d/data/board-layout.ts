// features/logo-3d/data/board-layout.ts

export interface BoardCubeData {
  id: string
  title: string
  color: string
  /** همیشه (0,0,0) - همه هم‌مرکز */
  position: [number, number, number]
  /** چرخش حول مرکز خودش - هر board یه زاویه متفاوت */
  rotation: [number, number, number]
  /** مقیاس - board های بیشتر = لایه‌های بزرگتر */
  scale: number
  /** سرعت چرخش - هر board ریتم خودش رو داره */
  rotationSpeed: [number, number, number]
  taskCount: number

}

/**
 * پارامترهای ثابت سیستم
 */
const CONFIG = {
  BASE_SCALE: 1,        // اندازه پایه داخلی‌ترین لایه
  SCALE_STEP: .3,       // هر board چقدر از قبلی بزرگتر باشه
  BASE_SPEED: 0.05,       // سرعت پایه چرخش
  SPEED_VARIANCE: 0.1,    // تغییرات رندوم سرعت
  ROTATION_VARIANCE: 0.8, // تغییرات زاویه اولیه (بر حسب PI)
} as const

/**
 * الگوریتم: لایه‌های متحدالمرکز
 * 
 * هر board:
 * - position = (0,0,0) همیشه
 * - scale = BASE_SCALE + (index × SCALE_STEP)
 * - rotation = random seed angle (برای اینکه wireframe ها تداخل نکنن)
 * - rotationSpeed = BASE_SPEED ± random variance
 */
export const calculateBoardLayout = (
  boards: { id: string; title: string; color: string; taskCount?: number }[]
): BoardCubeData[] => {
  if (boards.length === 0) return []

  // مرتب‌سازی بر اساس id برای determinism
  const sorted = [...boards].sort((a, b) => a.id.localeCompare(b.id))

  return sorted.map((board, index) => {
    // Seed یکتا برای هر board (deterministic random)
    const seed = hashString(board.id)
    
    // Scale: هر لایه از قبلی SCALE_STEP بزرگتر
    const scale = CONFIG.BASE_SCALE + (index + 1) * CONFIG.SCALE_STEP
    
    // Rotation زاویه اولیه - با seed pseudo-random
    const rx = pseudoRandom(seed + 1) * Math.PI * CONFIG.ROTATION_VARIANCE
    const ry = pseudoRandom(seed + 2) * Math.PI * CONFIG.ROTATION_VARIANCE
    const rz = pseudoRandom(seed + 3) * Math.PI * CONFIG.ROTATION_VARIANCE
    
    // Rotation speed - هر board سرعت چرخش متفاوت
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
    }
  })
}

/**
 * Simple string hash → عدد بین 0 تا 1 (deterministic)
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