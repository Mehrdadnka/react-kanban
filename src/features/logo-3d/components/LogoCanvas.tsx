// features/logo-3d/components/LogoCanvas.tsx
import { LogoScene } from './LogoScene'

type LogoCanvasProps = {
  size?: number
  className?: string
}

export const LogoCanvas = ({ size = 200, className = '' }: LogoCanvasProps) => {
  return (
    <div style={{ width: innerWidth, height: innerHeight - 50 }} className={className}>
      <LogoScene />
    </div>
  )
}