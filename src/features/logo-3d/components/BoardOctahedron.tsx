// features/logo-3d/components/BoardOctahedron.tsx
import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import type { Mesh } from 'three'
import type { BoardCubeData } from '../data/board-layout'

interface BoardOctahedronProps {
  board: BoardCubeData
  isActive?: boolean
}

export const BoardOctahedron = ({ board, isActive = false }: BoardOctahedronProps) => {
  const wireRef = useRef<Mesh>(null!)
  const glowRef = useRef<Mesh>(null!)
  
  useFrame((_, delta) => {
    const dt = delta * 60 // normalize to ~60fps
    
    // هر board با سرعت خودش می‌چرخه
    if (wireRef.current) {
      wireRef.current.rotation.x += board.rotationSpeed[0] * dt * 0.01
      wireRef.current.rotation.y += board.rotationSpeed[1] * dt * 0.01
      wireRef.current.rotation.z += board.rotationSpeed[2] * dt * 0.01
    }
    if (glowRef.current) {
      glowRef.current.rotation.x += board.rotationSpeed[0] * dt * 0.007
      glowRef.current.rotation.y += board.rotationSpeed[1] * dt * 0.007
      glowRef.current.rotation.z += board.rotationSpeed[2] * dt * 0.005
    }
  })

  const baseSize = 1.2 // اندازه پایه یک octahedron

  return (
    <group
      position={[0, 0, 0]}  // همه هم‌مرکز
      rotation={board.rotation}  // فقط زاویه اولیه متفاوت
    >
      {/* Solid inner - با رنگ board */}
      <mesh ref={glowRef}>
        <octahedronGeometry args={[baseSize * board.scale * 0.75, 0]} />
        <meshStandardMaterial
          color={board.color}
          emissive={board.color}
          emissiveIntensity={isActive ? 0.7 : 0.35}
          transparent
          opacity={isActive ? 0.65 : 0.35}
          metalness={0.1}
          roughness={0.4}
        />
      </mesh>

      {/* Wireframe outer - خطوط ساختار */}
      <mesh ref={wireRef}>
        <octahedronGeometry args={[baseSize * board.scale, 0]} />
        <meshStandardMaterial
          color={board.color}
          wireframe
          transparent
          opacity={isActive ? 0.5 : 0.2}
          emissive={board.color}
          emissiveIntensity={0.1}
        />
      </mesh>

      {/* Title floating in world space */}
      <Text
        position={[0, baseSize * board.scale + 0.4, 0]}
        fontSize={0.2}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.03}
        outlineColor="#00000088"
        maxWidth={2}
      >
        {board.title.length > 16 ? board.title.slice(0, 16) + '…' : board.title}
      </Text>
    </group>
  )
}