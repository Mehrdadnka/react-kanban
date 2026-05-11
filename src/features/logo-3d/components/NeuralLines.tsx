// features/logo-3d/components/NeuralLines.tsx
import { useMemo } from 'react'
// @ts-ignore - drei Line types conflict with three 0.127
import { Line } from '@react-three/drei'
import { NODE_POSITIONS, NODE_CONNECTIONS } from '../data/node-positions'

export const NeuralLines = () => {
  const lines = useMemo(() => {
    return NODE_CONNECTIONS.map(([from, to]) => ({
      points: [NODE_POSITIONS[from], NODE_POSITIONS[to]] as [number, number, number][],
    }))
  }, [])

  return (
    <group>
      {lines.map((line, i) => (
        <Line
          key={i}
          points={line.points}
          color="#6366f1"
          lineWidth={1}
          transparent
          opacity={0.25}
        />
      ))}
    </group>
  )
}