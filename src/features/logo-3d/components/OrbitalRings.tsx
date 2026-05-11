// features/logo-3d/components/OrbitalRings.tsx
import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Mesh } from 'three'

// ============================================================
// Types
// ============================================================
export interface RingData {
  id: string
  color: string
  isUrgent?: boolean
  /** سرعت چرخش منحصر بفرد */
  speed?: number
  /** tilt اولیه */
  tilt?: [number, number, number]
}

interface OrbitalRingsProps {
  rings: RingData[]
  /** radius پایه برای داخلی‌ترین حلقه */
  baseRadius?: number
  /** فاصله بین حلقه‌ها */
  gap?: number
  /** tube radius */
  thickness?: number
  /** opacity پایه */
  baseOpacity?: number
  /** active (hover) */
  active?: boolean
  /** کیفیت geometry */
  segments?: number
}

// ============================================================
// Single Ring با انیمیشن orbital
// ============================================================
interface RingProps {
  ring: RingData
  index: number
  total: number
  baseRadius: number
  gap: number
  thickness: number
  baseOpacity: number
  active: boolean
  segments: number
}

const OrbitalRing = ({
  ring,
  index,
  total,
  baseRadius,
  gap,
  thickness,
  baseOpacity,
  active,
  segments,
}: RingProps) => {
  const groupRef = useRef<THREE.Group>(null!)
  const ringRef = useRef<Mesh>(null!)
  
  // radius بر اساس index
  const radius = baseRadius + index * gap
  
  // محاسبه tilt تصادفی ولی ثابت (deterministic)
  const tilt = useMemo(() => {
    return ring.tilt || [
      (Math.sin(ring.id.charCodeAt(0) * 0.7) * 0.6),
      (Math.cos(ring.id.charCodeAt(1) * 0.5) * 0.6),
      (Math.sin(ring.id.charCodeAt(2) * 0.3) * 0.3),
    ]
  }, [ring.id, ring.tilt])
  
  // سرعت چرخش رو orbit های مختلف
  const speed = ring.speed || (0.4 + index * 0.15 + (ring.id.charCodeAt(0) % 10) * 0.05)
  
  // رنگ با glow برای urgent
  const color = useMemo(() => {
    if (ring.isUrgent) return new THREE.Color('#EF4444')
    return new THREE.Color(ring.color)
  }, [ring.color, ring.isUrgent])
  
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const dt = delta * 60
    
    // چرخش orbital - هر حلقه رو محور خودش با سرعت متفاوت
    groupRef.current.rotation.x += speed * dt * 0.008 * (index % 2 === 0 ? 1 : -0.7)
    groupRef.current.rotation.y += speed * dt * 0.012 * (index % 3 === 0 ? 1 : -0.8)
    groupRef.current.rotation.z += speed * dt * 0.005 * (index % 2 === 0 ? -1 : 0.6)
    
    // پالس ملایم برای urgent
    if (ring.isUrgent && ringRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.006 + index) * 0.15
      ringRef.current.scale.setScalar(pulse)
    }
  })
  
  return (
    <group ref={groupRef} rotation={tilt as [number, number, number]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[radius, thickness, 16, segments]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? 0.5 : 0.15}
          metalness={0.05}
          roughness={0.25}
          transparent
          opacity={active ? baseOpacity + 0.25 : baseOpacity}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
          reflectivity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {/* Glow ring برای urgent */}
      {ring.isUrgent && active && (
        <mesh>
          <torusGeometry args={[radius, thickness * 2.5, 8, segments]} />
          <meshBasicMaterial
            color="#EF4444"
            transparent
            opacity={0.12}
            depthWrite={false}
          />
        </mesh>
      )}
    </group>
  )
}

// ============================================================
// OrbitalRings Container
// ============================================================
export const OrbitalRings = ({
  rings,
  baseRadius = 0.08,
  gap = 0.04,
  thickness = 0.005,
  baseOpacity = 0.3,
  active = false,
  segments = 24,
}: OrbitalRingsProps) => {
  // محدودیت نمایش
  const visibleRings = active ? rings : rings.slice(0, Math.min(3, rings.length))
  
  if (rings.length === 0) return null
  
  return (
    <group>
      {visibleRings.map((ring, i) => (
        <OrbitalRing
          key={ring.id}
          ring={ring}
          index={i}
          total={rings.length}
          baseRadius={baseRadius}
          gap={gap}
          thickness={thickness}
          baseOpacity={baseOpacity}
          active={active}
          segments={segments}
        />
      ))}
    </group>
  )
}