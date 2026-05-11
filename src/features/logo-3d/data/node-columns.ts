// features/logo-3d/data/node-columns.ts

/**
 * مپینگ vertex های octahedron به ستون‌های هر board
 * 
 * Octahedron vertices:
 * 0: top    (+y)  → ندارد (header/title)
 * 1: bottom (-y)  → ندارد (footer)
 * 2: right  (+x)  → "todo"
 * 3: front  (+z)  → "in-progress"
 * 4: left   (-x)  → "done"
 * 5: back   (-z)  → "backlog" (اختیاری)
 */

export const COLUMN_TO_VERTEX: Record<string, number> = {
  'todo': 2,
  'in-progress': 3,
  'done': 4,
  'backlog': 5,
}
export const SPARK_ORIGIN = -1  // virtual "center" node
export const DIAMOND_VERTEX = -2 // virtual "diamond" target


/**
 * رنگ هر ستون
 */
export const COLUMN_COLORS: Record<string, string> = {
  'todo': '#3B82F6',
  'in-progress': '#EAB308',
  'done': '#22C55E',
  'backlog': '#6B7280',
  'review': '#8B5CF6',
  'blocked': '#EF4444',
}