// components/RobotLeg.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { RobotLegParams } from '../types/three';

export interface RobotLegRef {
  update: () => void;
}

export const RobotLeg = forwardRef<RobotLegRef, RobotLegParams>(({
  arm1 = { width: 0.8, height: 1.8, depth: 0.3, color: 0x999999 },
  arm2 = { width: 0.7, height: 1.75, depth: 0.25, color: 0x999999 },
  base = { leg: { width: 0.3, height: 0.1625, depth: 0.3, color: 0x999999 } }
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const arm1Ref = useRef<THREE.Mesh>(null);
  const arm2Ref = useRef<THREE.Mesh>(null);
  const animationTimeRef = useRef(0);

  useEffect(() => {
    if (!groupRef.current) return;

    // ایجاد بازوی اول
    const arm1Geometry = new THREE.BoxGeometry(arm1.width, arm1.height, arm1.depth);
    const arm1Material = new THREE.MeshStandardMaterial({ color: arm1.color, metalness: 0.8, roughness: 0.3 });
    const arm1Mesh = new THREE.Mesh(arm1Geometry, arm1Material);
    arm1Mesh.position.set(0, 0, 0);
    groupRef.current.add(arm1Mesh);
    arm1Ref.current = arm1Mesh;

    // ایجاد بازوی دوم
    const arm2Geometry = new THREE.BoxGeometry(arm2.width, arm2.height, arm2.depth);
    const arm2Material = new THREE.MeshStandardMaterial({ color: arm2.color, metalness: 0.8, roughness: 0.3 });
    const arm2Mesh = new THREE.Mesh(arm2Geometry, arm2Material);
    arm2Mesh.position.set(0, -arm1.height / 2 - arm2.height / 2, 0);
    groupRef.current.add(arm2Mesh);
    arm2Ref.current = arm2Mesh;

    // ایجاد پایه
    const baseGeometry = new THREE.BoxGeometry(base.leg.width, base.leg.height, base.leg.depth);
    const baseMaterial = new THREE.MeshStandardMaterial({ color: base.leg.color, metalness: 0.8, roughness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
    baseMesh.position.set(0, -arm1.height / 2 - arm2.height - base.leg.height / 2, 0);
    groupRef.current.add(baseMesh);

    return () => {
      arm1Geometry.dispose();
      arm1Material.dispose();
      arm2Geometry.dispose();
      arm2Material.dispose();
      baseGeometry.dispose();
      baseMaterial.dispose();
    };
  }, [arm1, arm2, base]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    animationTimeRef.current = time;
    
    if (arm1Ref.current) {
      arm1Ref.current.rotation.z = Math.sin(time) * 0.5;
    }
    if (arm2Ref.current) {
      arm2Ref.current.rotation.z = Math.sin(time + 0.5) * 0.5;
    }
  });

  useImperativeHandle(ref, () => ({
    update: () => {
      // بازوها قبلاً در useFrame به‌روز می‌شوند
    }
  }));

  return <group ref={groupRef} />;
});

RobotLeg.displayName = 'RobotLeg';