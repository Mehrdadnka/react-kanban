// features/logo-3d/data/polyhedron-factory.ts

/**
 * Polyhedron Factory
 * 
 * بر اساس تعداد ستون‌ها (columns) یه bipyramid می‌سازه:
 * - ۲ vertex ثابت: top (بالا) و bottom (پایین)
 * - N vertex روی ring (استوا) به تعداد ستون‌ها
 * - edges = ring کامل + هر ring vertex به top و bottom
 * 
 * ۳ ستون → ۵ vertex → ۹ edge
 * ۴ ستون → ۶ vertex → ۱۲ edge (octahedron)
 * ۵ ستون → ۷ vertex → ۱۵ edge
 */

export interface PolyhedronData {
  /** vertex positions (radius = 1) */
  vertices: [number, number, number][]
  /** edge pairs [fromIndex, toIndex] */
  edges: [number, number][]
  /** vertex index → column id (null برای top/bottom) */
  vertexToColumn: Record<number, string | null>
  /** column id → vertex index */
  columnToVertex: Record<string, number>
  /** تعداد ستون‌ها */
  columnCount: number
  /** vertex index های active (ستون‌ها) */
  activeVertices: number[]
}

/**
 * تولید bipyramid بر اساس لیست ستون‌ها
 */
export const createPolyhedron = (columns: string[]): PolyhedronData => {
  const count = columns.length
  if (count < 3) {
    // حداقل ۳ تا - fallback به tetrahedron-style
    return createPolyhedron(['todo', 'in-progress', 'done'])
  }

  // vertex indices:
  // 0 = top
  // 1...count = ring vertices (order matters)
  // count+1 = bottom
  
  const bottomIndex = count + 1
  const radius = 1.0
  
  // Ring vertices
  const vertices: [number, number, number][] = [
    [0, +radius, 0],  // 0: top
  ]
  
  // پخش مساوی دور استوا
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2  // شروع از راست
    vertices.push([
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ])
  }
  
  vertices.push([0, -radius, 0])  // bottom

  // Edge generation
  const edges: [number, number][] = []
  
  // Ring edges (حلقه استوا)
  for (let i = 1; i <= count; i++) {
    const next = i === count ? 1 : i + 1
    edges.push([i, next])
  }
  
  // Top to ring
  for (let i = 1; i <= count; i++) {
    edges.push([0, i])
  }
  
  // Bottom to ring
  for (let i = 1; i <= count; i++) {
    edges.push([bottomIndex, i])
  }

  // Mapping
  const vertexToColumn: Record<number, string | null> = {
    0: null,           // top
    [bottomIndex]: null, // bottom
  }
  
  const columnToVertex: Record<string, number> = {}
  const activeVertices: number[] = []
  
  for (let i = 0; i < count; i++) {
    const vertexIndex = i + 1
    const colId = columns[i]
    vertexToColumn[vertexIndex] = colId
    columnToVertex[colId] = vertexIndex
    activeVertices.push(vertexIndex)
  }

  return {
    vertices,
    edges,
    vertexToColumn,
    columnToVertex,
    columnCount: count,
    activeVertices,
  }
}