// features/logo-3d/components/ParkingNode.tsx
import { useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import type { Mesh } from 'three'
import type { Task } from '@/types/task.types'
import { OrbitalRings, RingData } from './OrbitalRings'

interface ParkingNodeProps {
  position: [number, number, number]
  columnId: string
  columnColor: string
  tasks: Task[]
  boardColor: string
}

const priorityColors: Record<string, string> = {
  'urgent': '#EF4444',
  'high': '#F59E0B',
  'medium': '#3B82F6',
  'low': '#6B7280',
}

const statusIcons: Record<string, string> = {
  'todo': '○',
  'in-progress': '◐',
  'done': '●',
  'backlog': '◌',
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
  const [showPanel, setShowPanel] = useState(false)
  
  const taskCount = tasks.length
  const hasUrgent = tasks.some(t => t.priority === 'urgent')


  const ringData: RingData[] = useMemo(() => 
    tasks.map(task => ({
        id: task.id,
        color: task.priority === 'urgent' ? '#EF4444' : columnColor,
        isUrgent: task.priority === 'urgent',
        speed: 0.3 + (task.id.charCodeAt(task.id.length - 1) % 10) * 0.1,
    })),
    [tasks, columnColor]
  )

  return (
    <group position={position}>
      {/* ===== Core dot - کلیک‌پذیر ===== */}
      <mesh
        ref={dotRef}
        onClick={(e) => {
          e.stopPropagation()
          setShowPanel(!showPanel)
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshBasicMaterial
          color={hasUrgent ? '#EF4444' : hovered ? '#FFFFFF' : columnColor}
          transparent
          opacity={hovered || showPanel ? 1 : 0.75}
          depthWrite={false}
        />
      </mesh>

      <OrbitalRings
        rings={ringData}
        baseRadius={0.08}
        gap={0.04}
        thickness={0.005}
        baseOpacity={0.3}
        active={hovered || showPanel}
        segments={24}
      />


      {/* ===== Glow ===== */}
      {(hovered || showPanel) && (
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshBasicMaterial
            color={columnColor}
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* ===== Label کوچیک پایین dot ===== */}
      <Html 
        position={[0, -0.12, 0]} 
        center 
        distanceFactor={8} 
        occlude={false} 
        style={{ pointerEvents: 'none' }}
      >
        <span 
          className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ 
            backgroundColor: columnColor + '22',
            color: columnColor,
          }}
        >
          {taskCount}
        </span>
      </Html>

      {/* ===== ستون پنل شیشه‌ای ===== */}
      {showPanel && (
        <Html
          position={[0, 0.4, 0]}
          center
          distanceFactor={8}
          occlude={false}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="w-[220px] max-h-[320px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ===== Header ===== */}
            <div 
              className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: columnColor,
                    boxShadow: `0 0 8px ${columnColor}66`,
                  }}
                />
                <div>
                  <span className="text-white text-xs font-semibold capitalize">
                    {columnId.replace('-', ' ')}
                  </span>
                  <span className="text-white/30 text-[10px] ml-2">
                    {taskCount}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowPanel(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-sm leading-none"
              >
                ×
              </button>
            </div>

            {/* ===== Task List ===== */}
            <div className="overflow-y-auto max-h-[260px] px-3 py-2 space-y-1.5 scrollbar-thin">
              {taskCount === 0 ? (
                <div className="text-center py-6">
                  <span className="text-white/20 text-[11px]">No tasks yet</span>
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="group rounded-xl px-3 py-2.5 transition-all cursor-default"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                    }}
                  >
                    {/* Row 1: Status icon + Title */}
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: columnColor }}>
                        {statusIcons[task.columnId] || '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/85 text-[11px] font-medium leading-snug truncate">
                          {task.title}
                        </p>
                      </div>
                      {task.priority && (
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                          style={{ 
                            backgroundColor: priorityColors[task.priority],
                            boxShadow: task.priority === 'urgent' 
                              ? `0 0 6px ${priorityColors[task.priority]}` 
                              : 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* Row 2: Meta info */}
                    <div className="flex items-center gap-3 mt-1.5 ml-4">
                      {task.dueDate && (
                        <span className="text-[9px] text-white/30">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span className="text-[9px] text-white/25">
                          {task.estimatedHours}h
                        </span>
                      )}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex gap-1">
                          {task.labels.slice(0, 3).map(label => (
                            <span 
                              key={label}
                              className="text-[7px] px-1 py-0.5 rounded text-white/25 bg-white/5"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ===== Footer ===== */}
            <div 
              className="px-4 py-2 text-center"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span className="text-[9px] text-white/20">
                {taskCount} task{taskCount !== 1 ? 's' : ''} in {columnId}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// ============================================================
// Ringlet - visual only
// ============================================================
interface RingletProps {
  index: number
  color: string
  hovered: boolean
}

const Ringlet = ({ index, color, hovered }: RingletProps) => {
  const ref = useRef<Mesh>(null!)
  const radius = 0.08 + index * 0.04
  
  // انیمیشن فقط visual
  // useFrame حذف شده چون چرخش اتومات نمی‌خوایم
  
  return (
    <mesh ref={ref} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={hovered ? 0.85 : 0.35}
        depthWrite={false}
      />
    </mesh>
  )
}