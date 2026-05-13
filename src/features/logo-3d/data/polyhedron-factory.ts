export interface PolyhedronData {
  vertices: [number, number, number][]
  edges: [number, number][]
  vertexToColumn: Record<number, string | null>
  columnToVertex: Record<string, number>
  columnCount: number
  activeVertices: number[]
}


export const createPolyhedron = (columns: string[]): PolyhedronData => {
  const count = columns.length
  if (count < 3) {
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
  
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 - Math.PI / 2  
    vertices.push([
      Math.cos(angle) * radius,
      0,
      Math.sin(angle) * radius,
    ])
  }
  
  vertices.push([0, -radius, 0])  // bottom

  // Edge generation
  const edges: [number, number][] = []
  
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