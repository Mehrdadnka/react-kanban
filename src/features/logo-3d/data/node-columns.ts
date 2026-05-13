

export const COLUMN_TO_VERTEX: Record<string, number> = {
  'todo': 2,
  'in-progress': 3,
  'done': 4,
  'backlog': 5,
}
export const SPARK_ORIGIN = -1  // virtual "center" node
export const DIAMOND_VERTEX = -2 // virtual "diamond" target

export const COLUMN_COLORS: Record<string, string> = {
  'todo': '#3B82F6',
  'in-progress': '#EAB308',
  'done': '#22C55E',
  'backlog': '#6B7280',
  'review': '#8B5CF6',
  'blocked': '#EF4444',
}