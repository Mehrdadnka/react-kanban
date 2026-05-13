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
  


  const baseSize = 1.2

  return (
    <group
      position={[0, 0, 0]}
      rotation={board.rotation}
    >
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