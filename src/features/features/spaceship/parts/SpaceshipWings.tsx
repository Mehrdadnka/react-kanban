// SpaceshipWings.tsx
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export const SpaceshipWings = () => {
  const leftWingRef = useRef<THREE.Group>(null!)
  const rightWingRef = useRef<THREE.Group>(null!)
  const [wingAngle, setWingAngle] = useState(0) // 0 = بسته, 1 = باز
  const [targetAngle, setTargetAngle] = useState(0)
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'KeyE') {
        e.preventDefault()
        setTargetAngle(prev => prev === 0 ? 1 : 0)
      }
    }
    
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])
  
  useFrame(() => {
    if (!leftWingRef.current || !rightWingRef.current) return
    
    // انیمیشن نرم باز و بسته شدن بال
    const newAngle = wingAngle + (targetAngle - wingAngle) * 0.15
    setWingAngle(newAngle)
    
    // زاویه نهایی: بسته = 0 درجه، باز = 60 درجه
    const angle = newAngle * Math.PI / 3 // 60 درجه
    const upOffset = Math.sin(angle) * 0.3
    const forwardOffset = Math.cos(angle) * 0.2
    
    leftWingRef.current.rotation.x = angle
    leftWingRef.current.position.y = upOffset
    leftWingRef.current.position.z = -forwardOffset
    
    rightWingRef.current.rotation.x = angle
    rightWingRef.current.position.y = upOffset
    rightWingRef.current.position.z = -forwardOffset
  })
  
  return (
    <group>
      {/* بال چپ */}
      <group ref={leftWingRef} position={[-0.6, 0, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.05, 0.8]} />
          <meshStandardMaterial color="#5a7ab5" metalness={0.7} roughness={0.3} />
        </mesh>
        {/* جزئیات بال */}
        <mesh position={[0.1, 0, 0.3]}>
          <boxGeometry args={[0.1, 0.02, 0.15]} />
          <meshStandardMaterial color="#ffcc66" metalness={0.9} />
        </mesh>
        {/* چراغ انتهای بال */}
        <pointLight position={[0, 0.05, 0.45]} color="#00aaff" intensity={0.5} distance={2} />
        <mesh position={[0, 0.05, 0.45]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* بال راست */}
      <group ref={rightWingRef} position={[0.6, 0, -0.2]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.05, 0.8]} />
          <meshStandardMaterial color="#5a7ab5" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[-0.1, 0, 0.3]}>
          <boxGeometry args={[0.1, 0.02, 0.15]} />
          <meshStandardMaterial color="#ffcc66" metalness={0.9} />
        </mesh>
        <pointLight position={[0, 0.05, 0.45]} color="#00aaff" intensity={0.5} distance={2} />
        <mesh position={[0, 0.05, 0.45]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshStandardMaterial color="#00aaff" emissive="#00aaff" emissiveIntensity={0.5} />
        </mesh>
      </group>
      
      {/* موتور اصلی پشت */}
      <group position={[0, -0.2, -0.7]}>
        {/* بدنه موتور */}
        <mesh castShadow>
          <cylinderGeometry args={[0.35, 0.45, 0.5, 12]} />
          <meshStandardMaterial color="#aa5533" metalness={0.8} roughness={0.2} emissive="#ff4422" emissiveIntensity={0.4} />
        </mesh>
        
        {/* نازل موتور */}
        <mesh position={[0, 0, -0.3]}>
          <torusGeometry args={[0.4, 0.05, 12, 24]} />
          <meshStandardMaterial color="#ff8844" metalness={0.9} />
        </mesh>
        
        {/* شعله موتور - پویا */}
        <mesh position={[0, 0, -0.55]}>
          <coneGeometry args={[0.25, 0.35, 8]} />
          <meshStandardMaterial color="#ff4400" emissive="#ff6600" emissiveIntensity={0.8} transparent opacity={0.7} />
        </mesh>
        
        {/* نور موتور */}
        <pointLight position={[0, 0, -0.6]} color="#ff4400" intensity={1} distance={4} />
      </group>
      
      {/* موتورهای جانبی کوچک */}
      <mesh position={[-0.4, -0.15, -0.55]}>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#aa5533" metalness={0.7} emissive="#ff4422" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.4, -0.15, -0.55]}>
        <cylinderGeometry args={[0.12, 0.15, 0.3, 8]} />
        <meshStandardMaterial color="#aa5533" metalness={0.7} emissive="#ff4422" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}