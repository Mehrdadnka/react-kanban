// features/logo-3d/components/LogoScene.tsx
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { DiamondCore } from './DiamondCore'
// import { NodeSpheres } from './NodeSpheres'
// import { NeuralLines } from './NeuralLines'
import { SynapticSparks } from './SynapticSparks'
import { FloatingOrbs } from './FloatingOrbs'
import { useLogoEventBridge } from '@/stores/logo/events/logo-event-bridge'
import { useLogoAutoPilot } from '@/stores/logo/events/logo-auto-pilot'

export const LogoScene = () => {
  useLogoEventBridge()
  useLogoAutoPilot()

  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 45 }}
      style={{ background: '#0f172a00' }}
    >
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={0.8} />
      <pointLight position={[-5, -5, -5]} intensity={0.3} color="#6366f1" />
      <pointLight position={[0, -5, 5]} intensity={0.2} color="#8b5cf6" />

      <DiamondCore />
      {/* <NeuralLines /> */}
      {/* <NodeSpheres /> */}
      <SynapticSparks />
      <FloatingOrbs />

      <OrbitControls 
        enableZoom={true}
        enablePan={true}
        minDistance={3}
        maxDistance={15}
        autoRotate
        autoRotateSpeed={0.3}
      />
    </Canvas>
  )
}