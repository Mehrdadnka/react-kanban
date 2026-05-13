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
  speed?: number
  tilt?: [number, number, number]
  ageInDays?: number
  daysSinceUpdate?: number
  priority?: 'urgent' | 'high' | 'medium' | 'low'
}

interface OrbitalRingsProps {
  rings: RingData[]
  baseRadius?: number
  gap?: number
  thickness?: number
  baseOpacity?: number
  active?: boolean
  segments?: number
}

// ============================================================
// Single Ring orbital
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
  const isSummary = ring.id.endsWith('-summary')

 const computedThickness = useMemo(() => {
    if (!ring.ageInDays) return thickness
    
    const ageBoost = Math.min(ring.ageInDays / 20, 1.5)
    return thickness * (1 + ageBoost)
  }, [ring.ageInDays, thickness])
  
  const computedOpacity = useMemo(() => {
    const priorityBoost = 
      ring.priority === 'urgent' ? 0.3 :
      ring.priority === 'high' ? 0.15 :
      ring.priority === 'low' ? -0.1 : 0
    return Math.min(1, Math.max(0.15, baseOpacity + priorityBoost))
  }, [ring.priority, baseOpacity])
  
  // ──── color ────
  const color = useMemo(() => {
    const c = new THREE.Color(ring.color)
    
    if (ring.ageInDays && ring.ageInDays > 14) {
      const desaturate = Math.min((ring.ageInDays - 14) / 21, 0.4)
      c.lerp(new THREE.Color('#4a4a4a'), desaturate)
    }
    
    return c
  }, [ring.color, ring.ageInDays])
  
  const emissiveIntensity = useMemo(() => {
    if (!ring.daysSinceUpdate) return active ? 0.5 : 0.15
    
    if (ring.daysSinceUpdate < 0.5) return 0.8
    if (ring.daysSinceUpdate < 7) return 0.5
    return 0.2
  }, [ring.daysSinceUpdate, active])  
  const radius = baseRadius + index * gap
  
  const tilt = useMemo(() => {
    return ring.tilt || [
      (Math.sin(ring.id.charCodeAt(0) * 0.7) * 0.6),
      (Math.cos(ring.id.charCodeAt(1) * 0.5) * 0.6),
      (Math.sin(ring.id.charCodeAt(2) * 0.3) * 0.3),
    ]
  }, [ring.id, ring.tilt])
  
  const speed = ring.speed || (0.4 + index * 0.15 + (ring.id.charCodeAt(0) % 10) * 0.05)
  
  useFrame((_, delta) => {
    if (!groupRef.current) return
    const dt = delta * 60
    
    groupRef.current.rotation.x += speed * dt * 0.008 * (index % 2 === 0 ? 1 : -0.7)
    groupRef.current.rotation.y += speed * dt * 0.012 * (index % 3 === 0 ? 1 : -0.8)
    groupRef.current.rotation.z += speed * dt * 0.005 * (index % 2 === 0 ? -1 : 0.6)
    
    if (ring.isUrgent && ringRef.current) {
      const pulse = 1 + Math.sin(Date.now() * 0.006 + index) * 0.15
      ringRef.current.scale.setScalar(pulse)
    }
  })
  
  return (
    <group ref={groupRef} rotation={tilt as [number, number, number]}>
      <mesh ref={ringRef}>
        <torusGeometry args={[radius, isSummary ? thickness * 3 : computedThickness, 16, segments]} />

        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={active ? emissiveIntensity : emissiveIntensity * 0.5}
          metalness={0.05}
          roughness={0.25}
          transparent
          opacity={active ? computedOpacity + 0.25 : computedOpacity}
          clearcoat={0.2}
          clearcoatRoughness={0.3}
          reflectivity={0.3}
          depthWrite={false}
        />
      </mesh>
      
      {ring.isUrgent && active && (
        <mesh>
          <torusGeometry args={[radius, computedThickness * 2.5, 8, segments]} />
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