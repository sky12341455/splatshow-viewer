import { useState, useRef, useCallback, useEffect } from 'react'

export function useFPS() {
  const [fps, setFps] = useState(0)
  const framesRef = useRef(0)
  const lastTimeRef = useRef(performance.now())
  const rafRef = useRef<number>(0)

  const tick = useCallback(() => {
    framesRef.current++
    const now = performance.now()
    const delta = now - lastTimeRef.current
    if (delta >= 1000) {
      setFps(Math.round((framesRef.current * 1000) / delta))
      framesRef.current = 0
      lastTimeRef.current = now
    }
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  useEffect(() => {
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [tick])

  return fps
}