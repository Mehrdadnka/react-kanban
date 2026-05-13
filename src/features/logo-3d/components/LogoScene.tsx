// features/logo-3d/components/LogoScene.tsx
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useRef, useState, useEffect } from 'react'
import * as THREE from 'three'
import { DiamondCore } from './DiamondCore'
import { SynapticSparks } from './SynapticSparks'
import { FloatingOrbs } from './FloatingOrbs'
import { useLogoEventBridge } from '@/stores/logo/events/logo-event-bridge'
import { useLogoAutoPilot } from '@/stores/logo/events/logo-auto-pilot'

interface LogoSceneProps {
  children?: React.ReactNode
  shipRef?: React.RefObject<THREE.Group>
}

const ChaseCamera = ({ shipRef, enabled }: { shipRef: React.RefObject<THREE.Group>, enabled: boolean }) => {
  const { camera } = useThree()
  
  useFrame(() => {
    if (!enabled) return
    if (!shipRef.current) return
    
    const shipPos = shipRef.current.position
    const offsetDistance = 2
    const heightOffset = 0.4
    
    const forward = new THREE.Vector3(0, 0, 1)
    forward.applyQuaternion(shipRef.current.quaternion)
    
    const targetPosition = shipPos.clone().sub(forward.clone().multiplyScalar(offsetDistance))
    targetPosition.y += heightOffset
    
    camera.position.lerp(targetPosition, 0.05)
    
    camera.lookAt(shipPos)
  })
  
  return null
}

export const LogoScene = ({ children, shipRef }: LogoSceneProps) => {
  useLogoEventBridge()
  useLogoAutoPilot()
  
  const [chaseMode, setChaseMode] = useState(true) 
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'c' || e.key === 'C') {
        setChaseMode(prev => !prev)
        console.log(`Camera mode: ${!chaseMode ? 'Chase' : 'Orbit'}`)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [chaseMode])

  return (
    <Canvas
      camera={{ position: [0, 10, 30], fov: 75 }}
      gl={{ 
        powerPreference: "low-power",
        antialias: false,
      }}
      style={{ background: '#0f172a00' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[15, 15, 15]} intensity={0.8} />
      <pointLight position={[-15, -8, -15]} intensity={0.3} color="#6366f1" />
      <pointLight position={[0, -8, 20]} intensity={0.2} color="#8b5cf6" />

      <DiamondCore />
      <SynapticSparks />
      <FloatingOrbs />
      
      {children}
      
      {shipRef && <ChaseCamera shipRef={shipRef} enabled={chaseMode} />}
      
      {!chaseMode && (
        <OrbitControls 
          enableZoom={true}
          enablePan={true}
          minDistance={5}
          maxDistance={80}
          target={[0, 0, 0]}
        />
      )}
    </Canvas>
  )
}