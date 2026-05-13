// components/MainEngine.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { HollowCylinder } from './HollowCylinder';

interface MainEngineProps {
  position?: [number, number, number];
  color?: number;
  scale?: number;
  isThrustActive?: boolean;
}

export interface MainEngineRef {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  update: (time: number) => void;
}

export const MainEngine = forwardRef<MainEngineRef, MainEngineProps>(({
  position = [0, 0, 0],
  scale = 0.5,
  color = 0xff0000,
  isThrustActive = false
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const exhaustMeshRef = useRef<THREE.Mesh>(null);
  const bladeGroupRef = useRef<THREE.Group>(null);
  const thrustActiveRef = useRef(false);
  const currentThrustRef = useRef(0);
  
  const thrustSpeed = 0.1;

  const createFlameMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff2200) },
        emissive: { value: new THREE.Color(0xff2200) },
        time: { value: 0.0 },
        thrustIntensity: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 emissive;
        uniform float thrustIntensity;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0), 1.5);
          float flicker = 0.5 + 0.8 * sin(time * 10.0 + vPosition.y * 10.0);
          vec3 finalColor = color * intensity + emissive * thrustIntensity;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false
    });
  };

  const createInnerMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x000000) },
        emissive: { value: new THREE.Color(0x100000) },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 emissive;
        uniform float time;
        varying vec3 vNormal;
        varying vec3 vPosition;
        void main() {
          float intensity = pow(max(dot(vNormal, vec3(0.0, 1.0, 0.0)), 0.0), 1.5);
          float flicker = 0.5 + 0.5 * sin(time * 10.0 + vPosition.y * 10.0);
          vec3 finalColor = color * intensity + emissive * flicker;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false
    });
  };

  const createBladeMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff2200) },
        time: { value: 0.0 }
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform float time;
        varying vec2 vUv;
        void main() {
          float alpha = smoothstep(0.0, 0.6, vUv.y) * (0.1 + 0.5 * sin(time * 12.0 + vUv.y * 12.0));
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  };

  useEffect(() => {
    if (!groupRef.current) return;

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    // ایجاد شعله
    const flameGeometry = new THREE.CylinderGeometry(0.5, 1.3, 1.2, 8);
    const flameMaterial = createFlameMaterial();
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(0, 1, 0);
    groupRef.current.add(flame);
    flameRef.current = flame;

    // ایجاد دهانه خروجی
    const outerRadius = 1.6;
    const innerRadius = 1.3;
    const length = 2;
    const segments = 8;
    const exhaustGeometry = new THREE.CylinderGeometry(outerRadius, innerRadius, length, segments, 1, true);
    const exhaustMaterial = new THREE.MeshStandardMaterial({ color: 0x333333, metalness: 0.8, roughness: 0.2, side: THREE.DoubleSide });
    const exhaustMesh = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    exhaustMesh.position.set(0, -3, 0);
    
    const edgesGeometry = new THREE.EdgesGeometry(exhaustGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const edgeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    exhaustMesh.add(edgeLines);
    groupRef.current.add(exhaustMesh);
    exhaustMeshRef.current = exhaustMesh;

    // ایجاد شعله داخلی
    const innerFlameGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.7, 32);
    const innerMaterial = createInnerMaterial();
    const innerCylinder = new THREE.Mesh(innerFlameGeometry, innerMaterial);
    innerCylinder.position.set(0, -1.8, 0);
    flame.add(innerCylinder);

    // ایجاد مخروط
    const coneRadius = 0.4;
    const coneHeight = 8;
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color: 0x666666,
      metalness: 0.8,
      roughness: 0.2
    });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(0, -coneHeight / 2, 0);
    coneMesh.rotation.x = -Math.PI;
    groupRef.current.add(coneMesh);

    // ایجاد پره‌ها
    const bladeGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const bladeGeometry = new THREE.BoxGeometry(1.8, 5, 1.8);
      const bladeMaterial = createBladeMaterial();
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const angle = (i / 8) * Math.PI / 5;
      blade.position.set(Math.cos(angle) * 1.8, Math.sin(angle) * 1.8, 0);
      blade.rotation.y = -angle;
      bladeGroup.add(blade);
    }
    bladeGroup.position.set(-1.5, -8, 0);
    groupRef.current.add(bladeGroup);
    bladeGroupRef.current = bladeGroup;
  }, [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const target = isThrustActive ? 1 : 0;
    currentThrustRef.current = THREE.MathUtils.lerp(currentThrustRef.current, target, thrustSpeed);

    if (exhaustMeshRef.current) {
      exhaustMeshRef.current.scale.set(1, 1, 1 + currentThrustRef.current * 0.1);
    }
    
    if (flameRef.current && flameRef.current.material instanceof THREE.ShaderMaterial) {
      flameRef.current.material.uniforms.time.value = time;
      flameRef.current.material.uniforms.thrustIntensity.value = currentThrustRef.current;
    }
    
    if (bladeGroupRef.current) {
      const scaleFactor = THREE.MathUtils.lerp(0.0, 1, currentThrustRef.current);
      bladeGroupRef.current.scale.set(scaleFactor, scaleFactor, scaleFactor);
      bladeGroupRef.current.children.forEach(blade => {
        if (blade instanceof THREE.Mesh && blade.material instanceof THREE.ShaderMaterial) {
          blade.material.uniforms.time.value = time;
        }
      });
    }
  });

  useImperativeHandle(ref, () => ({
    onKeyDown: (key: string) => {
      if (key === 'w' || key === 'W') {
        thrustActiveRef.current = true;
      }
    },
    onKeyUp: (key: string) => {
      if (key === 'w' || key === 'W') {
        thrustActiveRef.current = false;
      }
    },
    update: (time: number) => {
      const target = thrustActiveRef.current ? 1 : 0;
      currentThrustRef.current = THREE.MathUtils.lerp(currentThrustRef.current, target, thrustSpeed);
    }
  }));

  return (
    <group ref={groupRef} position={position} rotation={[1.5, 0, 0]} scale={scale} >
      <HollowCylinder
        outerRadius={1.8}
        innerRadius={1.5}
        height={4}
        radialSegments={8}
        color={0x1a2a3a}
        rotation={[-1.5, 0, 0]}
      />
    </group>
  );
});

MainEngine.displayName = 'MainEngine';