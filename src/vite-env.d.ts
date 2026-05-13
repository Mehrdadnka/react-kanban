/// <reference types="vite/client" />

declare module '@react-three/fiber' {
  export * from '@react-three/fiber/dist/declarations/src/index'
  export const Canvas: any
  export const useFrame: any
  export const useThree: any
}