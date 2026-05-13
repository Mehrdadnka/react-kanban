// components/Wing.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';

interface WingParams {
  widthWide?: number;
  widthNarrow?: number;
  thickness?: number;
  length?: number;
  color?: number;
  position?: [number, number, number];
  rotation?: [number, number, number];
  controlKeys?: Record<string, boolean>;
  thrusterPower?: number;
}

export interface WingRef {
  update: (deltaTime: number) => void;
  attachWeapon: (weaponMesh: THREE.Mesh, hardpointIndex?: number) => void;
  setThrusterPower: (power: number) => void;
  onKeyDown: (key: string) => void;
  onKeyUp: (key: string) => void;
}

export const Wing = forwardRef<WingRef, WingParams>(({
  widthWide = 8,
  widthNarrow = 4,
  thickness = 0.8,
  length = 12,
  color = 0x1a2a3a,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  thrusterPower = 1.0
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const tipGroupRef = useRef<THREE.Group>(null);
  const tipMeshRef = useRef<THREE.Mesh>(null);
  const pistonsRef = useRef<THREE.Mesh[]>([]);
  const wingPanelsRef = useRef<THREE.Mesh[]>([]);
  const hardpointsRef = useRef<THREE.Mesh[]>([]);
  
  const animationTimeRef = useRef(0);
  const currentThrusterPowerRef = useRef(thrusterPower);
  const deltaTimeRef = useRef(0);

  // ایجاد هندسه نوک بال تاشو
  const createFoldedTipGeometry = (): THREE.ExtrudeGeometry => {
    const shape = new THREE.Shape();
    shape.moveTo(-1.5, 0);
    shape.lineTo(1.5, 0);
    shape.lineTo(2.0, -length / 1.2);
    shape.lineTo(-2.0, -length / 1.2);
    shape.lineTo(-1.5, 0);
    
    return new THREE.ExtrudeGeometry(shape, {
      depth: thickness * 0.8,
      bevelEnabled: true,
      bevelSize: 0.2,
      bevelThickness: 0.15
    });
  };

  // ایجاد بال اصلی
  useEffect(() => {
    if (!groupRef.current) return;

    const wingMaterial = new THREE.MeshStandardMaterial({
      color: color,
      metalness: 0.9,
      roughness: 0.2,
      side: THREE.DoubleSide
    });

    const segments = 5;
    const segmentLength = length / segments;

    for (let i = 0; i < segments; i++) {
      const t = i / segments;
      const width = THREE.MathUtils.lerp(widthWide, widthNarrow, t);
      const shape = new THREE.Shape();
      shape.moveTo(-width / 2, 0);
      shape.lineTo(width / 2, 0);
      shape.lineTo(width / 3, -segmentLength);
      shape.lineTo(-width / 3, -segmentLength);
      shape.lineTo(-width / 2, 0);

      const geometry = new THREE.ExtrudeGeometry(shape, {
        depth: thickness,
        bevelEnabled: true,
        bevelSize: 0.1,
        bevelThickness: 0.2
      });
      geometry.computeVertexNormals();

      const segmentMesh = new THREE.Mesh(geometry, wingMaterial);
      segmentMesh.position.z = -i * segmentLength;
      segmentMesh.rotation.x = Math.PI / 2;
      groupRef.current.add(segmentMesh);
    }

    // ایجاد نوک بال متحرک
    const tipGroup = new THREE.Group();
    const tipGeometry = createFoldedTipGeometry();
    const tipMesh = new THREE.Mesh(tipGeometry, wingMaterial);
    tipMesh.rotation.x = Math.PI / 2;
    tipGroup.add(tipMesh);
    tipGroup.position.z = -length * 0.9;
    groupRef.current.add(tipGroup);
    tipGroupRef.current = tipGroup;
    tipMeshRef.current = tipMesh;

    // ایجاد پیستون‌های متحرک
    const pistonGeometry = new THREE.CylinderGeometry(0.5, 0.5, 1, 12);
    const pistonMaterial = new THREE.MeshStandardMaterial({
      color: 0x333344,
      metalness: 0.95
    });

    const newPistons: THREE.Mesh[] = [];
    for (let i = 0; i < 4; i++) {
      const piston = new THREE.Mesh(pistonGeometry, pistonMaterial);
      piston.position.set(
        (i % 2 === 0 ? -1 : 1) * 1.5,
        0,
        -length * 0.2 * (Math.floor(i / 2) + 1)
      );
      groupRef.current.add(piston);
      newPistons.push(piston);
    }
    pistonsRef.current = newPistons;

    // ایجاد پنل‌های متحرک
    const panelGeometry = new THREE.BoxGeometry(1.5, 0.1, 0.8);
    const newPanels: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const panel = new THREE.Mesh(panelGeometry, pistonMaterial);
      panel.position.z = -length * 0.3 * (i + 1);
      groupRef.current.add(panel);
      newPanels.push(panel);
    }
    wingPanelsRef.current = newPanels;

    // ایجاد نقاط اتصال (Hardpoints)
    const hardpointGeometry = new THREE.SphereGeometry(0.5, 8, 8);
    const hardpointMaterial = new THREE.MeshStandardMaterial({
      color: 0x555566,
      metalness: 0.9
    });

    const hardpointPositions: [number, number, number][] = [
      [-2.5, 0, -length * 0.25],
      [2.5, 0, -length * 0.25],
      [0, 0, -length * 0.75]
    ];

    const newHardpoints: THREE.Mesh[] = [];
    hardpointPositions.forEach(pos => {
      const hardpoint = new THREE.Mesh(hardpointGeometry, hardpointMaterial);
      hardpoint.position.set(pos[0], pos[1], pos[2]);
      groupRef.current?.add(hardpoint);
      newHardpoints.push(hardpoint);
    });
    hardpointsRef.current = newHardpoints;

    // تنظیم موقعیت و چرخش اولیه
    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);

    // Cleanup
    return () => {
      wingMaterial.dispose();
      pistonMaterial.dispose();
      hardpointMaterial.dispose();
      tipGeometry.dispose();
      newPistons.forEach(p => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      newPanels.forEach(p => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      newHardpoints.forEach(h => {
        h.geometry.dispose();
        (h.material as THREE.Material).dispose();
      });
    };
  }, [widthWide, widthNarrow, thickness, length, color, position, rotation]);

  useFrame(({ clock }) => {
    const deltaTime = clock.getDelta();
    deltaTimeRef.current = deltaTime;
    animationTimeRef.current += deltaTime * 0.1;

    // انیمیشن نوک بال
    if (tipGroupRef.current) {
      // tipGroupRef.current.rotation.z = Math.sin(animationTimeRef.current) * 0.2;
    }

    // انیمیشن پیستون‌ها
    pistonsRef.current.forEach((piston, index) => {
      piston.scale.y = 1 + Math.sin(animationTimeRef.current * 2 + index) * 0.2;
    });

    // انیمیشن پنل‌های متحرک
    wingPanelsRef.current.forEach((panel, index) => {
      panel.position.y = Math.sin(animationTimeRef.current * 0.5 + index) * 0.3;
    });
  });

  useImperativeHandle(ref, () => ({
    update: (deltaTime: number) => {
      animationTimeRef.current += deltaTime * 0.1;
      
      pistonsRef.current.forEach((piston, index) => {
        piston.scale.y = 1 + Math.sin(animationTimeRef.current * 2 + index) * 0.2;
      });
      
      wingPanelsRef.current.forEach((panel, index) => {
        panel.position.y = Math.sin(animationTimeRef.current * 0.5 + index) * 0.3;
      });
    },
    attachWeapon: (weaponMesh: THREE.Mesh, hardpointIndex = 0) => {
      if (hardpointIndex < hardpointsRef.current.length) {
        hardpointsRef.current[hardpointIndex].add(weaponMesh);
      }
    },
    setThrusterPower: (power: number) => {
      currentThrusterPowerRef.current = THREE.MathUtils.clamp(power, 0, 1);
    },
    onKeyDown: (key: string) => {
      if (key === 'w') {
        currentThrusterPowerRef.current = 1.5;
      }
    },
    onKeyUp: (key: string) => {
      if (key === 'w') {
        currentThrusterPowerRef.current = 1.0;
      }
    }
  }));

  return <group ref={groupRef} />;
});

Wing.displayName = 'Wing';