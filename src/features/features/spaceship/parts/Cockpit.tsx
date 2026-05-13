// components/Cockpit.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';

interface CockpitProps {
  position?: [number, number, number];
  rotation?: [number, number, number];
  scale?: [number, number, number];
}

export interface CockpitRef {
  setPosition: (x: number, y: number, z: number) => void;
  rotate: (x: number, y: number, z: number) => void;
  scale: (x: number, y: number, z: number) => void;
  addTo: (parent: THREE.Group) => void;
  update: (time: number) => void;
}

export const Cockpit = forwardRef<CockpitRef, CockpitProps>(({
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  scale = [1, 1, 1]
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const cockpitMeshRef = useRef<THREE.Mesh>(null);
  const glassMeshRef = useRef<THREE.Mesh>(null);
  const controlPanelRef = useRef<THREE.Mesh>(null);
  const holoDisplayRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    if (!groupRef.current) return;

    // بدنه اصلی کابین
    const geometry = new THREE.CylinderGeometry(1.5, 2.5, 3, 16, 4, true);
    geometry.scale(1, 0.8, 1);
    const material = new THREE.MeshStandardMaterial({
      color: 0x1a2a3a,
      metalness: 0.9,
      roughness: 0.3,
      side: THREE.DoubleSide
    });
    const cockpitMesh = new THREE.Mesh(geometry, material);
    cockpitMesh.rotation.y = -Math.PI / 7;
    cockpitMesh.castShadow = true;
    groupRef.current.add(cockpitMesh);
    cockpitMeshRef.current = cockpitMesh;

    // شیشه جلو
    const glassGeometry = new THREE.SphereGeometry(2.2, 32, 16, 0, Math.PI * 2, 0, Math.PI / 3);
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x88ccff,
      transmission: 0.9,
      roughness: 0.1,
      metalness: 0.2,
      ior: 1.5,
      thickness: 0.1,
      envMapIntensity: 1,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8
    });
    const glassMesh = new THREE.Mesh(glassGeometry, glassMaterial);
    glassMesh.position.set(0, -1, 0);
    groupRef.current.add(glassMesh);
    glassMeshRef.current = glassMesh;

    // پنجره‌های جانبی
    const windowShape = new THREE.Shape();
    windowShape.moveTo(-0.4, -0.3);
    windowShape.lineTo(0.4, -0.3);
    windowShape.lineTo(0.5, 0.3);
    windowShape.lineTo(-0.5, 0.3);
    windowShape.lineTo(-0.4, -0.3);
    
    const windowGeometry = new THREE.ExtrudeGeometry(windowShape, {
      depth: 0.1,
      bevelEnabled: false
    });
    const windowMaterial = new THREE.MeshStandardMaterial({
      color: 0x000000,
      emissive: 0x2255aa,
      emissiveIntensity: 0.5,
      metalness: 0.8,
      roughness: 0.2
    });

    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const radius = 2.2;
      const x = Math.cos(angle) * radius * 0.8;
      const z = Math.sin(angle) * radius * 0.8;
      
      const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
      windowMesh.position.set(x, 0.2, z);
      windowMesh.lookAt(groupRef.current.position);
      windowMesh.rotation.y += Math.PI;
      groupRef.current.add(windowMesh);
    }

    // پنل کنترل
    const panelGeometry = new THREE.BoxGeometry(2, 0.5, 0.3);
    const panelMaterial = new THREE.MeshStandardMaterial({
      color: 0x111122,
      metalness: 0.95,
      roughness: 0.1
    });
    const controlPanel = new THREE.Mesh(panelGeometry, panelMaterial);
    controlPanel.position.set(0, -0.8, -0.9);
    groupRef.current.add(controlPanel);
    controlPanelRef.current = controlPanel;

    // دکمه‌ها
    const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.05, 16);
    const buttonMaterial = new THREE.MeshStandardMaterial({
      color: 0xaa0000,
      emissive: 0xff0000,
      emissiveIntensity: 0.3
    });
    
    for (let i = 0; i < 12; i++) {
      const button = new THREE.Mesh(buttonGeometry, buttonMaterial);
      button.position.set(
        -0.8 + (i % 6) * 0.3,
        -0.6,
        -0.65 - Math.floor(i / 6) * 0.1
      );
      groupRef.current.add(button);
    }

    // صفحه نمایش‌ها
    const screenGeometry = new THREE.PlaneGeometry(0.4, 0.3);
    const screenMaterial = new THREE.MeshStandardMaterial({
      color: 0x000011,
      emissive: 0x00aaff,
      emissiveIntensity: 0.7
    });
    
    const leftScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    leftScreen.position.set(-0.5, -0.6, -0.7);
    leftScreen.rotation.y = Math.PI / 8;
    groupRef.current.add(leftScreen);
    
    const rightScreen = new THREE.Mesh(screenGeometry, screenMaterial);
    rightScreen.position.set(0.5, -0.6, -0.7);
    rightScreen.rotation.y = -Math.PI / 8;
    groupRef.current.add(rightScreen);

    // جزئیات خطوط
    const lineGeometry = new THREE.TorusGeometry(2.3, 0.02, 8, 32, Math.PI);
    const lineMaterial = new THREE.MeshStandardMaterial({
      color: 0x445566,
      emissive: 0x00aaff,
      emissiveIntensity: 0.2,
      metalness: 0.9,
      roughness: 0.1
    });
    
    const topLine = new THREE.Mesh(lineGeometry, lineMaterial);
    topLine.position.y = -0.7;
    topLine.rotation.x = Math.PI / 2;
    groupRef.current.add(topLine);

    // دریچه تهویه
    const ventGeometry = new THREE.BoxGeometry(0.4, 0.1, 0.8);
    const ventMaterial = new THREE.MeshStandardMaterial({
      color: 0x222233,
      metalness: 0.8,
      roughness: 0.3
    });
    const vent = new THREE.Mesh(ventGeometry, ventMaterial);
    vent.position.set(0, -1.2, -1.5);
    groupRef.current.add(vent);

    // نمایشگر هولوگرافیک
    const holoGeometry = new THREE.ConeGeometry(0.3 * 1.2, 0.5 * 1.2, 4 * 1.2);
    const holoMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.8,
      transparent: true,
      opacity: 0.7
    });
    const holoDisplay = new THREE.Mesh(holoGeometry, holoMaterial);
    holoDisplay.position.set(0, -0.4, -0.5);
    holoDisplay.rotation.x = Math.PI / 2;
    groupRef.current.add(holoDisplay);
    holoDisplayRef.current = holoDisplay;

    // پرتوهای هولوگرافیک
    const beamGeometry = new THREE.CylinderGeometry(0.05, 0.2, 0.8, 8);
    const beamMaterial = new THREE.MeshStandardMaterial({
      color: 0x00ffff,
      emissive: 0x00ffff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.4
    });
    const beam = new THREE.Mesh(beamGeometry, beamMaterial);
    beam.position.set(0, -0.8, -0.5);
    groupRef.current.add(beam);

    // تنظیم موقعیت، چرخش و مقیاس
    groupRef.current.position.set(position[0], position[1], position[2]);
    groupRef.current.rotation.set(rotation[0], rotation[1], rotation[2]);
    groupRef.current.scale.set(scale[0], scale[1], scale[2]);

    // Cleanup
    return () => {
      geometry.dispose();
      material.dispose();
      glassGeometry.dispose();
      glassMaterial.dispose();
      windowGeometry.dispose();
      windowMaterial.dispose();
      panelGeometry.dispose();
      panelMaterial.dispose();
      buttonGeometry.dispose();
      buttonMaterial.dispose();
      screenGeometry.dispose();
      screenMaterial.dispose();
      lineGeometry.dispose();
      lineMaterial.dispose();
      ventGeometry.dispose();
      ventMaterial.dispose();
      holoGeometry.dispose();
      holoMaterial.dispose();
      beamGeometry.dispose();
      beamMaterial.dispose();
    };
  }, [position, rotation, scale]);

  useFrame(({ clock }) => {
    const time = clock.getElapsedTime();
    if (holoDisplayRef.current) {
      holoDisplayRef.current.rotation.z = time * 0.5;
    }
  });

  useImperativeHandle(ref, () => ({
    setPosition: (x: number, y: number, z: number) => {
      if (groupRef.current) {
        groupRef.current.position.set(x, y, z);
      }
    },
    rotate: (x: number, y: number, z: number) => {
      if (groupRef.current) {
        groupRef.current.rotation.set(x, y, z);
      }
    },
    scale: (x: number, y: number, z: number) => {
      if (groupRef.current) {
        groupRef.current.scale.set(x, y, z);
      }
    },
    addTo: (parent: THREE.Group) => {
      if (groupRef.current) {
        parent.add(groupRef.current);
      }
    },
    update: (time: number) => {
      if (holoDisplayRef.current) {
        holoDisplayRef.current.rotation.z = time * 0.5;
      }
    }
  }));

  return <group ref={groupRef} />;
});

Cockpit.displayName = 'Cockpit';