// features/logo-3d/components/FloatingOrbs.tsx
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import type { Mesh } from 'three'
import { MOCK_ORBS } from '../data/mock-orbs'
import { useLogoStore } from '@/stores/logo/logo-store'

// ──── Types ────
type OrbState = 'moving' | 'settled' | 'fading'

type OrbData = {
  id: string
  type: 'task' | 'xp' | 'achievement'
  title: string
  subtitle?: string
  icon: string
  color: string
  targetPos: [number, number, number]
  startPos: [number, number, number]
}

// ──── Styles ────
const orbColors: Record<string, string> = {
  task: '#22c55e',
  xp: '#8b5cf6',
  achievement: '#f59e0b',
}

const cardStyles: Record<string, string> = {
  task: 'bg-green-600/95 border-green-400/20',
  xp: 'bg-purple-600/95 border-purple-400/20',
  achievement: 'bg-amber-500/95 border-amber-300/20',
}


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
        // ⬇️ اینو جا انداخته بودی
        finalPos.current = [data.targetPos[0], data.targetPos[1], data.targetPos[2]]
        sphereRef.current.position.set(...finalPos.current)
        setState('settled')
        setCardOpacity(1)
      }
    }

    if (state === 'settled') {
      // ⬇️ فقط وقتی settled شدی finalPos ست شده
      sphereRef.current.position.set(...finalPos.current)
      settleTimer.current += delta
      if (settleTimer.current > 4) {
        setState('fading')
      }
    }

    if (state === 'fading') {
      // ⬇️ fade نرم‌تر
      setCardOpacity((prev) => Math.max(0, prev - delta * 1.2))
      setSphereOpacity((prev) => Math.max(0, prev - delta * 1.2))
      if (sphereOpacity < 0.05) {
        setSphereOpacity(0)
        setCardOpacity(0)
      }
    }
  })

  if (sphereOpacity <= 0.01 && state === 'fading') return null

  return (
    <group>
      <mesh ref={sphereRef} position={data.startPos}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshBasicMaterial
          color={orbColors[data.type]}
          transparent
          opacity={sphereOpacity}
          depthWrite={false}
        />
      </mesh>

      {state !== 'moving' && cardOpacity > 0.01 && (
        <Html
          position={[data.targetPos[0], data.targetPos[1] - 0.2, data.targetPos[2]]}
          center
          distanceFactor={6}
          occlude={false}
        >
          <div
            className={`
              pointer-events-none select-none
              rounded-lg px-3 py-1.5 shadow-xl border
              min-w-[90px] text-center
              ${cardStyles[data.type]}
            `}
            style={{ opacity: cardOpacity }}
          >
            <div className="flex items-center gap-1 justify-center">
              <span className="text-xs">{data.icon}</span>
              <span className="text-white font-semibold text-[11px]">{data.title}</span>
            </div>
            {data.subtitle && (
              <p className="text-white/60 text-[9px] mt-0.5">{data.subtitle}</p>
            )}
          </div>
        </Html>
      )}
    </group>
  )
}
// ──── Container ────
// فقط بخش Container رو عوض کن
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