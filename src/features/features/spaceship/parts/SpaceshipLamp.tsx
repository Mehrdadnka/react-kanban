// components/SpaceshipLamp.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';

type LampState = 'idle' | 'warning' | 'landing' | 'flight' | 'jet' | 'allJets';

interface SpaceshipLampProps {
  position?: [number, number, number];
  color?: number;
  size?: number;
  initialState?: LampState;
}

export interface SpaceshipLampRef {
  setState: (newState: LampState) => void;
  update: (deltaTime: number) => void;
  getObject3D: () => THREE.Mesh | null;
  setPosition: (x: number, y: number, z: number) => void;
}

export const SpaceshipLamp = forwardRef<SpaceshipLampRef, SpaceshipLampProps>(({
  position = [0, 0, 0],
  color = 0xff0000,
  size = 0.1,
  initialState = 'idle'
}, ref) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const stateRef = useRef<LampState>(initialState);
  const clockRef = useRef(0);
  
  const blinkSpeedRef = useRef(1);
  const intensityOn = 1.5;
  const intensityOff = 0.2;

  // تنظیم وضعیت لامپ
  const setState = (newState: LampState) => {
    stateRef.current = newState;
    if (!meshRef.current?.material) return;
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    switch (newState) {
      case 'idle':
        blinkSpeedRef.current = 1;
        material.emissive.setHex(0xff000f);
        break;
      case 'warning':
        blinkSpeedRef.current = 5;
        material.emissive.setHex(0xfff900);
        break;
      case 'landing':
        blinkSpeedRef.current = 2;
        material.emissive.setHex(0xffff00);
        break;
      case 'flight':
        blinkSpeedRef.current = 3;
        material.emissive.setHex(0x00ff00);
        break;
      case 'jet':
        blinkSpeedRef.current = 7;
        material.emissive.setHex(0xffaaff);
        break;
      case 'allJets':
        blinkSpeedRef.current = 10;
        material.emissive.setHex(0xffffff);
        break;
    }
  };

  useEffect(() => {
    if (!meshRef.current) return;
    
    meshRef.current.position.set(position[0], position[1], position[2]);
    setState(initialState);

    return () => {
      if (meshRef.current?.material) {
        (meshRef.current.material as THREE.Material).dispose();
      }
    };
  }, [position, initialState]);

  useFrame(({ clock }) => {
    if (!meshRef.current?.material) return;
    
    const deltaTime = clock.getDelta();
    clockRef.current += deltaTime * blinkSpeedRef.current;
    const blink = Math.abs(Math.sin(clockRef.current)) > 0.5;
    
    const material = meshRef.current.material as THREE.MeshStandardMaterial;
    material.emissiveIntensity = blink ? intensityOn : intensityOff;
  });

  useImperativeHandle(ref, () => ({
    setState,
    update: (deltaTime: number) => {
      clockRef.current += deltaTime * blinkSpeedRef.current;
      const blink = Math.abs(Math.sin(clockRef.current)) > 0.5;
      if (meshRef.current?.material) {
        const material = meshRef.current.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = blink ? intensityOn : intensityOff;
      }
    },
    getObject3D: () => meshRef.current,
    setPosition: (x: number, y: number, z: number) => {
      if (meshRef.current) {
        meshRef.current.position.set(x, y, z);
      }
    }
  }));

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[size, 16, 16]} />
      <meshStandardMaterial 
        color={color} 
        emissive={color} 
        emissiveIntensity={0.5} 
      />
    </mesh>
  );
});

SpaceshipLamp.displayName = 'SpaceshipLamp';