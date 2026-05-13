// components/SideEngine.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { HollowCylinder } from './HollowCylinder';
import { JetEngineData } from '../types/three';

interface SideEngineProps {
  position?: [number, number, number];
  color?: number;
}

export interface SideEngineRef {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  update: (time: number) => void;
}

export const SideEngine = forwardRef<SideEngineRef, SideEngineProps>(({
  position = [0, 0, 0],
  color = 0x777777
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const exhaustGroupRef = useRef<THREE.Group>(null);
  const thrustActiveRef = useRef(false);
  const currentThrustRef = useRef(0);
  const jetEnginesRef = useRef<JetEngineData[]>([]);
  const coneMeshRef = useRef<THREE.Mesh>(null);
  const edgeLinesRef = useRef<THREE.LineSegments>(null);
  const bladeGroupRef = useRef<THREE.Group>(null);

  const thrustSpeed = 0.1;

  // ایجاد شعله بیرونی
  const createFlameMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00aaff) },
        emissive: { value: new THREE.Color(0x0066ff) },
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
          float flicker = 0.5 + 0.5 * sin(time * 10.0 + vPosition.y * 10.0);
          vec3 finalColor = color * intensity + emissive * thrustIntensity;
          gl_FragColor = vec4(finalColor, 1.0);
        }
      `,
      transparent: false
    });
  };

  // ایجاد شعله داخلی
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

  // ایجاد متریال برای پره‌ها
  const createBladeMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0x00aaff) },
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

    // ایجاد هشت‌ضلعی توخالی
    const hexagonalMeshGroup = new THREE.Group();
    // HollowCylinder implementation would go here
    groupRef.current.add(hexagonalMeshGroup);

    // ایجاد پایه موتور
    const pivotGeometry = new THREE.BoxGeometry(0.5, 0.5, 1);
    const pivotMaterialSide = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.8,
      roughness: 0.2
    });
    const sidePivot = new THREE.Mesh(pivotGeometry, pivotMaterialSide);
    sidePivot.position.set(0, 0, 1);
    groupRef.current.add(sidePivot);

    // ایجاد سر موتور (هشت وجهی)
    const engineHeadGeo = new THREE.OctahedronGeometry(1, 2);
    const engineHeadMat = new THREE.MeshStandardMaterial({ color, metalness: 0.6, roughness: 0.4 });
    const engineHeadMesh = new THREE.Mesh(engineHeadGeo, engineHeadMat);
    engineHeadMesh.position.set(0, 2.3, 0);
    engineHeadMesh.rotation.set(Math.PI / 2, 0, 0);
    
    const edgesGeometry = new THREE.EdgesGeometry(engineHeadGeo);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const edgeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    engineHeadMesh.add(edgeLines);
    groupRef.current.add(engineHeadMesh);

    // ایجاد مخروط
    const coneRadius = 0.45;
    const coneHeight = 3;
    const coneGeometry = new THREE.ConeGeometry(coneRadius, coneHeight, 32);
    const coneMaterial = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.8,
      roughness: 0.2
    });
    const coneMesh = new THREE.Mesh(coneGeometry, coneMaterial);
    coneMesh.position.set(0, -coneHeight / 2, 0);
    coneMesh.rotation.x = -Math.PI;
    groupRef.current.add(coneMesh);
    coneMeshRef.current = coneMesh;

    // ایجاد دهانه خروجی
    const outerRadius = 0.8;
    const innerRadius = 0.25;
    const length = 0.6;
    const segments = 8;
    
    const exhaustGeometry = new THREE.CylinderGeometry(outerRadius, outerRadius, length, segments, 1, true);
    const exhaustMaterial = new THREE.MeshStandardMaterial({
      color: 0x333333,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });
    const exhaustMesh = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
    
    const exhaustEdgesGeometry = new THREE.EdgesGeometry(exhaustGeometry);
    const exhaustEdgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const exhaustEdgeLines = new THREE.LineSegments(exhaustEdgesGeometry, exhaustEdgesMaterial);
    
    const innerGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, length * 0.8, segments, 1, true);
    const innerMesh = new THREE.Mesh(innerGeometry, exhaustMaterial);
    innerMesh.position.y = -0.1;
    
    const exhaustGroup = new THREE.Group();
    exhaustGroup.add(exhaustMesh);
    exhaustGroup.add(exhaustEdgeLines);
    exhaustGroup.add(innerMesh);
    exhaustGroup.position.set(0, -2.2, 0);
    exhaustGroup.rotation.x = Math.PI;
    groupRef.current.add(exhaustGroup);
    exhaustGroupRef.current = exhaustGroup;

    // ایجاد شعله
    const flameGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.7, 32);
    const flameMaterial = createFlameMaterial();
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(0, 1, 0);
    groupRef.current.add(flame);
    flameRef.current = flame;

    // ایجاد شعله داخلی
    const innerFlameGeometry = new THREE.CylinderGeometry(0.2, 0.2, 1.8, 32);
    const innerMaterial = createInnerMaterial();
    const innerCylinder = new THREE.Mesh(innerFlameGeometry, innerMaterial);
    innerCylinder.position.set(0, -0.2, 0);
    flame.add(innerCylinder);

    // ایجاد پره‌ها
    const bladeGroup = new THREE.Group();
    for (let i = 0; i < 16; i++) {
      const bladeGeometry = new THREE.BoxGeometry(0.01, 4, 0.6);
      const bladeMaterial = createBladeMaterial();
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const angle = (i / 8) * Math.PI / 3;
      blade.position.set(Math.cos(angle) * 0.1, Math.sin(angle) * 0.1, 0);
      blade.rotation.y = -angle;
      blade.scale.set(0, 0, 0);
      bladeGroup.add(blade);
    }
    bladeGroup.position.set(0, -5.8, 0);
    groupRef.current.add(bladeGroup);
    bladeGroupRef.current = bladeGroup;

    // ذخیره اطلاعات موتور جت
    jetEnginesRef.current = [{
      flameMaterial: flameMaterial,
      innerMaterial: innerMaterial,
      bladeGroup: bladeGroup,
      flameMesh: flame
    }];
  }, [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const target = thrustActiveRef.current ? 1 : 0;
    currentThrustRef.current = THREE.MathUtils.lerp(currentThrustRef.current, target, thrustSpeed);
    
    if (exhaustGroupRef.current) {
      exhaustGroupRef.current.scale.set(1, 1, 1 + currentThrustRef.current * 0.1);
    }
    
    jetEnginesRef.current.forEach(engine => {
      engine.flameMaterial.uniforms.thrustIntensity.value = currentThrustRef.current;
      engine.flameMaterial.uniforms.time.value = time;
      engine.innerMaterial.uniforms.time.value = time;
      engine.bladeGroup.children.forEach(blade => {
        if (blade instanceof THREE.Mesh && blade.material instanceof THREE.ShaderMaterial) {
          blade.material.uniforms.time.value = time;
        }
      });
    });
  });

  useImperativeHandle(ref, () => ({
    onKeyDown: (key: string) => {
      if (key === 'w' || key === 'W') {
        thrustActiveRef.current = true;
        jetEnginesRef.current.forEach(engine => {
          const scaleFactor = THREE.MathUtils.lerp(0.0, 1, currentThrustRef.current);
          engine.bladeGroup.children.forEach(blade => {
            blade.scale.set(1, 1, 1);
          });
          engine.bladeGroup.scale.set(scaleFactor, scaleFactor, scaleFactor);
          engine.flameMaterial.uniforms.emissive.value.setHex(0x00ffff);
        });
      }
    },
    onKeyUp: (key: string) => {
      if (key === 'w' || key === 'W') {
        thrustActiveRef.current = false;
        jetEnginesRef.current.forEach(engine => {
          engine.bladeGroup.children.forEach(blade => {
            blade.scale.set(0, 0, 0);
          });
          engine.flameMaterial.uniforms.emissive.value.setHex(0x0066ff);
        });
      }
    },
    update: (time: number) => {
      const target = thrustActiveRef.current ? 1 : 0;
      currentThrustRef.current = THREE.MathUtils.lerp(currentThrustRef.current, target, thrustSpeed);
      
      if (exhaustGroupRef.current) {
        exhaustGroupRef.current.scale.set(1, 1, 1 + currentThrustRef.current * 0.1);
      }
      
      jetEnginesRef.current.forEach(engine => {
        engine.flameMaterial.uniforms.thrustIntensity.value = currentThrustRef.current;
        engine.flameMaterial.uniforms.time.value = time;
        engine.innerMaterial.uniforms.time.value = time;
      });
    }
  }));

  return <group ref={groupRef} position={position} rotation={[1.5,0,0]} scale={0.5} />;
});

SideEngine.displayName = 'SideEngine';