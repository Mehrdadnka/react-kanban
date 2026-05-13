// features/features/spaceship/Spaceship.tsx
import { forwardRef, useRef, useEffect, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { GALAXY } from '@/features/logo-3d/constants/galaxy.constants'
import { MainEngine } from './engine/MainEngine'
import { EngineGroup } from './engine/EngineGroup'

export const Spaceship = forwardRef<THREE.Group>((props, ref) => {
  const pivotRef = useRef<THREE.Group>(null!)
  const shipRef = useRef<THREE.Group>(null!)
  
  // Velocity in local space
  const velocity = useRef(new THREE.Vector3(0, 0, 0))
  
  // Angular velocities
  const rotationSpeed = useRef({
    yaw: 0,
    pitch: 0,
    roll: 0   
  })
  
  const keys = useRef({
    w: false, s: false, a: false, d: false,
    q: false, e: false,
    ArrowUp: false, ArrowDown: false,
    r: false, f: false
  })

  // Refs for blinking lights
  const blinkLights = useRef<THREE.PointLight[]>([])
  const blinkMeshes = useRef<THREE.Mesh[]>([])
  
  // Blink patterns for each light (phase offset)
  const blinkPhases = [0, 0.5, 0.3, 0.7, 0.2, 0.8]
  const blinkSpeeds = [3, 2, 4, 1.5, 5, 2.5]
  const blinkColors = [
    '#ff0000',
    '#00ff00',
    '#ff00ff',
    '#ffff00',
    '#00ffff',
    '#ff8800', 
  ]
  
  useEffect(() => {
    if (typeof ref === 'function') {
      ref(pivotRef.current)
    } else if (ref) {
      ref.current = pivotRef.current
    }
  }, [ref])
  
  useEffect(() => {
    const handleKey = (e: KeyboardEvent, down: boolean) => {
      // Prevent default for game controls
      if (['w', 's', 'a', 'd', 'q', 'e', 'r', 'f', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
        e.preventDefault()
      }
      
      switch(e.key) {
        case 'w': keys.current.w = down; break
        case 's': keys.current.s = down; break
        case 'a': keys.current.a = down; break
        case 'd': keys.current.d = down; break
        case 'q': keys.current.q = down; break
        case 'e': keys.current.e = down; break
        case 'ArrowUp': keys.current.ArrowUp = down; break
        case 'ArrowDown': keys.current.ArrowDown = down; break
        case 'r': keys.current.r = down; break
        case 'f': keys.current.f = down; break
      }
    }
    
    window.addEventListener('keydown', (e) => handleKey(e, true))
    window.addEventListener('keyup', (e) => handleKey(e, false))
    return () => {
      window.removeEventListener('keydown', (e) => handleKey(e, true))
      window.removeEventListener('keyup', (e) => handleKey(e, false))
    }
  }, [])
  const [isThrustActive, setIsThrustActive] = useState(false)

  useFrame((state) => {
    if (!pivotRef.current || !shipRef.current) return
    setIsThrustActive(keys.current.w);
    const time = state.clock.elapsedTime
    
    // Update blinking lights
    blinkLights.current.forEach((light, index) => {
      if (light) {
        const blinkValue = Math.sin(time * blinkSpeeds[index] * Math.PI * 2 + blinkPhases[index] * Math.PI * 2)
        // Convert sine wave (-1 to 1) to pulsing (0.2 to 2.0)
        const intensity = 0.3 + (blinkValue + 1) * 0.85
        light.intensity = intensity
        
        // Also update the mesh glow
        if (blinkMeshes.current[index]) {
          blinkMeshes.current[index].material.emissiveIntensity = intensity * 0.5
          blinkMeshes.current[index].material.opacity = 0.3 + (blinkValue + 1) * 0.35
        }
      }
    })
    
    const accel = GALAXY.SHIP_ACCELERATION || 0.02
    const damping = GALAXY.SHIP_DAMPING || 0.95
    const rotAccel = 0.03
    const rotDamping = 0.92
    const maxSpeed = 0.1
    const maxRotSpeed = 0.01
    
    // ========== ROTATION CONTROLS ==========
    
    // Yaw - A/D keys (rotate around Y axis)
    if (keys.current.a) rotationSpeed.current.yaw += rotAccel
    if (keys.current.d) rotationSpeed.current.yaw -= rotAccel
    
    // Roll - Q/E keys (bank like airplane)
    if (keys.current.q) rotationSpeed.current.roll += rotAccel * 0.8
    if (keys.current.e) rotationSpeed.current.roll -= rotAccel * 0.8
    
    // Pitch - R/F keys (nose up/down)
    if (keys.current.r) rotationSpeed.current.pitch -= rotAccel * 0.6
    if (keys.current.f) rotationSpeed.current.pitch += rotAccel * 0.6
    
    // Arrow Up/Down - Vertical movement
    const verticalSpeed = 0.01
    if (keys.current.ArrowUp) velocity.current.y += verticalSpeed
    if (keys.current.ArrowDown) velocity.current.y -= verticalSpeed
    
    // Apply rotation damping
    rotationSpeed.current.yaw *= rotDamping
    rotationSpeed.current.pitch *= rotDamping
    rotationSpeed.current.roll *= rotDamping
    
    // Clamp rotation speeds
    rotationSpeed.current.yaw = THREE.MathUtils.clamp(rotationSpeed.current.yaw, -maxRotSpeed, maxRotSpeed)
    rotationSpeed.current.pitch = THREE.MathUtils.clamp(rotationSpeed.current.pitch, -maxRotSpeed, maxRotSpeed)
    rotationSpeed.current.roll = THREE.MathUtils.clamp(rotationSpeed.current.roll, -maxRotSpeed, maxRotSpeed)
    
    // Apply rotations to pivot
    pivotRef.current.rotateY(rotationSpeed.current.yaw)
    pivotRef.current.rotateX(rotationSpeed.current.pitch)
    pivotRef.current.rotateZ(rotationSpeed.current.roll)
    
    // ========== FORWARD/BACKWARD MOVEMENT ==========
    
    // Get forward direction from ship's local Z axis
    const forward = new THREE.Vector3(0, 0, 0.1)
    forward.applyQuaternion(pivotRef.current.quaternion)
    
    // W/S - forward/backward in ship's facing direction
    if (keys.current.w) {
      velocity.current.add(forward.clone().multiplyScalar(accel))
    }
    if (keys.current.s) {
      velocity.current.add(forward.clone().multiplyScalar(-accel * 0.5))
    }
    
    // Apply velocity damping
    velocity.current.multiplyScalar(damping)
    
    // Clamp speed
    const speed = velocity.current.length()
    if (speed > maxSpeed) {
      velocity.current.normalize().multiplyScalar(maxSpeed)
    }
    
    // Move pivot by velocity
    pivotRef.current.position.add(velocity.current)
    
    // ========== AUTO-BANK ON TURN ==========
    // When yawing, automatically apply some roll for realistic banking
    const autoRoll = rotationSpeed.current.yaw * 0.3
    shipRef.current.rotation.z += (autoRoll - shipRef.current.rotation.z) * 0.1
    
    // ========== GALAXY BOUNDARY ==========
    const galaxyRadius = GALAXY.RADIUS || 30
    const pos = pivotRef.current.position
    const distanceFromCenter = Math.sqrt(pos.x * pos.x + pos.z * pos.z)
    
    if (distanceFromCenter > galaxyRadius) {
      const angle = Math.atan2(pos.z, pos.x)
      pivotRef.current.position.x = Math.cos(angle) * galaxyRadius
      pivotRef.current.position.z = Math.sin(angle) * galaxyRadius
      velocity.current.x *= 0.5
      velocity.current.z *= 0.5
    }
    
    // Y boundary
    pivotRef.current.position.y = Math.max(-10, Math.min(10, pivotRef.current.position.y))
    
    // ========== VISUAL THRUST EFFECT ==========
    // Update thruster visibility based on forward input
    if (shipRef.current) {
      const thrusters = shipRef.current.children.filter(child => 
        child.name === 'thruster'
      )
      thrusters.forEach(thruster => {
        thruster.visible = keys.current.w
      })
    }
  })
  
  return (
    <group ref={pivotRef} position={[0, 0, 15]}>
      {/* Ship group - rotates for visual effects (banking) */}
      <group 
        ref={shipRef}
        scale={[GALAXY.SHIP_SCALE, GALAXY.SHIP_SCALE, GALAXY.SHIP_SCALE]}
      >
        {/* بدنه اصلی - کابین خلبان */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
          <meshStandardMaterial 
            color="#e8e8e8" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
        
        {/* شیشه کابین */}
        <mesh position={[0, 0.35, 0.1]} rotation={[0, 0, 0]}>
          <sphereGeometry args={[0.42, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
          <meshStandardMaterial 
            color="#88ccff" 
            metalness={0.1} 
            roughness={0.1}
            transparent
            opacity={0.7}
            emissive="#4488ff"
            emissiveIntensity={0.3}
          />
        </mesh>
        
        {/* بدنه کشیده عقب */}
        <mesh position={[0, 0, -1.2]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.6, 0.4, 2.2]} />
          <meshStandardMaterial 
            color="#d0d0d0" 
            metalness={0.7} 
            roughness={0.3}
          />
        </mesh>
        
        {/* دماغه جلو */}
        <mesh position={[0, 0, 0.5]} rotation={[1.5, 0, 0]}>
          <coneGeometry args={[0.35, 1.5, 8, 8]} />
          <meshStandardMaterial 
            color="#f0f0f0" 
            metalness={0.6} 
            roughness={0.25}
          />
        </mesh>
        
        {/* بال چپ */}
        <group position={[0, -0.1, -0.3]}>
          <mesh rotation={[0, 0, 0]} position={[-0.8, 0, 0]}>
            <boxGeometry args={[1.2, 0.08, 1.8]} />
            <meshStandardMaterial 
              color="#c0c0c0" 
              metalness={0.9} 
              roughness={0.15}
            />
          </mesh>
          {/* نوک بال چپ */}
          <mesh position={[-1.5, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.06, 1.2]} />
            <meshStandardMaterial 
              color="#ff4444" 
              metalness={0.3} 
              roughness={0.4}
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
        
        {/* بال راست */}
        <group position={[0, -0.1, -0.3]}>
          <mesh rotation={[0, 0, 0]} position={[0.8, 0, 0]}>
            <boxGeometry args={[1.2, 0.08, 1.8]} />
            <meshStandardMaterial 
              color="#c0c0c0" 
              metalness={0.9} 
              roughness={0.15}
            />
          </mesh>
          {/* نوک بال راست */}
          <mesh position={[1.5, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.3, 0.06, 1.2]} />
            <meshStandardMaterial 
              color="#ff4444" 
              metalness={0.3} 
              roughness={0.4}
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
        
 

        <EngineGroup position={[-0.55,-0.05,-1.8]} scale={0.15} isThrustActive={isThrustActive} />
        <EngineGroup position={[0.55,-0.05,-1.8]} scale={0.15} isThrustActive={isThrustActive} />
        <MainEngine position={[0,0,-2.2]} scale={0.14} isThrustActive={isThrustActive} />
        
        {/* بالچه‌های عمودی عقب */}
        <mesh position={[0, 0.5, -1.8]} rotation={[0, 0, 0]}>
          <boxGeometry args={[0.08, 0.8, 0.6]} />
          <meshStandardMaterial 
            color="#b0b0b0" 
            metalness={0.8} 
            roughness={0.2}
          />
        </mesh>
        
        {/* ========== چراغ‌های رنگی چشمک‌زن ========== */}
        
        {/* چراغ قرمز - بال چپ */}
        <mesh 
          ref={(mesh) => { blinkMeshes.current[0] = mesh! }}
          position={[-1.6, -0.1, -0.3]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#ff0000"
            emissive="#ff0000"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight
          ref={(light) => { blinkLights.current[0] = light! }}
          position={[-1.6, -0.1, -0.3]}
          color="#ff0000"
          intensity={1}
          distance={2}
        />
        
        {/* چراغ سبز - بال راست */}
        <mesh 
          ref={(mesh) => { blinkMeshes.current[1] = mesh! }}
          position={[1.6, -0.1, -0.3]}
        >
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial 
            color="#00ff00"
            emissive="#00ff00"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight
          ref={(light) => { blinkLights.current[1] = light! }}
          position={[1.6, -0.1, -0.3]}
          color="#00ff00"
          intensity={1}
          distance={2}
        />
        
        {/* چراغ بنفش - زیر بدنه */}
        <mesh 
          ref={(mesh) => { blinkMeshes.current[2] = mesh! }}
          position={[0, -0.3, 0]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#ff00ff"
            emissive="#ff00ff"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight
          ref={(light) => { blinkLights.current[2] = light! }}
          position={[0, -0.3, 0]}
          color="#ff00ff"
          intensity={1}
          distance={2.5}
        />
        
        {/* چراغ زرد - انتهای عقب */}
        <mesh 
          ref={(mesh) => { blinkMeshes.current[3] = mesh! }}
          position={[0, 0.2, -2.7]}
        >
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial 
            color="#ffff00"
            emissive="#ffff00"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight
          ref={(light) => { blinkLights.current[3] = light! }}
          position={[0, 0.2, -2.7]}
          color="#ffff00"
          intensity={1}
          distance={3}
        />
        
        {/* چراغ فیروزه‌ای - نوک دماغه */}
        <mesh 
          ref={(mesh) => { blinkMeshes.current[4] = mesh! }}
          position={[0, 0.1, 1.2]}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial 
            color="#00ffff"
            emissive="#00ffff"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight
          ref={(light) => { blinkLights.current[4] = light! }}
          position={[0, 0.1, 1.2]}
          color="#00ffff"
          intensity={1}
          distance={2}
        />
        
        {/* چراغ نارنجی - بالای بالچه عقب */}
        <mesh 
          ref={(mesh) => { blinkMeshes.current[5] = mesh! }}
          position={[0, 0.95, -1.8]}
        >
          <sphereGeometry args={[0.07, 8, 8]} />
          <meshStandardMaterial 
            color="#ff8800"
            emissive="#ff8800"
            emissiveIntensity={1}
            transparent
            opacity={0.7}
          />
        </mesh>
        <pointLight
          ref={(light) => { blinkLights.current[5] = light! }}
          position={[0, 0.95, -1.8]}
          color="#ff8800"
          intensity={1}
          distance={2}
        />
        
        {/* نور ناوبری */}
        <pointLight 
          position={[0, 0, -2.2]} 
          color="#ff4400" 
          intensity={keys.current.w ? 2 : 0.8} 
          distance={10}
        />
        <pointLight 
          position={[-1.5, 0, 0]} 
          color="#ff0000" 
          intensity={0.5} 
          distance={3}
        />
        <pointLight 
          position={[1.5, 0, 0]} 
          color="#ff0000" 
          intensity={0.5} 
          distance={3}
        />
      </group>
    </group>
  )
})

Spaceship.displayName = 'Spaceship'