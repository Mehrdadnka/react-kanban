// features/logo-3d/components/SynapticSparks.tsx

import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import { useLogoStore } from '@/stores/logo/logo-store'
import { useBoardStore } from '@/stores/board.store'
import { calculateBoardLayout, type BoardCubeData } from '../data/board-layout'
import type { Spark } from '@/stores/logo/logo-store.types'
import { SPARK_ORIGIN, DIAMOND_VERTEX } from '../data/node-columns'

// ============================================================
// SparkParticle
// ============================================================
const SparkParticle = ({ 
  spark, 
  boardData,
}: { 
  spark: Spark
  boardData: BoardCubeData | undefined
}) => {
  const ref = useRef<Mesh>(null!)
  const progressRef = useRef(0)

  useFrame((_, delta) => {
    if (!ref.current || !boardData) return
    
    progressRef.current += spark.speed * delta * 60
    if (progressRef.current > 1) progressRef.current = 1

    const verts = boardData.polyhedron.vertices
    const boardPos = boardData.position
    const boardScale = boardData.scale
    
    // مبدا
    let fromPos: [number, number, number]
    if (spark.from === SPARK_ORIGIN) {
      fromPos = [0, 0, 0]
    } else if (spark.from >= 0 && spark.from < verts.length) {
      fromPos = verts[spark.from]
    } else {
      fromPos = [0, 0, 0]
    }
    
    // مقصد
    let toPos: [number, number, number]
    if (spark.to === DIAMOND_VERTEX) {
      // به الماس مرکزی
      const worldFrom: [number, number, number] = [
        boardPos[0] + fromPos[0] * boardScale,
        boardPos[1] + fromPos[1] * boardScale,
        boardPos[2] + fromPos[2] * boardScale,
      ]
      ref.current.position.set(
        worldFrom[0] + (0 - worldFrom[0]) * progressRef.current,
        worldFrom[1] + (0 - worldFrom[1]) * progressRef.current,
        worldFrom[2] + (0 - worldFrom[2]) * progressRef.current,
      )
      return
    } else if (spark.to >= 0 && spark.to < verts.length) {
      toPos = verts[spark.to]
    } else {
      toPos = [0, 0, 0]
    }

    const worldFrom: [number, number, number] = [
      boardPos[0] + fromPos[0] * boardScale,
      boardPos[1] + fromPos[1] * boardScale,
      boardPos[2] + fromPos[2] * boardScale,
    ]
    const worldTo: [number, number, number] = [
      boardPos[0] + toPos[0] * boardScale,
      boardPos[1] + toPos[1] * boardScale,
      boardPos[2] + toPos[2] * boardScale,
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
// SynapticSparks Container
// ============================================================
export const SynapticSparks = () => {
  const [sparks, setSparks] = useState<Spark[]>([])
  const [boardLayouts, setBoardLayouts] = useState<Map<string, BoardCubeData>>(new Map())

  useEffect(() => {
    const unsub1 = useLogoStore.subscribe((state) => {
      setSparks([...state.sparks])
    })
    setSparks([...useLogoStore.getState().sparks])

    const updateLayouts = () => {
      const boardStore = useBoardStore.getState()
      const layouts = calculateBoardLayout(
        boardStore.boards.map(b => ({ 
          id: b.id, 
          title: b.title, 
          color: b.color, 
          taskCount: 0,
          columns: ['todo', 'in-progress', 'done'], 
        }))
      )
      const map = new Map<string, BoardCubeData>()
      layouts.forEach(l => map.set(l.id, l))
      setBoardLayouts(map)
    }
    updateLayouts()
    const unsub2 = useBoardStore.subscribe(updateLayouts)

    return () => { unsub1(); unsub2() }
  }, [])

  return (
    <group>
      {sparks.map((spark) => {
        const boardData = boardLayouts.get(spark.boardId)
        return (
          <SparkParticle
            key={spark.id}
            spark={spark}
            boardData={boardData}
          />
        )
      })}
    </group>
  )
}