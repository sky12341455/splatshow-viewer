import { useRef, useEffect } from 'react'

interface SplatCanvasProps {
  onCanvasReady: (canvas: HTMLCanvasElement) => void
}

export function SplatCanvas({ onCanvasReady }: SplatCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      onCanvasReady(canvasRef.current)
    }
  }, [onCanvasReady])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full block"
      style={{ touchAction: 'none' }}
    />
  )
}