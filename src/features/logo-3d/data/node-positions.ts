// features/logo-3d/data/node-positions.ts

/**
 * 8 nodes forming a diamond/cube hybrid around the core
 * arranged in a symmetric neural pattern
 */
export const NODE_POSITIONS: [number, number, number][] = [
  [0, 1.5, 0],                      // top
  [0, -1.5, 0],                     // bottom
  [1.0, 0, 1.0],                    // front-right
  [-1.0, 0, 1.0],                   // front-left
  [1.0, 0, -1.0],                   // back-right
  [-1.0, 0, -1.0],                  // back-left
  [1.3, 0.7, 0],                    // right-mid
  [-1.3, 0.7, 0],                   // left-mid
]

/**
 * Which nodes connect to which (for neural lines later)
 */
export const NODE_CONNECTIONS: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7],
  [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7],
  [2, 6], [2, 7], [3, 6], [3, 7],
  [4, 6], [4, 7], [5, 6], [5, 7],
  [2, 3], [4, 5],
]