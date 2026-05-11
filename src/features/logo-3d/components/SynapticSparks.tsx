// features/logo-3d/components/SynapticSparks.tsx
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useLogoStore } from '@/stores/logo/logo-store'
import { useBoardStore } from '@/stores/board.store'
import { calculateBoardLayout } from '../data/board-layout'
import type { Spark } from '@/stores/logo/logo-store.types'
import { SPARK_ORIGIN, DIAMOND_VERTEX } from '../data/node-columns'

// vertex positions نسبی (scale=1)
const OCTA_VERTS = (): [number, number, number][] => [
  [0, +1, 0],   // 0: top
  [0, -1, 0],   // 1: bottom
  [+1, 0, 0],   // 2: right (todo)
  [0, 0, +1],   // 3: front (in-progress)
  [-1, 0, 0],   // 4: left (done)
  [0, 0, -1],   // 5: back (backlog)
]

const SparkParticle = ({ 
  spark, 
  boardPosition, 
  boardScale, 
  boardRotation 
}: { 
  spark: Spark
  boardPosition: [number, number, number]
  boardScale: number
  boardRotation: [number, number, number]
}) => {
  const ref = useRef<Mesh>(null!)
  const progressRef = useRef(0)

  useFrame((_, delta) => {
    if (!ref.current) return
    
    progressRef.current += spark.speed * delta * 60
    if (progressRef.current > 1) progressRef.current = 1

    const verts = OCTA_VERTS()
    
    // موقعیت مبدا
    let fromPos: [number, number, number]
    if (spark.from === SPARK_ORIGIN) {
      fromPos = [0, 0, 0]  // مرکز board
    } else {
      fromPos = verts[spark.from] || [0, 0, 0]
    }
    
    // موقعیت مقصد
    let toPos: [number, number, number]
    if (spark.to === DIAMOND_VERTEX) {
      toPos = [0, 0, 0]  // الماس مرکزی (صحنه 0,0,0)
      // مستقیم به مرکز صحنه میرن
      const worldFrom = [
        boardPosition[0] + fromPos[0] * boardScale,
        boardPosition[1] + fromPos[1] * boardScale,
        boardPosition[2] + fromPos[2] * boardScale,
      ]
      ref.current.position.set(
        worldFrom[0] + (0 - worldFrom[0]) * progressRef.current,
        worldFrom[1] + (0 - worldFrom[1]) * progressRef.current,
        worldFrom[2] + (0 - worldFrom[2]) * progressRef.current,
      )
      return
    } else {
      toPos = verts[spark.to] || [0, 0, 0]
    }

    // تبدیل به world space (با scale board)
    const worldFrom: [number, number, number] = [
      boardPosition[0] + fromPos[0] * boardScale,
      boardPosition[1] + fromPos[1] * boardScale,
      boardPosition[2] + fromPos[2] * boardScale,
    ]
    const worldTo: [number, number, number] = [
      boardPosition[0] + toPos[0] * boardScale,
      boardPosition[1] + toPos[1] * boardScale,
      boardPosition[2] + toPos[2] * boardScale,
    ]

    ref.current.position.set(
      worldFrom[0] + (worldTo[0] - worldFrom[0]) * progressRef.current,
      worldFrom[1] + (worldTo[1] - worldFrom[1]) * progressRef.current,
      worldFrom[2] + (worldTo[2] - worldFrom[2]) * progressRef.current,
    )
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.03, 6, 6]} />
      <meshBasicMaterial 
        color={spark.color} 
        transparent 
        opacity={0.9} 
        depthWrite={false} 
      />
    </mesh>
  )
}

// ============================================================
export const SynapticSparks = () => {
  const [sparks, setSparks] = useState<Spark[]>([])
  const [boardLayouts, setBoardLayouts] = useState<Map<string, { 
    position: [number,number,number], 
    scale: number, 
    rotation: [number,number,number] 
  }>>(new Map())

  useEffect(() => {
    const unsub1 = useLogoStore.subscribe((state) => {
      setSparks([...state.sparks])
    })
    setSparks([...useLogoStore.getState().sparks])

    const updateLayouts = () => {
      const boardStore = useBoardStore.getState()
      const layouts = calculateBoardLayout(
        boardStore.boards.map(b => ({ id: b.id, title: b.title, color: b.color, taskCount: 0 }))
      )
      const map = new Map()
      layouts.forEach(l => map.set(l.id, { position: l.position, scale: l.scale, rotation: l.rotation }))
      setBoardLayouts(map)
    }
    updateLayouts()
    const unsub2 = useBoardStore.subscribe(updateLayouts)

    return () => { unsub1(); unsub2() }
  }, [])

  return (
    <group>
      {sparks.map((spark) => {
        const layout = boardLayouts.get(spark.boardId)
        if (!layout) return null
        
        return (
          <SparkParticle
            key={spark.id}
            spark={spark}
            boardPosition={layout.position}
            boardScale={layout.scale}
            boardRotation={layout.rotation}
          />
        )
      })}
    </group>
  )
}