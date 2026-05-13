// components/DoorWithStairs.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';

interface DoorWithStairsParams {
  doorWidth?: number;
  doorHeight?: number;
  doorDepth?: number;
  doorColor?: number;
  stepCount?: number;
  stepHeight?: number;
  stepDepth?: number;
  stairsColor?: number;
  floorThickness?: number;
  floorColor?: number;
  position?: [number, number, number];
}

export interface DoorWithStairsRef {
  updateDoor: (deltaTime: number, open: boolean) => void;
}

export const DoorWithStairs = forwardRef<DoorWithStairsRef, DoorWithStairsParams>(({
  doorWidth = 2,
  doorHeight = 20,
  doorDepth = 0.1,
  doorColor = 0x444444,
  stepCount = 20,
  stepHeight = 0.5,
  stepDepth = 0.1,
  stairsColor = 0x888888,
  floorThickness = 0.2,
  floorColor = 0x777777,
  position = [0, 0, 0]
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const pivotRef = useRef<THREE.Group>(null);
  const doorMeshRef = useRef<THREE.Mesh>(null);
  const stairsGroupRef = useRef<THREE.Group>(null);
  const floorMeshRef = useRef<THREE.Mesh>(null);
  const currentAngleRef = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    const pivot = new THREE.Group();
    pivotRef.current = pivot;

    // ایجاد در
    const doorGeometry = new THREE.BoxGeometry(doorWidth, doorHeight, doorDepth);
    const doorMaterial = new THREE.MeshStandardMaterial({ color: doorColor });
    const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
    doorMesh.position.set(0, 0.8, 0);
    pivot.add(doorMesh);
    doorMeshRef.current = doorMesh;

    // ایجاد پله‌ها
    const stairsGroup = new THREE.Group();
    const stairsMaterial = new THREE.MeshStandardMaterial({ color: stairsColor });

    let lastStepZ = 0;
    for (let i = 0; i < stepCount; i++) {
      const stepGeometry = new THREE.BoxGeometry(doorWidth, stepHeight, stepDepth);
      const stepMesh = new THREE.Mesh(stepGeometry, stairsMaterial);
      
      const stepY = -doorHeight / 2 - (i + 0.5) * stepHeight;
      const stepZ = -(i + 0.5) * stepDepth;
      stepMesh.position.set(0, stepY, stepZ);
      
      lastStepZ = stepZ;
      stairsGroup.add(stepMesh);
    }
    stairsGroup.position.set(0, 13, 2);
    pivot.add(stairsGroup);
    stairsGroupRef.current = stairsGroup;

    // ایجاد کف زیر پله‌ها
    const floorGeometry = new THREE.BoxGeometry(
      doorWidth,
      floorThickness,
      Math.abs(lastStepZ) + stepDepth * 95
    );
    const floorMaterial = new THREE.MeshStandardMaterial({ color: floorColor });
    const floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
    
    const floorY = -doorHeight / 2 - (stepCount * stepHeight) + 17;
    const floorZ = lastStepZ / 2 + 2;
    floorMesh.position.set(0, floorY, floorZ);
    floorMesh.rotation.x = Math.PI / 2 + 0.2;
    pivot.add(floorMesh);
    floorMeshRef.current = floorMesh;

    groupRef.current.add(pivot);
    groupRef.current.position.set(position[0], position[1], position[2]);

    // Cleanup
    return () => {
      doorGeometry.dispose();
      doorMaterial.dispose();
      stairsMaterial.dispose();
      floorGeometry.dispose();
      floorMaterial.dispose();
    };
  }, [doorWidth, doorHeight, doorDepth, doorColor, stepCount, stepHeight, stepDepth, stairsColor, floorThickness, floorColor, position]);

  useFrame(({ clock }) => {
    // انیمیشن در می‌تواند از طریق ref کنترل شود
  });

  useImperativeHandle(ref, () => ({
    updateDoor: (deltaTime: number, open: boolean) => {
      const targetAngle = open ? 0 : 0.2;
      currentAngleRef.current = THREE.MathUtils.lerp(currentAngleRef.current, targetAngle, 0.01);
      if (pivotRef.current) {
        pivotRef.current.rotation.x = -currentAngleRef.current;
      }
    }
  }));

  return <group ref={groupRef} />;
});

DoorWithStairs.displayName = 'DoorWithStairs';