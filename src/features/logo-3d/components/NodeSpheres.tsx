// features/logo-3d/components/NodeSpheres.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { NODE_POSITIONS } from '../data/node-positions'

const NodeGlow = ({ position, index }: { position: [number, number, number]; index: number }) => {
  const sphereRef = useRef<Mesh>(null!)
  const glowRef = useRef<Mesh>(null!)

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const offset = index * 0.7
    const floatY = Math.sin(t * 1.5 + offset) * 0.08
    
    if (sphereRef.current) {
      sphereRef.current.position.y = position[1] + floatY
    }
    if (glowRef.current) {
      glowRef.current.position.y = position[1] + floatY
      glowRef.current.scale.setScalar(1 + Math.sin(t * 2 + offset) * 0.3)
    }
  })

  return (
    <group>
      {/* Outer glow */}
      <mesh ref={glowRef} position={position}>
        <sphereGeometry args={[0.16, 16, 16]} />
        <meshBasicMaterial
          color="#a78bfa"
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Core sphere */}
      <mesh ref={sphereRef} position={position}>
        <sphereGeometry args={[0.07, 16, 16]} />
        <meshStandardMaterial
          color="#c4b5fd"
          emissive="#8b5cf6"
          emissiveIntensity={0.6}
        />
      </mesh>
    </group>
  )
}

export const NodeSpheres = () => {
  return (
    <group>
      {NODE_POSITIONS.map((pos, i) => (
        <NodeGlow key={i} position={pos} index={i} />
      ))}
    </group>
  )
}