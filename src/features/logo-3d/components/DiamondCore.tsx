import { useRef, useEffect, useState, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Group } from 'three'
import { useBoardStore } from '@/stores/board.store'
import { calculateBoardLayout, type BoardCubeData } from '../data/board-layout'
import { CageOctahedron } from './CageOctahedron'
import { useTaskStore } from '@/stores/task.store'
import { Task } from '@/types/task.types'


export const DiamondCore = () => {
  const centralRef = useRef<Group>(null!)
  const [cubeData, setCubeData] = useState<BoardCubeData[]>([])
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null)
  const taskStore = useTaskStore.getState()   
  useEffect(() => {
    const updateLayout = () => {
      const store = useBoardStore.getState()
      const boards = store.boards.map(b => ({
        id: b.id,
        title: b.title,
        color: b.color,
        taskCount: taskStore.tasks.filter(
          t => t.boardId === b.id && t.status !== 'archived' && t.status !== 'completed'
        ).length,
        columns: getBoardColumns(b.id, taskStore.tasks),
      }))
      setCubeData(calculateBoardLayout(boards))
      setActiveBoardId(store.activeBoardId)
    }
    
    updateLayout()
    const unsubBoard = useBoardStore.subscribe(updateLayout)
    const unsubTask = useTaskStore.subscribe(updateLayout)
    
    return () => {
      unsubBoard()
      unsubTask()
    }
  }, [])



const getBoardColumns = (boardId: string, tasks: Task[]): string[] => {
  const columns = new Set<string>()
  tasks
    .filter(t => t.boardId === boardId)
    .forEach(t => columns.add(t.columnId))
  
  const defaults = ['todo', 'in-progress', 'done']
  defaults.forEach(c => columns.add(c))
  
  return Array.from(columns)
}

  return (
    <group>
      <group ref={centralRef} scale={[0.45, 0.45, 0.45]}>
        <CentralDiamondCage />
      </group>

      {/* ===== Board Cages ===== */}
      {cubeData.map((board) => (
        <CageOctahedron
          key={board.id}
          board={board}
          isActive={board.id === activeBoardId}
          rodRadius={0.03}
        />
      ))}
    </group>
  )
}

// ============================================================
// Central Diamond Cage Component
// ============================================================

const CENTRAL_EDGES: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 3], [3, 4], [4, 5], [5, 2],
]

const CentralDiamondCage = () => {
  const rods = useMemo(() => {
    const r = 1.0
    const verts: [number, number, number][] = [
      [0, +r, 0],   // 0: top
      [0, -r, 0],   // 1: bottom
      [+r, 0, 0],   // 2: right
      [0, 0, +r],   // 3: front
      [-r, 0, 0],   // 4: left
      [0, 0, -r],   // 5: back
    ]

    return CENTRAL_EDGES.map(([a, b]) => {
      const start = verts[a]
      const end = verts[b]
      
      const dx = end[0] - start[0]
      const dy = end[1] - start[1]
      const dz = end[2] - start[2]
      const length = Math.sqrt(dx*dx + dy*dy + dz*dz)
      
      // Midpoint
      const midX = (start[0] + end[0]) / 2
      const midY = (start[1] + end[1]) / 2
      const midZ = (start[2] + end[2]) / 2
      
      // Direction unit vector
      const dir = new THREE.Vector3(dx/length, dy/length, dz/length)
      
      // Quaternion: rotate from Y-up (0,1,0) to direction
      const quaternion = new THREE.Quaternion()
      quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        dir
      )

      return {
        position: [midX, midY, midZ] as [number, number, number],
        quaternion: [quaternion.x, quaternion.y, quaternion.z, quaternion.w] as [number, number, number, number],
        length,
      }
    })
  }, [])

  return (
    <group>
      {rods.map((rod, i) => (
        <mesh 
          key={i}
          position={rod.position}
          quaternion={rod.quaternion}
        >
          <cylinderGeometry args={[0.01, 0.03, rod.length, 6]} />
          <meshPhysicalMaterial
            color="#a78bfa"
            emissive="#8b5cf6"
            emissiveIntensity={0.8}
            metalness={0.1}
            roughness={0.15}
            transparent
            opacity={0.7}
            clearcoat={0.5}
            clearcoatRoughness={0.1}
            reflectivity={0.6}
          />
        </mesh>
      ))}
    </group>
  )
}