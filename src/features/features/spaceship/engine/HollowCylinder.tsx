// components/HollowCylinder.tsx
import * as THREE from 'three';
import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';

interface HollowCylinderParams {
  outerRadius?: number;
  innerRadius?: number;
  height?: number;
  radialSegments?: number;
  color?: number;
  metalness?: number;
  roughness?: number;
}

export const useHollowCylinder = (params: HollowCylinderParams) => {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    const {
      outerRadius = 3,
      innerRadius = 1,
      height = 10,
      radialSegments = 8,
      color = 0x888888,
      metalness = 0.5,
      roughness = 0.3
    } = params;

    // تعریف شکل بیرونی استوانه
    const shape = new THREE.Shape();
    shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);

    // تعریف سوراخ داخلی
    const holePath = new THREE.Path();
    holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
    shape.holes.push(holePath);

    // تنظیمات اکسترود
    const extrudeSettings: THREE.ExtrudeGeometryOptions = {
      steps: 1,
      depth: height,
      bevelEnabled: false,
      curveSegments: radialSegments
    };

    // ایجاد هندسه استوانه توخالی
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -height / 2);
    geometry.computeVertexNormals();

    const material = new THREE.MeshStandardMaterial({
      color,
      metalness,
      roughness
    });

    if (meshRef.current) {
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
      meshRef.current.geometry = geometry;
      meshRef.current.material = material;
    }

    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [params]);

  return groupRef;
};

export const HollowCylinder: React.FC<HollowCylinderParams & { position?: [number, number, number]; rotation?: [number, number, number] }> = ({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  ...params
}) => {
  const {
    outerRadius = 3,
    innerRadius = 1,
    height = 10,
    radialSegments = 8,
    color = 0x888888,
    metalness = 0.5,
    roughness = 0.3
  } = params;

  const geometry = new THREE.ExtrudeGeometry(
    (() => {
      const shape = new THREE.Shape();
      shape.absarc(0, 0, outerRadius, 0, Math.PI * 2, false);
      const holePath = new THREE.Path();
      holePath.absarc(0, 0, innerRadius, 0, Math.PI * 2, true);
      shape.holes.push(holePath);
      return shape;
    })(),
    {
      steps: 1,
      depth: height,
      bevelEnabled: false,
      curveSegments: radialSegments
    }
  );

  geometry.translate(0, 0, -height / 2);
  geometry.computeVertexNormals();

  return (
    <mesh geometry={geometry} position={position} rotation={rotation}>
      <meshStandardMaterial color={color} metalness={metalness} roughness={roughness} />
    </mesh>
  );
};