// EngineGroup.tsx - فقط قسمت‌های لازم اصلاح شود

import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { JetEngineData } from '../types/three';

interface EngineGroupProps {
  position?: [number, number, number];
  color?: number;
  scale?: number;
  isThrustActive?: boolean;
}

export interface EngineGroupRef {
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
  update: (time: number) => void;
}

export const EngineGroup = forwardRef<EngineGroupRef, EngineGroupProps>(({
  position = [0, 0, 0],
  color = 0x1a2a3a,
  scale = 0.5,
  isThrustActive = false
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const flameRef = useRef<THREE.Mesh>(null);
  const exhaustGroupRef = useRef<THREE.Group>(null);
  const bladeGroupRef = useRef<THREE.Group>(null);
  const thrustActiveRef = useRef(false);
  const currentThrustRef = useRef(0);
  const jetEnginesRef = useRef<JetEngineData[]>([]);
  
  const thrustSpeed = 0.15; // افزایش سرعت برای پاسخگویی بهتر

  const createFlameMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff4400) }, // تغییر به نارنجی
        emissive: { value: new THREE.Color(0xff2200) }, // تغییر به قرمز-نارنجی
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
          float flicker = 0.5 + 0.8 * sin(time * 20.0 + vPosition.y * 15.0);
          float finalIntensity = thrustIntensity * (0.5 + flicker * 0.5);
          vec3 finalColor = color * intensity + emissive * finalIntensity;
          gl_FragColor = vec4(finalColor, finalIntensity * 0.8 + 0.2);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  };

  const createInnerMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff8800) }, // تغییر به نارنجی روشن
        emissive: { value: new THREE.Color(0xff4400) },
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
          float flicker = 0.5 + 0.7 * sin(time * 25.0 + vPosition.y * 20.0);
          vec3 finalColor = color * intensity + emissive * flicker;
          gl_FragColor = vec4(finalColor, 0.9);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  };

  const createBladeMaterial = () => {
    return new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color(0xff6600) },
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
          float alpha = smoothstep(0.0, 0.6, vUv.y) * (0.3 + 0.7 * sin(time * 15.0 + vUv.y * 15.0));
          gl_FragColor = vec4(color, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending
    });
  };

  const createJetCylinder = (xPos: number) => {
    if (!groupRef.current) return;

    // ایجاد شعله بیرونی
    const flameGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 16);
    const flameMaterial = createFlameMaterial();
    const flame = new THREE.Mesh(flameGeometry, flameMaterial);
    flame.position.set(xPos, -2.35, 0);
    flame.visible = false; // مخفی در ابتدا
    groupRef.current.add(flame);
    
    // ایجاد دهانه خروجی
    const outerRadius = 0.35;
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
    
    const edgesGeometry = new THREE.EdgesGeometry(exhaustGeometry);
    const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
    const edgeLines = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    
    const innerGeometry = new THREE.CylinderGeometry(innerRadius, innerRadius, length * 0.8, segments, 1, true);
    const innerMesh = new THREE.Mesh(innerGeometry, exhaustMaterial);
    innerMesh.position.y = -0.1;
    
    const exhaustGroup = new THREE.Group();
    exhaustGroup.add(exhaustMesh);
    exhaustGroup.add(edgeLines);
    exhaustGroup.add(innerMesh);
    exhaustGroup.position.set(xPos, -3.2, 0);
    exhaustGroup.rotation.x = Math.PI;
    groupRef.current.add(exhaustGroup);

    // ایجاد شعله داخلی
    const innerFlameGeometry = new THREE.CylinderGeometry(0.2, 0.35, 1.2, 16);
    const innerMaterial = createInnerMaterial();
    const innerCylinder = new THREE.Mesh(innerFlameGeometry, innerMaterial);
    innerCylinder.position.set(xPos, -2.3, 0);
    innerCylinder.visible = false;
    groupRef.current.add(innerCylinder);

    // ایجاد پره‌ها
    const bladeGroup = new THREE.Group();
    for (let i = 0; i < 8; i++) {
      const bladeGeometry = new THREE.BoxGeometry(0.08, 0.6, 0.15);
      const bladeMaterial = createBladeMaterial();
      const blade = new THREE.Mesh(bladeGeometry, bladeMaterial);
      const angle = (i / 8) * Math.PI * 2;
      blade.position.set(Math.cos(angle) * 0.25, Math.sin(angle) * 0.25, 0);
      blade.rotation.z = angle;
      bladeGroup.add(blade);
    }
    bladeGroup.position.set(xPos, -1.9, 0);
    groupRef.current.add(bladeGroup);

    // ذخیره اطلاعات موتور جت
    jetEnginesRef.current.push({
      flameMaterial: flameMaterial,
      innerMaterial: innerMaterial,
      bladeGroup: bladeGroup,
      flameMesh: flame,
      innerFlameMesh: innerCylinder
    } as any);
  };

  useEffect(() => {
    if (!groupRef.current) return;

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.8,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    // ایجاد مسیر اکسترود
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, -3, 0),
      new THREE.Vector3(0, 3, 0)
    ]);

    // تعریف چند ضلعی
    const shape = new THREE.Shape();
    const sides = 6;
    const radius = 0.5;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      if (i === 0) shape.moveTo(x, y);
      else shape.lineTo(x, y);
    }
    shape.closePath();

    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 32,
      bevelEnabled: false,
      extrudePath: path
    };

    const hexagonalGeometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    const hexagonalMesh = new THREE.Mesh(hexagonalGeometry, material);
    hexagonalMesh.scale.set(3.5, 1, 1.5);
    groupRef.current.add(hexagonalMesh);

    // ایجاد موتورهای جت
    createJetCylinder(-1);
    createJetCylinder(1);
  }, [color]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    const target = isThrustActive ? 1 : 0;
    currentThrustRef.current = THREE.MathUtils.lerp(currentThrustRef.current, target, thrustSpeed);
    
    // اعمال افکت‌های بصری بر اساس isThrustActive
    if (exhaustGroupRef.current) {
      exhaustGroupRef.current.scale.set(1, 1, 1 + currentThrustRef.current * 0.15);
    }
    
    jetEnginesRef.current.forEach((engine: any) => {
      // نمایش/مخفی کردن شعله
      if (engine.flameMesh) {
        engine.flameMesh.visible = currentThrustRef.current > 0.05;
      }
      if (engine.innerFlameMesh) {
        engine.innerFlameMesh.visible = currentThrustRef.current > 0.05;
      }
      
      // بروزرسانی مقادیر شیدرها
      engine.flameMaterial.uniforms.thrustIntensity.value = currentThrustRef.current;
      engine.flameMaterial.uniforms.time.value = time;
      engine.innerMaterial.uniforms.time.value = time;
      
      // تغییر اندازه شعله بر اساس thrust
      if (engine.flameMesh) {
        const scaleY = 0.8 + currentThrustRef.current * 1.5;
        engine.flameMesh.scale.set(1, scaleY, 1);
      }
      
      // چرخاندن پره‌ها
      if (engine.bladeGroup) {
        const rotationSpeed = currentThrustRef.current * 0.8;
        engine.bladeGroup.rotation.z += rotationSpeed;
        
        engine.bladeGroup.children.forEach((blade: THREE.Mesh) => {
          if (blade.material instanceof THREE.ShaderMaterial) {
            blade.material.uniforms.time.value = time;
          }
        });
      }
    });
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

  return <group ref={groupRef} position={position} scale={scale} rotation={[1.5, 0, 0]} />;
});

EngineGroup.displayName = 'EngineGroup';