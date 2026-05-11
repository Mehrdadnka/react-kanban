// types/r3f.d.ts
/// <reference types="@react-three/fiber" />

declare module '@react-three/fiber' {
  interface ThreeElements {
    octahedronGeometry: Object3DNode<THREE.OctahedronGeometry, typeof THREE.OctahedronGeometry>
    sphereGeometry: Object3DNode<THREE.SphereGeometry, typeof THREE.SphereGeometry>
  }
}