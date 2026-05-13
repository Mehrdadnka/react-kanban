// components/SpaceshipTail.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';

interface SpaceshipTailProps {
  position?: [number, number, number];
}

export interface SpaceshipTailRef {
  update: () => void;
  attachTo: (object: THREE.Group) => void;
  setPosition: (x: number, y: number, z: number) => void;
}

export const SpaceshipTail = forwardRef<SpaceshipTailRef, SpaceshipTailProps>(({
  position = [0, 0, 0]
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const finsRef = useRef<THREE.Group>(null);
  const particlesRef = useRef<THREE.Group>(null);
  const isThrustingRef = useRef(false);
  const thrustRef = useRef(0);
  
  const config = {
    animationSpeed: 0.18,
    maxTilt: Math.PI / 5,
    wave: {
      frequency: 0.025,
      amplitude: 0.2
    },
    colors: {
      primary: 0x1a2a50,
      accent: 0x2980b9,
      glow: 0x1a2a3a
    }
  };

  useEffect(() => {
    if (!groupRef.current) return;

    // ایجاد بدنه 8 وجهی اصلی
    const mainBodyGeometry = new THREE.CylinderGeometry(2.55, 1.0, 3.5, 16);
    const mainBodyMaterial = new THREE.MeshStandardMaterial({
      color: config.colors.primary,
      metalness: 0.95,
      roughness: 0.07,
      emissive: config.colors.glow,
      emissiveIntensity: 0.3
    });
    const mainBody = new THREE.Mesh(mainBodyGeometry, mainBodyMaterial);
    mainBody.rotation.x = Math.PI / 2;
    mainBody.position.set(0, 0, 0);
    groupRef.current.add(mainBody);

    // حلقه‌های ساختاری
    const ringGeometry = new THREE.TorusGeometry(1.3, 0.15, 8, 32);
    const ringMaterial = new THREE.MeshPhongMaterial({
      color: 0x34495e,
      emissive: 0x1a5276,
      emissiveIntensity: 0.7
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.5;
    mainBody.add(ring);

    // ایجاد بالچه‌های هشت‌گانه
    const finsGroup = new THREE.Group();
    const coneGeo = new THREE.ConeGeometry(0.8, 2.5, 4);
    const finGeometry = coneGeo;
    const finMaterial = new THREE.MeshStandardMaterial({
      color: config.colors.accent,
      metalness: 0.85,
      roughness: 0.1,
      side: THREE.DoubleSide
    });

    for (let i = 0; i < 8; i++) {
      const fin = new THREE.Mesh(finGeometry, finMaterial);
      const angle = (i / 8) * Math.PI * 2;
      const radius = 2.2;
      
      fin.position.set(
        Math.cos(angle) * radius,
        -3,
        Math.sin(angle) * radius
      );
      fin.rotation.set(Math.PI / 2, -angle, 0);
      
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(coneGeo),
        new THREE.LineBasicMaterial({ color: config.colors.glow })
      );
      fin.add(edges);
      finsGroup.add(fin);
    }
    groupRef.current.add(finsGroup);
    finsRef.current = finsGroup;

    // ایجاد سیستم ذرات
    const particlesGroup = new THREE.Group();
    const particleGeometry = new THREE.SphereGeometry(0.1, 6, 6);
    const particleMaterial = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      blending: THREE.AdditiveBlending
    });

    for (let i = 0; i < 24; i++) {
      const particle = new THREE.Mesh(particleGeometry, particleMaterial.clone());
      particle.visible = false;
      particlesGroup.add(particle);
    }
    groupRef.current.add(particlesGroup);
    particlesRef.current = particlesGroup;

    // تنظیم موقعیت
    groupRef.current.position.set(position[0], position[1], position[2]);

    // Cleanup
    return () => {
      mainBodyGeometry.dispose();
      mainBodyMaterial.dispose();
      ringGeometry.dispose();
      ringMaterial.dispose();
      coneGeo.dispose();
      finMaterial.dispose();
      particleGeometry.dispose();
      particleMaterial.dispose();
    };
  }, [position]);

  // انیمیشن ذرات
  const animateParticles = () => {
    if (!particlesRef.current) return;
    const speed = 0.8;
    const spread = 0.4;
    
    particlesRef.current.children.forEach((particle) => {
      const mesh = particle as THREE.Mesh;
      if (isThrustingRef.current && Math.random() < 0.2) {
        mesh.position.set(
          (Math.random() - 0.5) * spread,
          -5 + Math.random() * 0.5,
          (Math.random() - 0.5) * spread
        );
        mesh.visible = true;
      }
      
      if (mesh.visible) {
        mesh.position.y -= speed;
        if ((mesh.material as THREE.MeshBasicMaterial).opacity) {
          (mesh.material as THREE.MeshBasicMaterial).opacity! -= 0.03;
        }
        
        if (mesh.position.y < -8) {
          mesh.visible = false;
          if ((mesh.material as THREE.MeshBasicMaterial).opacity) {
            (mesh.material as THREE.MeshBasicMaterial).opacity = 1;
          }
        }
      }
    });
  };

  useFrame(() => {
    // به‌روزرسانی سطح پیشران
    thrustRef.current = THREE.MathUtils.lerp(
      thrustRef.current,
      isThrustingRef.current ? 1 : 0,
      config.animationSpeed
    );

    const time = Date.now();
    const wave = Math.sin(time * config.wave.frequency) * 
                 config.wave.amplitude * 
                 thrustRef.current;

    // نورپردازی پویا
    groupRef.current?.traverse(child => {
      const mesh = child as THREE.Mesh;
      if (mesh.material && 'emissiveIntensity' in mesh.material) {
        const material = mesh.material as THREE.MeshStandardMaterial;
        material.emissiveIntensity = 0.3 + thrustRef.current * 0.7;
      }
    });

    // انیمیشن ذرات
    animateParticles();
  });

  useImperativeHandle(ref, () => ({
    update: () => {
      // متد update برای سازگاری با بقیه کامپوننت‌ها
    },
    attachTo: (object: THREE.Group) => {
      if (groupRef.current) {
        object.add(groupRef.current);
      }
    },
    setPosition: (x: number, y: number, z: number) => {
      if (groupRef.current) {
        groupRef.current.position.set(x, y, z);
      }
    }
  }));

  return <group ref={groupRef} />;
});

SpaceshipTail.displayName = 'SpaceshipTail';