// features/logo-3d/context/ShipContext.tsx
import { createContext, useContext, useRef, ReactNode } from 'react'
import * as THREE from 'three'

interface ShipContextType {
  shipRef: React.RefObject<THREE.Group>
}

const ShipContext = createContext<ShipContextType | null>(null)

export const useShip = () => {
  const ctx = useContext(ShipContext)
  if (!ctx) throw new Error('useShip must be used within ShipProvider')
  return ctx
}

export const ShipProvider = ({ children }: { children: ReactNode }) => {
  const shipRef = useRef<THREE.Group>(null!)
  return (
    <ShipContext.Provider value={{ shipRef }}>
      {children}
    </ShipContext.Provider>
  )
}