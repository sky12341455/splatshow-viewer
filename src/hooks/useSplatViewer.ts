import { useRef, useState, useCallback, useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { SparkRenderer, SplatMesh, SplatLoader } from '@sparkjsdev/spark'
import type { PackedSplats } from '@sparkjsdev/spark'
import type { ViewerState, EditMode } from '@/types'

interface UseSplatViewerOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>
  onProgress?: (progress: number) => void
  onLoadComplete?: (splatCount: number) => void
  onError?: (error: string) => void
}

export function useSplatViewer({
  canvasRef,
  onProgress,
  onLoadComplete,
  onError,
}: UseSplatViewerOptions) {
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const controlsRef = useRef<OrbitControls | null>(null)
  const sparkRef = useRef<SparkRenderer | null>(null)
  const splatMeshRef = useRef<SplatMesh | null>(null)
  const loaderRef = useRef<SplatLoader | null>(null)
  const defaultCameraPosRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 3, 8))
  const defaultTargetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const fpsDisplayRef = useRef<HTMLSpanElement | null>(null)

  const objectUrlRef = useRef<string | null>(null)

  const [state, setState] = useState<ViewerState>({
    isLoading: false,
    progress: 0,
    error: null,
    splatCount: 0,
    fps: 0,
    isWireframe: false,
    isFullscreen: false,
    showInfoPanel: false,
    editMode: 'view',
    selectedCount: 0,
  })

  const [currentModelName, setCurrentModelName] = useState('')

  const initScene = useCallback(() => {
    if (sceneRef.current) return

    const canvas = canvasRef.current
    if (!canvas) return

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' })
    renderer.setPixelRatio(dpr)
    renderer.setSize(window.innerWidth, window.innerHeight)
    rendererRef.current = renderer

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x0a0a0f)
    sceneRef.current = scene

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.01, 1000)
    camera.position.copy(defaultCameraPosRef.current)
    cameraRef.current = camera

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.08
    controls.target.copy(defaultTargetRef.current)
    controlsRef.current = controls

    const spark = new SparkRenderer({ renderer })
    scene.add(spark)
    sparkRef.current = spark

    let frameCount = 0
    let lastFpsUpdate = performance.now()

    renderer.setAnimationLoop(() => {
      if (controlsRef.current) controlsRef.current.update()
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
      frameCount++
      const now = performance.now()
      if (now - lastFpsUpdate >= 1000) {
        const fpsEl = fpsDisplayRef.current
        if (fpsEl) fpsEl.textContent = String(frameCount)
        setState((s) => ({ ...s, fps: frameCount }))
        frameCount = 0
        lastFpsUpdate = now
      }
    })

    const loader = new SplatLoader()
    loaderRef.current = loader

    let resizeRaf = 0
    window.addEventListener('resize', () => {
      cancelAnimationFrame(resizeRaf)
      resizeRaf = requestAnimationFrame(() => {
        if (!cameraRef.current || !rendererRef.current) return
        cameraRef.current.aspect = window.innerWidth / window.innerHeight
        cameraRef.current.updateProjectionMatrix()
        rendererRef.current.setSize(window.innerWidth, window.innerHeight)
      })
    })
  }, [canvasRef])

  const loadSplat = useCallback(
    async (url: string) => {
      initScene()

      if (!sceneRef.current) {
        const msg = 'Scene not initialized'
        setState((s) => ({ ...s, isLoading: false, error: msg }))
        onError?.(msg)
        return
      }

      if (splatMeshRef.current) {
        sceneRef.current.remove(splatMeshRef.current)
        splatMeshRef.current.dispose()
        splatMeshRef.current = null
      }

      setState((s) => ({ ...s, isLoading: true, progress: 0, error: null, splatCount: 0 }))

      try {
        const loader = loaderRef.current!
        const result = await loader.loadAsync(url, (event: ProgressEvent) => {
          if (event.lengthComputable && event.total > 0) {
            const pct = (event.loaded / event.total) * 100
            setState((s) => ({ ...s, progress: pct }))
            onProgress?.(pct)
          }
        })

        const splatMesh = loader.parse(result as PackedSplats)
        splatMesh.position.set(0, 0, 0)
        sceneRef.current.add(splatMesh)
        splatMeshRef.current = splatMesh

        await splatMesh.initialized

        const box = splatMesh.getBoundingBox()
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        const sphere = box.getBoundingSphere(new THREE.Sphere())

        console.log('=== MODEL BOUNDS ===')
        console.log(`Center: x=${center.x.toFixed(4)} y=${center.y.toFixed(4)} z=${center.z.toFixed(4)}`)
        console.log(`Size:   w=${size.x.toFixed(4)} h=${size.y.toFixed(4)} d=${size.z.toFixed(4)}`)
        console.log(`Radius: ${sphere.radius.toFixed(4)}`)
        const splatCount = splatMesh.splats?.getNumSplats() ?? 0
        console.log(`Splats: ${splatCount}`)
        console.log('====================')

        const camera = cameraRef.current
        const controls = controlsRef.current
        if (camera && controls) {
          const fovRad = (camera.fov * Math.PI) / 180
          const fitHeight = sphere.radius / Math.tan(fovRad / 2)
          const distance = Math.max(sphere.radius * 3, fitHeight * 1.3)
          camera.position.set(
            center.x + distance * 0.5,
            center.y + distance * 0.4,
            center.z + distance * 0.8,
          )
          controls.target.copy(center)
          controls.update()
          defaultCameraPosRef.current.copy(camera.position)
          defaultTargetRef.current.copy(center)
        }

        setState((s) => ({ ...s, isLoading: false, progress: 100, splatCount }))
        onProgress?.(100)
        onLoadComplete?.(splatCount)

        const spark = sparkRef.current
        const cam = cameraRef.current
        if (spark && sceneRef.current && cam) {
          await spark.update({ scene: sceneRef.current, camera: cam })
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('Load failed:', err)
        setState((s) => ({ ...s, isLoading: false, error: message }))
        onError?.(message)
      }
    },
    [initScene, onProgress, onLoadComplete, onError],
  )

  const resetView = useCallback(() => {
    const camera = cameraRef.current
    const controls = controlsRef.current
    if (!camera || !controls) return
    camera.position.copy(defaultCameraPosRef.current)
    controls.target.copy(defaultTargetRef.current)
    controls.update()
  }, [])

  const toggleWireframe = useCallback(() => {
    setState((s) => ({ ...s, isWireframe: !s.isWireframe }))
  }, [])

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.body.requestFullscreen().catch(() => {})
      setState((s) => ({ ...s, isFullscreen: true }))
    } else {
      document.exitFullscreen().catch(() => {})
      setState((s) => ({ ...s, isFullscreen: false }))
    }
  }, [])

  const toggleInfoPanel = useCallback(() => {
    setState((s) => ({ ...s, showInfoPanel: !s.showInfoPanel }))
  }, [])

  const setEditMode = useCallback((mode: EditMode) => {
    setState((s) => ({ ...s, editMode: mode }))
    const controls = controlsRef.current
    if (controls) {
      controls.enabled = mode === 'view'
    }
  }, [])

  const loadSplatFromFile = useCallback(
    async (file: File) => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      const url = URL.createObjectURL(file)
      objectUrlRef.current = url
      setCurrentModelName(file.name)
      await loadSplat(url)
    },
    [loadSplat],
  )

  useEffect(() => {
    initScene()
    return () => {
      if (rendererRef.current) {
        rendererRef.current.setAnimationLoop(null)
        rendererRef.current.dispose()
      }
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current)
        objectUrlRef.current = null
      }
      rendererRef.current = null
      sceneRef.current = null
      cameraRef.current = null
      controlsRef.current = null
      sparkRef.current = null
      splatMeshRef.current = null
      loaderRef.current = null
    }
  }, [initScene])

  return {
    state,
    currentModelName,
    loadSplat,
    loadSplatFromFile,
    resetView,
    toggleWireframe,
    toggleFullscreen,
    toggleInfoPanel,
    setEditMode,
    sceneRef,
    cameraRef,
    rendererRef,
    splatMeshRef,
    sparkRef,
    controlsRef,
    fpsDisplayRef,
  }
}