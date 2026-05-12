// features/logo-3d/components/ParkingNode.tsx
import { useMemo, useRef, useState } from 'react'
import { Html } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import type { Mesh } from 'three'
import type { Task } from '@/types/task.types'
import { OrbitalRings, RingData } from './OrbitalRings'
import * as THREE from 'three'
// features/logo-3d/components/ParkingNode.tsx

// ============================================================
// Shader ها
// ============================================================

// Vertex Shader مشترک
const PARKING_VERTEX = `
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vPosition;
  varying vec3 vWorldPos;
  
  void main() {
    vUv = uv;
    vNormal = normalize(mat3(modelMatrix) * normal);
    vPosition = position;
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`

// ──── استایل ۱: فلزی درخشان (Metallic) ────
const METALLIC_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uActive;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  
  void main() {
    // Fresnel - لبه‌ها درخشان‌تر
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - abs(dot(vNormal, viewDir));
    fresnel = pow(fresnel, 3.0);
    
    // نورپردازی ساده
    vec3 lightDir = normalize(vec3(0.5, 1.0, 0.8));
    float diff = max(dot(vNormal, lightDir), 0.0) * 0.6 + 0.4;
    
    // Base color با gradient ملایم
    vec3 base = uColor * diff;
    
    // Rim light (لبه‌های درخشان)
    vec3 rim = uGlowColor * fresnel * (0.5 + uActive * 0.5);
    
    // Highlight نقطه‌ای
    vec3 highlight = vec3(1.0) * pow(fresnel, 8.0) * 0.4 * (1.0 + uActive);
    
    // ترکیب
    vec3 finalColor = base + rim + highlight;
    
    // Alpha: opaque با rim glow
    float alpha = uOpacity * (0.85 + fresnel * 0.15 + uActive * 0.1);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// ──── استایل ۲: کریستال/سنگ قیمتی (Gemstone) ────
const GEMSTONE_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uActive;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - abs(dot(vNormal, viewDir));
    fresnel = pow(fresnel, 2.5);
    
    // Internal glow (انگار نور از داخل میاد)
    float innerGlow = pow(fresnel, 1.5) * 0.7;
    
    // Facet-like highlights
    vec3 lightDir1 = normalize(vec3(0.8, 0.6, 1.0));
    vec3 lightDir2 = normalize(vec3(-0.5, 0.8, -0.3));
    float spec1 = pow(max(dot(vNormal, lightDir1), 0.0), 6.0) * 0.5;
    float spec2 = pow(max(dot(vNormal, lightDir2), 0.0), 4.0) * 0.3;
    
    // Color shifts based on angle
    vec3 color1 = uColor;
    vec3 color2 = uGlowColor;
    vec3 angleColor = mix(color1, color2, fresnel * 0.6);
    
    // ترکیب
    vec3 finalColor = angleColor * (0.6 + innerGlow * 0.4);
    finalColor += uGlowColor * (spec1 + spec2) * (1.0 + uActive);
    finalColor += vec3(1.0) * pow(fresnel, 10.0) * 0.3 * uActive;
    
    float alpha = uOpacity * (0.75 + innerGlow * 0.25);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

// ──── استایل ۳: مینیمال مات درخشان (Soft Glow) ────
const SOFT_GLOW_FRAGMENT = `
  uniform vec3 uColor;
  uniform vec3 uGlowColor;
  uniform float uOpacity;
  uniform float uTime;
  uniform float uActive;
  varying vec2 vUv;
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  
  void main() {
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = 1.0 - abs(dot(vNormal, viewDir));
    
    // نور ملایم و یکنواخت
    float light = 0.7 + 0.3 * dot(vNormal, normalize(vec3(0.5, 0.8, 0.5)));
    
    // Core color
    vec3 base = uColor * light;
    
    // Soft outer glow
    float glow = pow(fresnel, 4.0) * 0.4 * (1.0 + uActive);
    vec3 glowColor = uGlowColor * glow;
    
    // Pulse animation برای active
    float pulse = 1.0 + sin(uTime * 2.0) * 0.1 * uActive;
    
    vec3 finalColor = (base + glowColor) * pulse;
    
    float alpha = uOpacity * (0.8 + fresnel * 0.2);
    
    gl_FragColor = vec4(finalColor, alpha);
  }
`

type NodeStyle = 'metallic' | 'gemstone' | 'soft-glow'


interface ParkingNodeProps {
  position: [number, number, number]
  columnId: string
  columnColor: string
  tasks: Task[]
  boardColor: string
  style?: NodeStyle 
}
const SHADERS: Record<NodeStyle, string> = {
  'metallic': METALLIC_FRAGMENT,
  'gemstone': GEMSTONE_FRAGMENT,
  'soft-glow': SOFT_GLOW_FRAGMENT,
}

const priorityColors: Record<string, string> = {
  'urgent': '#EF4444',
  'high': '#F59E0B',
  'medium': '#3B82F6',
  'low': '#6B7280',
}

const statusIcons: Record<string, string> = {
  'todo': '○',
  'in-progress': '◐',
  'done': '●',
  'backlog': '◌',
}

export const ParkingNode = ({ 
  position, 
  columnId, 
  columnColor, 
  tasks,
  style = 'soft-glow',
  boardColor 
}: ParkingNodeProps) => {
  const dotRef = useRef<Mesh>(null!)
  const glowRef = useRef<Mesh>(null!)
  const materialRef = useRef<THREE.ShaderMaterial>(null!)
  const glowMaterialRef = useRef<THREE.ShaderMaterial>(null!)

  const [hovered, setHovered] = useState(false)
  const [showPanel, setShowPanel] = useState(false)
  
  const taskCount = tasks.length
  const hasUrgent = tasks.some(t => t.priority === 'urgent')

  // Uniforms
  const uniforms = useRef({
    uColor: { value: new THREE.Color(hasUrgent ? '#EF4444' : columnColor) },
    uGlowColor: { value: new THREE.Color(columnColor) },
    uOpacity: { value: 0.85 },
    uTime: { value: 0 },
    uActive: { value: 0 },
  })

 // Glow uniforms
  const glowUniforms = useRef({
    uColor: { value: new THREE.Color(columnColor) },
    uGlowColor: { value: new THREE.Color(columnColor) },
    uOpacity: { value: 0.15 },
    uTime: { value: 0 },
    uActive: { value: 0 },
  })
 useFrame((_, delta) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value += delta
      
      const targetActive = (hovered || showPanel) ? 1.0 : 0.0
      const current = materialRef.current.uniforms.uActive.value
      materialRef.current.uniforms.uActive.value += (targetActive - current) * delta * 6
      
      materialRef.current.uniforms.uOpacity.value += 
        ((targetActive > 0 ? 1.0 : 0.85) - materialRef.current.uniforms.uOpacity.value) * delta * 6
    }
    
    if (glowMaterialRef.current) {
      const targetActive = (hovered || showPanel) ? 1.0 : 0.0
      glowMaterialRef.current.uniforms.uActive.value += 
        (targetActive - glowMaterialRef.current.uniforms.uActive.value) * delta * 6
      glowMaterialRef.current.uniforms.uOpacity.value += 
        ((targetActive > 0 ? 0.3 : 0.1) - glowMaterialRef.current.uniforms.uOpacity.value) * delta * 6
    }
  })

  const ringData: RingData[] = useMemo(() => 
    tasks.map(task => ({
        id: task.id,
        color: task.priority === 'urgent' ? '#EF4444' : columnColor,
        isUrgent: task.priority === 'urgent',
        speed: 0.3 + (task.id.charCodeAt(task.id.length - 1) % 10) * 0.1,
    })),
    [tasks, columnColor]
  )

  return (
    <group position={position}>
      {/* ===== Core dot ===== */}
      <mesh
        ref={dotRef}
        onClick={(e) => {
          e.stopPropagation()
          setShowPanel(!showPanel)
        }}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => setHovered(false)}
      >
        <sphereGeometry args={[0.05, 12, 12]} />
        <shaderMaterial
          ref={materialRef}
          vertexShader={PARKING_VERTEX}
          fragmentShader={SHADERS[style]}
          uniforms={uniforms.current}
          transparent
          depthWrite={true}
        />
      </mesh>

      <OrbitalRings
        rings={ringData}
        baseRadius={0.08}
        gap={0.04}
        thickness={0.005}
        baseOpacity={0.3}
        active={hovered || showPanel}
        segments={24}
      />


      {/* ===== Glow ===== */}
      {(hovered || showPanel) && (
        <mesh>
          <sphereGeometry args={[0.1, 8, 8]} />
          <shaderMaterial
          ref={glowMaterialRef}
          vertexShader={PARKING_VERTEX}
          fragmentShader={SHADERS[style]}
          uniforms={glowUniforms.current}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
         />
        </mesh>
      )}

      {/* ===== Label ===== */}
      <Html 
        position={[0, -0.12, 0]} 
        center 
        distanceFactor={8} 
        occlude={false} 
        style={{ pointerEvents: 'none' }}
      >
        <span 
          className="text-[8px] font-medium px-1.5 py-0.5 rounded-full"
          style={{ 
            backgroundColor: columnColor + '22',
            color: columnColor,
          }}
        >
          {taskCount}
        </span>
      </Html>

      {showPanel && (
        <Html
          position={[0, 0.4, 0]}
          center
          distanceFactor={8}
          occlude={false}
          style={{ pointerEvents: 'auto' }}
        >
          <div 
            className="w-[220px] max-h-[320px] rounded-2xl overflow-hidden shadow-2xl border border-white/10 backdrop-blur-xl"
            style={{ 
              backgroundColor: 'rgba(15, 23, 42, 0.92)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* ===== Header ===== */}
            <div 
              className="sticky top-0 z-10 px-4 py-3 flex items-center justify-between"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              <div className="flex items-center gap-2.5">
                <span 
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ 
                    backgroundColor: columnColor,
                    boxShadow: `0 0 8px ${columnColor}66`,
                  }}
                />
                <div>
                  <span className="text-white text-xs font-semibold capitalize">
                    {columnId.replace('-', ' ')}
                  </span>
                  <span className="text-white/30 text-[10px] ml-2">
                    {taskCount}
                  </span>
                </div>
              </div>
              <button 
                onClick={() => setShowPanel(false)}
                className="text-white/30 hover:text-white/70 transition-colors text-sm leading-none"
              >
                ×
              </button>
            </div>

            {/* ===== Task List ===== */}
            <div className="overflow-y-auto max-h-[260px] px-3 py-2 space-y-1.5 scrollbar-thin">
              {taskCount === 0 ? (
                <div className="text-center py-6">
                  <span className="text-white/20 text-[11px]">No tasks yet</span>
                </div>
              ) : (
                tasks.map(task => (
                  <div
                    key={task.id}
                    className="group rounded-xl px-3 py-2.5 transition-all cursor-default"
                    style={{ 
                      backgroundColor: 'rgba(255,255,255,0.02)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.02)'
                    }}
                  >
                    {/* Row 1: Status icon + Title */}
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] mt-0.5 flex-shrink-0" style={{ color: columnColor }}>
                        {statusIcons[task.columnId] || '○'}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/85 text-[11px] font-medium leading-snug truncate">
                          {task.title}
                        </p>
                      </div>
                      {task.priority && (
                        <span 
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1"
                          style={{ 
                            backgroundColor: priorityColors[task.priority],
                            boxShadow: task.priority === 'urgent' 
                              ? `0 0 6px ${priorityColors[task.priority]}` 
                              : 'none',
                          }}
                        />
                      )}
                    </div>

                    {/* Row 2: Meta info */}
                    <div className="flex items-center gap-3 mt-1.5 ml-4">
                      {task.dueDate && (
                        <span className="text-[9px] text-white/30">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </span>
                      )}
                      {task.estimatedHours && (
                        <span className="text-[9px] text-white/25">
                          {task.estimatedHours}h
                        </span>
                      )}
                      {task.labels && task.labels.length > 0 && (
                        <div className="flex gap-1">
                          {task.labels.slice(0, 3).map(label => (
                            <span 
                              key={label}
                              className="text-[7px] px-1 py-0.5 rounded text-white/25 bg-white/5"
                            >
                              {label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* ===== Footer ===== */}
            <div 
              className="px-4 py-2 text-center"
              style={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.98)',
                borderTop: '1px solid rgba(255,255,255,0.04)',
              }}
            >
              <span className="text-[9px] text-white/20">
                {taskCount} task{taskCount !== 1 ? 's' : ''} in {columnId}
              </span>
            </div>
          </div>
        </Html>
      )}
    </group>
  )
}

// ============================================================
// Ringlet - visual only
// ============================================================
interface RingletProps {
  index: number
  color: string
  hovered: boolean
}

const Ringlet = ({ index, color, hovered }: RingletProps) => {
  const ref = useRef<Mesh>(null!)
  const radius = 0.08 + index * 0.04
  
  
  return (
    <mesh ref={ref} rotation={[Math.random() * Math.PI, Math.random() * Math.PI, 0]}>
      <torusGeometry args={[radius, 0.006, 8, 16]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={hovered ? 0.85 : 0.35}
        depthWrite={false}
      />
    </mesh>
  )
}