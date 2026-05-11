// features/logo-3d/components/CoreGlow.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'

export const CoreGlow = () => {
  const glowRef = useRef<Mesh>(null!)

  useFrame(({ clock }) => {
    if (glowRef.current) {
      const t = clock.getElapsedTime()
      const pulse = 1 + Math.sin(t * 1.2) * 0.15
      glowRef.current.scale.setScalar(pulse)
      glowRef.current.material.opacity = 0.08 + Math.sin(t * 1.5) * 0.04
    }
  })

  return (
    <mesh ref={glowRef}>
      <octahedronGeometry args={[2.0, 0]} />
      <meshBasicMaterial
        color="#8b5cf6"
        transparent
        opacity={0.08}
        depthWrite={false}
        side={2 as any} // DoubleSide = 2 in three 0.127
      />
    </mesh>
  )
}