import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { useLogoStore } from '@/stores/logo/logo-store'
import { TaskCard } from './TaskCard'

// ──── Types ────
type OrbState = 'moving' | 'settled' | 'fading'

type OrbData = {
  id: string
  type: 'task' | 'xp' | 'achievement'
  title: string
  subtitle?: string
  icon: string
  color?: string
  targetPos: [number, number, number]
  startPos: [number, number, number]
}

// ──── Colors ────
const orbColors: Record<string, string> = {
  task: '#3b82f6',
  xp: '#8b5cf6',
  achievement: '#f59e0b',
}

// ============================================================
const FloatingOrb = ({ data }: { data: OrbData }) => {
  const sphereRef = useRef<Mesh>(null!)
  const [state, setState] = useState<OrbState>('moving')
  const [progress, setProgress] = useState(0)
  const [cardOpacity, setCardOpacity] = useState(0)
  const [sphereOpacity, setSphereOpacity] = useState(1)
  const settleTimer = useRef(0)
  const finalPos = useRef<[number, number, number]>([0, 0, 0])

  useFrame((_, delta) => {
    if (!sphereRef.current) return

    if (state === 'moving') {
      const newProgress = Math.min(1, progress + delta * 0.8)
      setProgress(newProgress)

      const x = data.startPos[0] + (data.targetPos[0] - data.startPos[0]) * newProgress
      const y = data.startPos[1] + (data.targetPos[1] - data.startPos[1]) * newProgress
      const z = data.startPos[2] + (data.targetPos[2] - data.startPos[2]) * newProgress
      sphereRef.current.position.set(x, y, z)

      const scale = 0.6 + (1 - newProgress) * 0.4
      sphereRef.current.scale.setScalar(scale)

      if (newProgress >= 1) {
        finalPos.current = [data.targetPos[0], data.targetPos[1], data.targetPos[2]]
        sphereRef.current.position.set(...finalPos.current)
        setState('settled')
        setCardOpacity(1)
      }
    }

    if (state === 'settled') {
      sphereRef.current.position.set(...finalPos.current)
      settleTimer.current += delta
      if (settleTimer.current > 4) {
        setState('fading')
      }
    }

    if (state === 'fading') {
      setCardOpacity((prev) => Math.max(0, prev - delta * 1.2))
      setSphereOpacity((prev) => Math.max(0, prev - delta * 1.2))
    }
  })

  if (sphereOpacity <= 0.01 && state === 'fading') return null

  return (
    <group>
      {/* ===== Orb Sphere ===== */}
      <mesh ref={sphereRef} position={data.startPos}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial
          color={data.color || orbColors[data.type]}
          transparent
          opacity={sphereOpacity}
          depthWrite={false}
        />
      </mesh>

      {/* ===== TaskCard ===== */}
      {state !== 'moving' && cardOpacity > 0.01 && (
        <Html
          position={[data.targetPos[0], data.targetPos[1] - 0.25, data.targetPos[2]]}
          center
          distanceFactor={6}
          occlude={false}
          style={{ pointerEvents: 'none' }}
        >
          <TaskCard
            title={data.title}
            subtitle={data.subtitle}
            icon={data.icon}
            color={data.color || orbColors[data.type]}
            variant={data.type}
            opacity={cardOpacity}
          />
        </Html>
      )}
    </group>
  )
}

// ============================================================
// Container
// ============================================================
export const FloatingOrbs = () => {
  const [orbs, setOrbs] = useState<OrbData[]>([])

  useEffect(() => {
    const unsub = useLogoStore.subscribe((state) => {
      setOrbs([...state.orbs] as any)
    })
    setOrbs([...useLogoStore.getState().orbs] as any)
    return unsub
  }, [])

  return (
    <group>
      {orbs.map((orb) => (
        <FloatingOrb key={orb.id} data={orb} />
      ))}
    </group>
  )
}