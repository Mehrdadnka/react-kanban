// features/logo-3d/components/CageOctahedron.tsx
import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import type { BoardCubeData } from '../data/board-layout'

import { ParkingNode } from './ParkingNode'
import { useTaskStore } from '@/stores/task.store'
import { ACTIVE_VERTICES, VERTEX_TO_COLUMN, COLUMN_COLORS } from '../data/node-columns'
import { Task } from '@/types/task.types'

const OCTA_EDGES: [number, number][] = [
  [0, 2], [0, 3], [0, 4], [0, 5],
  [1, 2], [1, 3], [1, 4], [1, 5],
  [2, 3], [3, 4], [4, 5], [5, 2],
]

const OCTA_VERTICES = (radius: number): [number, number, number][] => [
  [0, +radius, 0],
  [0, -radius, 0],
  [+radius, 0, 0],
  [0, 0, +radius],
  [-radius, 0, 0],
  [0, 0, -radius],
]

// ============================================================
// ThinLine Component - داینامیک بر اساس taskCount
// ============================================================
interface ThinLineProps {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  isActive: boolean
  taskCount: number
}

const ThinLine = ({ from, to, color, isActive, taskCount }: ThinLineProps) => {
  // محاسبه lineWidth داینامیک
  const lineWidth = useMemo(() => {
    if (taskCount === 0) return 0.5   // حداقل - خیلی نازک
    if (taskCount <= 3) return 1      // کم
    if (taskCount <= 7) return 2      // متوسط
    if (taskCount <= 15) return 3     // زیاد
    return 4                           // خیلی زیاد
  }, [taskCount])

  const opacity = useMemo(() => {
    const base = isActive ? 0.9 : 0.4
    // board با تسک بیشتر = opacity بیشتر
    const taskBoost = Math.min(taskCount * 0.03, 0.3)
    return Math.min(base + taskBoost, 1)
  }, [isActive, taskCount])

  return (
    <Line
      points={[from, to]}
      color={color}
      lineWidth={lineWidth}
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  )
}

// ============================================================
// CageOctahedron Component
// ============================================================
interface CageOctahedronProps {
  board: BoardCubeData
  isActive?: boolean
}

export const CageOctahedron = ({ 
  board, 
  isActive = false
}: CageOctahedronProps) => {
  const groupRef = useRef<Group>(null!)
  const vertices = useMemo(() => OCTA_VERTICES(1.0), [])
  
  const [boardTasks, setBoardTasks] = useState<Task[]>([])
  const [openTaskId, setOpenTaskId] = useState<string | null>(null)
  const handleBackgroundClick = () => {
    setOpenTaskId(null)
  }
  
  useEffect(() => {
  const updateTasks = () => {
    const taskStore = useTaskStore.getState()
    setBoardTasks(
      taskStore.tasks.filter(
        t => t.boardId === board.id && t.status !== 'archived'
      )
    )
  }
  
  updateTasks()
  const unsub = useTaskStore.subscribe(updateTasks)
  return unsub
  }, [board.id])

const tasksByColumn = useMemo(() => {
  const grouped: Record<string, Task[]> = {}
  ACTIVE_VERTICES.forEach(v => {
    const colId = VERTEX_TO_COLUMN[v]
    if (colId) {
      grouped[colId] = boardTasks.filter(t => t.columnId === colId)
    }
  })
  return grouped
}, [boardTasks])


  useFrame((_, delta) => {
    if (!groupRef.current) return
    const dt = delta * 60
    groupRef.current.rotation.x += board.rotationSpeed[0] * dt * 0.01
    groupRef.current.rotation.y += board.rotationSpeed[1] * dt * 0.01
    groupRef.current.rotation.z += board.rotationSpeed[2] * dt * 0.01
  })

  const label = board.taskCount > 0 
    ? `${board.title} (${board.taskCount})`
    : board.title

  return (
    <group
     ref={groupRef} 
     rotation={board.rotation}
      onClick={(e) => {
        // فقط اگه روی چیزی کلیک نشده باشه
        if (e.target === e.currentTarget) {
          handleBackgroundClick()
        }
      }}
    >
      <group scale={[board.scale, board.scale, board.scale]}>
        
        {/* ===== میله‌های قفس ===== */}
        {OCTA_EDGES.map(([from, to], i) => (
          <ThinLine
            key={i}
            from={vertices[from]}
            to={vertices[to]}
            color={board.color}
            isActive={isActive}
            taskCount={board.taskCount}
          />
        ))}

        {/* ===== Parking Nodes (فقط روی vertex های active) ===== */}
        {ACTIVE_VERTICES.map(vertexIndex => {
          const colId = VERTEX_TO_COLUMN[vertexIndex]
          if (!colId) return null
          
          return (
            <ParkingNode
              key={vertexIndex}
              position={vertices[vertexIndex]}
              columnId={colId}
              columnColor={COLUMN_COLORS[colId] || board.color}
              tasks={tasksByColumn[colId] || []}
              boardColor={board.color}
            />
          )
        })}

        {/* ===== Title ===== */}
        <Text
          position={[0, 1.3, 0]}
          fontSize={0.2}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.04}
          outlineColor="#00000099"
        >
          {label.length > 18 ? label.slice(0, 18) + '…' : label}
        </Text>

      </group>
    </group>
  )
}