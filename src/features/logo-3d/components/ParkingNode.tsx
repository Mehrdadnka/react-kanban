// features/logo-3d/components/ParkingNode.tsx
import { useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Mesh } from 'three'
import type { Task } from '@/types/task.types'

interface ParkingNodeProps {
  position: [number, number, number]
  columnId: string
  columnColor: string
  tasks: Task[]
  boardColor: string
}

export const ParkingNode = ({ 
  position, 
  columnId, 
  columnColor, 
  tasks,
  boardColor 
}: ParkingNodeProps) => {
  const dotRef = useRef<Mesh>(null!)
  const [hovered, setHovered] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  
  useFrame(({ clock }) => {
    if (dotRef.current) {
      const t = clock.getElapsedTime()
      dotRef.current.position.y = position[1] + Math.sin(t * 2) * 0.03
    }
  })

  const taskCount = tasks.length
  const hasUrgent = tasks.some(t => t.priority === 'urgent')

  const handleTaskClick = (task: Task) => {
    setSelectedTask(prev => prev?.id === task.id ? null : task)
  }

  return (
    <group position={position}>
      {/* ===== Core dot ===== */}
      <mesh
        ref={dotRef}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false)
          // فقط اگه روی حلقه‌ها کلیک نشده باشه
        }}
      >
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial
          color={hasUrgent ? '#EF4444' : columnColor}
          transparent
          opacity={hovered || selectedTask ? 1 : 0.7}
          depthWrite={false}
        />
      </mesh>

      {/* ===== حلقه‌های کلیک‌پذیر ===== */}
      {taskCount > 0 && (
        <group>
          {tasks.slice(0, hovered || selectedTask ? tasks.length : Math.min(3, taskCount)).map((task, i) => (
            <Ringlet
              key={task.id}
              task={task}
              index={i}
              total={taskCount}
              color={task.priority === 'urgent' ? '#EF4444' : columnColor}
              hovered={hovered}
              isSelected={selectedTask?.id === task.id}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </group>
      )}

      {/* ===== Glow ===== */}
      {(hovered || selectedTask) && (
        <mesh>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color={columnColor}
            transparent
            opacity={0.15}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ===== Task Card Preview ===== */}
      {selectedTask && (
        <TaskCardPopup 
          task={selectedTask}
          columnColor={columnColor}
          onClose={() => setSelectedTask(null)}
        />
      )}
    </group>
  )
}

// ============================================================
// Ringlet - حالا کلیک‌پذیر
// ============================================================
interface RingletProps {
  task: Task
  index: number
  total: number
  color: string
  hovered: boolean
  isSelected: boolean
  onClick: () => void
}

const Ringlet = ({ task, index, total, color, hovered, isSelected, onClick }: RingletProps) => {
  const ref = useRef<Mesh>(null!)
  
  const radius = 0.06 + index * 0.025
  
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * (0.5 + index * 0.15)
      ref.current.rotation.x += delta * 0.2
      
      // پالس برای selected
      if (isSelected) {
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2
        ref.current.scale.setScalar(scale)
      } else {
        ref.current.scale.setScalar(1)
      }
    }
  })

  return (
    <mesh 
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
    >
      <torusGeometry args={[radius, isSelected ? 0.012 : 0.006, 6, 12]} />
      <meshBasicMaterial
        color={isSelected ? '#FFFFFF' : color}
        transparent
        opacity={isSelected ? 1 : hovered ? 0.8 : 0.35}
        depthWrite={false}
      />
    </mesh>
  )
}

// ============================================================
// TaskCardPopup - کارت اطلاعات تسک
// ============================================================
interface TaskCardPopupProps {
  task: Task
  columnColor: string
  onClose: () => void
}

const TaskCardPopup = ({ task, columnColor, onClose }: TaskCardPopupProps) => {
  const priorityColors: Record<string, string> = {
    'urgent': '#EF4444',
    'high': '#F59E0B',
    'medium': '#3B82F6',
    'low': '#6B7280',
  }

  const statusLabels: Record<string, string> = {
    'todo': '📋 Todo',
    'in-progress': '🔄 In Progress',
    'done': '✅ Done',
    'backlog': '📦 Backlog',
  }

  return (
    <Html
      position={[0, 0.25, 0]}
      center
      distanceFactor={8}
      occlude={false}
      style={{ pointerEvents: 'auto' }}
    >
      <div 
        className="bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-lg p-3 shadow-2xl min-w-[200px] max-w-[250px]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <span 
            className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
            style={{ 
              backgroundColor: columnColor + '33',
              color: columnColor,
            }}
          >
            {statusLabels[task.columnId] || task.columnId}
          </span>
          <button 
            onClick={onClose}
            className="text-white/40 hover:text-white/80 text-xs"
          >
            ✕
          </button>
        </div>

        {/* Title */}
        <h3 className="text-white text-sm font-semibold mb-1 leading-tight">
          {task.title}
        </h3>

        {/* Priority */}
        <div className="flex items-center gap-2 mb-2">
          <span 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: priorityColors[task.priority] || '#6B7280' }}
          />
          <span className="text-[10px] text-white/60 capitalize">
            {task.priority}
          </span>
        </div>

        {/* Meta */}
        {task.shortDescription && (
          <p className="text-[10px] text-white/50 mb-2 line-clamp-2">
            {task.shortDescription}
          </p>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="text-[9px] text-white/40">
            📅 {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}

        {/* Labels */}
        {task.labels && task.labels.length > 0 && (
          <div className="flex gap-1 mt-2 flex-wrap">
            {task.labels.slice(0, 3).map(label => (
              <span 
                key={label}
                className="text-[8px] px-1.5 py-0.5 rounded bg-white/5 text-white/50"
              >
                {label}
              </span>
            ))}
          </div>
        )}
      </div>
    </Html>
  )
}