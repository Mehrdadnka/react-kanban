// SpaceshipBody.tsx
import { useRef } from 'react'
import * as THREE from 'three'

export const SpaceshipBody = () => {
  return (
    <group>
      {/* بدنه اصلی - یه بشقاب‌پرنده ساده و قشنگ */}
      <mesh castShadow position={[0, 0, 0]}>
        <sphereGeometry args={[0.5, 24, 24]} />
        <meshStandardMaterial 
          color="#6c8cbf" 
          metalness={0.8} 
          roughness={0.2}
          emissive="#1a2a4a"
          emissiveIntensity={0.3}
        />
      </mesh>
      
      {/* نیم‌کره پایینی */}
      <mesh castShadow position={[0, -0.3, 0]}>
        <sphereGeometry args={[0.4, 24, 24]} />
        <meshStandardMaterial 
          color="#4a6a9a" 
          metalness={0.7} 
          roughness={0.3}
        />
      </mesh>
      
      {/* گنبد شیشه‌ای بالا */}
      <mesh castShadow position={[0, 0.25, 0]}>
        <sphereGeometry args={[0.25, 24, 24]} />
        <meshStandardMaterial 
          color="#88bbff" 
          metalness={0.9} 
          roughness={0.1}
          emissive="#2288cc"
          emissiveIntensity={0.2}
          transparent
          opacity={0.7}
        />
      </mesh>
      
      {/* جزئیات روی بدنه - حلقه استوایی */}
      <mesh position={[0, 0, 0]}>
        <torusGeometry args={[0.52, 0.04, 16, 48]} />
        <meshStandardMaterial color="#ffcc66" metalness={0.9} roughness={0.1} />
      </mesh>
    </group>
  )
}