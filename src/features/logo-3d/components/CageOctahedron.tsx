import { useRef, useMemo, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import * as THREE from 'three'
import type { Group } from 'three'
import type { BoardCubeData } from '../data/board-layout'

import { ParkingNode } from './ParkingNode'
import { useTaskStore } from '@/stores/task.store'
import { COLUMN_COLORS } from '../data/node-columns'
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
// FlowLine
// ============================================================

interface FlowLineProps {
  from: [number, number, number]
  to: [number, number, number]
  color: string
  isActive: boolean
  taskCount: number
}

const FLOW_VERTEX = /* glsl */`
  varying vec2 vUv;
  varying vec3 vPosition;
  varying vec3 vWorldPos;
  
  void main() {
    vUv = uv;
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

const FLOW_FRAGMENT = /* glsl */`
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uSpeed;
  uniform float uDashCount;
  varying vec2 vUv;
  
  void main() {
    float phase = uTime * uSpeed;
    
    float dash = sin((vUv.x + phase) * uDashCount * 6.28318);
    
    dash = smoothstep(-0.1, 0.15, dash) * (1.0 - smoothstep(0.8, 1.1, dash));
    
    float endFade = 1.0;
    float fadeDist = 0.1;
    if (vUv.x < fadeDist) endFade = vUv.x / fadeDist;
    if (vUv.x > 1.0 - fadeDist) endFade = (1.0 - vUv.x) / fadeDist;
    
    // Core dash
    float core = dash;
    
    float glow = exp(-abs(vUv.y - 0.5) * 3.0) * 0.4;
    
    float alpha = (core * 1.0 + glow * dash * 0.5) * uOpacity * endFade;
    
    alpha = max(alpha, 0.03 * uOpacity * endFade);
    
    gl_FragColor = vec4(uColor, alpha);
  }
`
// ============================================================
// FlowCylinder Component
// ============================================================
const FlowCylinder = ({ from, to, color, isActive, taskCount }: FlowLineProps) => {
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  
  // Geometry
  const { geometry, midPoint, quaternion } = useMemo(() => {
    const start = new THREE.Vector3(...from)
    const end = new THREE.Vector3(...to)
    const dir = new THREE.Vector3().subVectors(end, start)
    const length = dir.length()
    
    const radius = isActive ? 0.08 : 0.032
    const geo = new THREE.CylinderGeometry(radius, radius, length, 32, 1)
    
    const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5)
    const direction = dir.normalize()
    const quaternion = new THREE.Quaternion()
    quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction)
    
    return { geometry: geo, midPoint, quaternion }
  }, [from, to, isActive])

  const uniformsRef = useRef({
    uColor: { value: new THREE.Color(color) },
    uOpacity: { value: isActive ? 0.9 : 0.4 },
    uTime: { value: Math.random() * 100 },
    uSpeed: { value: 0.6 + taskCount * 0.15 },
    uDashCount: { value: 3 + taskCount * 0.5 },
  })

  useFrame((_, delta) => {
    if (!materialRef.current) return
    
    const u = materialRef.current.uniforms
    
    u.uTime.value += delta / 10
    
    const base = isActive ? 0.05 : 0.01
    const boost = Math.min(taskCount * 0.01, 0.5)
    const target = base + boost
    u.uOpacity.value += (target - u.uOpacity.value) * delta * 4
    
    const targetSpeed = 0.6 + taskCount * 0.15
    u.uSpeed.value += (targetSpeed - u.uSpeed.value) * delta * 2
    
    const targetDash = 1 + taskCount * 0.5
    u.uDashCount.value += (targetDash - u.uDashCount.value) * delta * 2
  })

  return (
    <mesh
      position={midPoint}
      quaternion={quaternion}
      geometry={geometry}
    >
      <shaderMaterial
        ref={materialRef}
        vertexShader={FLOW_VERTEX}
        fragmentShader={FLOW_FRAGMENT}
        uniforms={uniformsRef.current}
        transparent
        depthWrite={false}
        blending={THREE.NormalBlending}
      />
    </mesh>
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
  const { vertices, edges, activeVertices, vertexToColumn } = board.polyhedron

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
  activeVertices.forEach(v => {
    const colId = vertexToColumn[v]
    if (colId) {
      grouped[colId] = boardTasks.filter(t => t.columnId === colId)
    }
  })
  return grouped
}, [boardTasks])
  const tasksByVertex = useMemo(() => {
    const grouped: Record<number, Task[]> = {}
    activeVertices.forEach(v => {
      grouped[v] = boardTasks.filter(t => t.columnId === vertexToColumn[v])
    })
    return grouped
  }, [boardTasks, activeVertices, vertexToColumn])

  const label = board.taskCount > 0 
    ? `${board.title} (${board.taskCount})`
    : board.title

  return (
    <group
     ref={groupRef} 
     rotation={board.rotation}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleBackgroundClick()
        }
      }}
    >
      <group scale={[board.scale, board.scale, board.scale]}>              
        {edges.map(([from, to], i) => (
          <FlowCylinder
            key={i}
            from={vertices[from]}
            to={vertices[to]}
            color={board.color}
            isActive={isActive}
            taskCount={board.taskCount}
          />
        ))}
        {/* ===== Parking Nodes ===== */}
        {activeVertices.map(vertexIndex => {
          const colId = vertexToColumn[vertexIndex]
          if (!colId) return null
          
          return (
            <ParkingNode
              key={vertexIndex}
              position={vertices[vertexIndex]}
              columnId={colId}
              columnColor={COLUMN_COLORS[colId] || board.color}
              tasks={tasksByColumn[colId] || []}
              boardColor={board.color}
              style="metallic"
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
          {board.title.length > 18 ? board.title.slice(0, 18) + '…' : board.title}
        </Text>

      </group>
    </group>
  )
}