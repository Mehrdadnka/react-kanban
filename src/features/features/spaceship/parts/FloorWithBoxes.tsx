// components/FloorWithBoxes.tsx
import * as THREE from 'three';
import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useFrame } from '@react-three/fiber';
import { RobotLeg, RobotLegRef } from './RobotLeg';

interface FloorWithBaseBoxesParams {
  floorWidth?: number;
  floorDepth?: number;
  floorHeight?: number;
  floorColor?: number;
  baseBoxWidth?: number;
  baseBoxDepth?: number;
  baseBoxHeight?: number;
  baseBoxColor?: number;
  doorColor?: number;
  doorThickness?: number;
  position?: [number, number, number];
}

export interface FloorWithBaseBoxesRef {
  updateBaseDoor: (deltaTime: number, open: boolean, box: THREE.Group) => void;
}

export const FloorWithBaseBoxes = forwardRef<FloorWithBaseBoxesRef, FloorWithBaseBoxesParams>(({
  floorWidth = 2,
  floorDepth = 0.7,
  floorHeight = 8,
  floorColor = 0x999999,
  baseBoxWidth = 2,
  baseBoxDepth = 0.5,
  baseBoxHeight = 2,
  baseBoxColor = 0x999999,
  doorColor = 0x999999,
  position = [0, 0, 0]
}, ref) => {
  const groupRef = useRef<THREE.Group>(null);
  const floorRef = useRef<THREE.Mesh>(null);
  const leftBaseBoxRef = useRef<THREE.Group>(null);
  const rightBaseBoxRef = useRef<THREE.Group>(null);
  const leftRoboticArmRef = useRef<RobotLegRef>(null);
  const rightRoboticArmRef = useRef<RobotLegRef>(null);

  // تابع ایجاد باکس پایه
  const createBaseBox = (side: 'left' | 'right'): THREE.Group => {
    const group = new THREE.Group();
    const w = baseBoxWidth;
    const h = baseBoxHeight;
    const d = baseBoxDepth;
    const boxMat = new THREE.MeshStandardMaterial({ 
      color: baseBoxColor, 
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.3 
    });

    // کف باکس
    const bottomGeom = new THREE.PlaneGeometry(w, d);
    const bottomMesh = new THREE.Mesh(bottomGeom, boxMat);
    bottomMesh.rotation.x = -Math.PI / 2;
    bottomMesh.position.y = 0;
    group.add(bottomMesh);

    // سقف باکس
    const topGeom = new THREE.PlaneGeometry(w, d);
    const topMesh = new THREE.Mesh(topGeom, boxMat);
    topMesh.rotation.x = Math.PI / 2;
    topMesh.position.y = h;
    group.add(topMesh);

    // دیوار پشت
    const backGeom = new THREE.PlaneGeometry(w, h);
    const backMesh = new THREE.Mesh(backGeom, boxMat);
    backMesh.position.set(0, h / 2, -d / 2);
    group.add(backMesh);

    // دیوار سمت چپ
    const leftGeom = new THREE.PlaneGeometry(d, h);
    const leftMesh = new THREE.Mesh(leftGeom, boxMat);
    leftMesh.rotation.y = Math.PI / 2;
    leftMesh.position.set(-w / 2, h / 2, 0);
    group.add(leftMesh);

    // دیوار سمت راست
    const rightGeom = new THREE.PlaneGeometry(d, h);
    const rightMesh = new THREE.Mesh(rightGeom, boxMat);
    rightMesh.rotation.y = -Math.PI / 2;
    rightMesh.position.set(w / 2, h / 2, 0);
    group.add(rightMesh);

    // در جلو
    const doorPivot = new THREE.Group();
    const doorGeom = new THREE.PlaneGeometry(w, h);
    const doorMat = new THREE.MeshStandardMaterial({ 
      color: doorColor, 
      side: THREE.DoubleSide,
      metalness: 0.8,
      roughness: 0.3 
    });
    const doorMesh = new THREE.Mesh(doorGeom, doorMat);
    doorMesh.position.set(w / 2, h / 2, 0.25);
    doorMesh.rotation.y = Math.PI;
    group.add(doorMesh);

    // ذخیره در برای انیمیشن
    (group as any).userData = { doorMesh, currentDoorAngle: Math.PI };

    // اضافه کردن بازوی رباتیک برای سمت چپ
    if (side === 'left') {
      const robotLegGroup = new THREE.Group();
      backMesh.add(robotLegGroup);
      // RobotLeg از طریق ref بعداً اضافه می‌شود
    }

    return group;
  };

  useEffect(() => {
    if (!groupRef.current) return;

    // ایجاد کف اصلی
    const floorGeom = new THREE.BoxGeometry(floorWidth, floorHeight, floorDepth);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: floorColor,
      metalness: 0.8,
      roughness: 0.3 
    });
    const floor = new THREE.Mesh(floorGeom, floorMat);
    groupRef.current.add(floor);
    floorRef.current = floor;

    // ایجاد باکس‌های پایه
    const leftBaseBox = createBaseBox('left');
    const rightBaseBox = createBaseBox('right');

    const baseBoxY = floorHeight / 2;
    leftBaseBox.position.set(-floorWidth / 4 + 0.5, baseBoxY, -baseBoxDepth + 0.4);
    rightBaseBox.position.set(floorWidth / 4 - 0.5, -baseBoxY - 2, -baseBoxDepth + 0.4);

    floor.add(leftBaseBox);
    floor.add(rightBaseBox);
    leftBaseBoxRef.current = leftBaseBox;
    rightBaseBoxRef.current = rightBaseBox;

    // تنظیم موقعیت
    groupRef.current.position.set(position[0], position[1], position[2]);

    // Cleanup
    return () => {
      floorGeom.dispose();
      floorMat.dispose();
    };
  }, [floorWidth, floorHeight, floorDepth, floorColor, baseBoxWidth, baseBoxDepth, baseBoxHeight, baseBoxColor, doorColor, position]);

  useFrame(({ clock }) => {
    // به‌روزرسانی بازوهای رباتیک
    if (leftRoboticArmRef.current) {
      leftRoboticArmRef.current.update();
    }
    if (rightRoboticArmRef.current) {
      rightRoboticArmRef.current.update();
    }
  });

  useImperativeHandle(ref, () => ({
    updateBaseDoor: (deltaTime: number, open: boolean, box: THREE.Group) => {
      const targetAngle = open ? -Math.PI / 2 : Math.PI;
      const userData = (box as any).userData;
      if (userData) {
        userData.currentDoorAngle = THREE.MathUtils.lerp(userData.currentDoorAngle, targetAngle, 0.1);
        if (userData.doorMesh) {
          userData.doorMesh.rotation.y = userData.currentDoorAngle;
        }
      }
    }
  }));

  return (
    <group ref={groupRef}>
      {/* RobotLeg components will be added dynamically */}
    </group>
  );
});

FloorWithBaseBoxes.displayName = 'FloorWithBaseBoxes';