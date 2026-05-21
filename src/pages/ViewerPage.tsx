import { useCallback, useRef, useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import * as THREE from 'three'
import { TransformControls } from 'three/addons/controls/TransformControls.js'
import { SplatCanvas } from '@/components/viewer/SplatCanvas'
import { ViewerToolbar } from '@/components/viewer/ViewerToolbar'
import { InfoPanel } from '@/components/viewer/InfoPanel'
import { ProgressBar } from '@/components/viewer/ProgressBar'
import { FileDropZone, useFileInput } from '@/components/viewer/FileDropZone'
import { useSplatViewer } from '@/hooks/useSplatViewer'
import { DEFAULT_MODEL_URL, DEFAULT_MODEL_NAME } from '@/types'
import type { EditMode, AnnotationPoint } from '@/types'

interface EditAction {
  type: 'select' | 'delete' | 'move' | 'annotate' | 'annotate-delete'
  data: unknown
  timestamp: number
}

const ANNOTATION_COLORS = [0xff6b6b, 0x4ecdc4, 0x45b7d1, 0xf9ca24, 0xa55eea, 0x26de81, 0xfd9644, 0xfc5c65, 0x2bcbba, 0xeb3b5a]

function createAnnotationSprite(text: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'rgba(10, 10, 15, 0.85)'
  ctx.beginPath()
  ctx.roundRect(8, 4, 240, 56, 12)
  ctx.fill()
  ctx.strokeStyle = 'rgba(0, 210, 255, 0.5)'
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.roundRect(8, 4, 240, 56, 12)
  ctx.stroke()
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 20px "Noto Sans SC", sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  const maxWidth = 220
  let displayText = text
  while (ctx.measureText(displayText).width > maxWidth && displayText.length > 1) {
    displayText = displayText.slice(0, -1)
  }
  if (displayText !== text) displayText += '…'
  ctx.fillText(displayText, 128, 32)

  const texture = new THREE.CanvasTexture(canvas)
  texture.minFilter = THREE.LinearFilter
  texture.magFilter = THREE.LinearFilter
  const material = new THREE.SpriteMaterial({ map: texture, transparent: true, depthTest: false, depthWrite: false })
  const sprite = new THREE.Sprite(material)
  sprite.scale.set(2, 0.5, 1)
  sprite.userData.labelText = text
  return sprite
}

function createAnnotationMarker(color: number, radius: number): THREE.Mesh {
  const geo = new THREE.SphereGeometry(radius, 12, 12)
  const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.1, emissive: color, emissiveIntensity: 0.3 })
  const marker = new THREE.Mesh(geo, mat)
  return marker
}

export default function ViewerPage() {
  const [searchParams] = useSearchParams()
  const sogUrl = searchParams.get('src') || DEFAULT_MODEL_URL
  const modelName = searchParams.get('name') || DEFAULT_MODEL_NAME

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [canvasReady, setCanvasReady] = useState(false)
  const loadedRef = useRef(false)

  const raycasterRef = useRef(new THREE.Raycaster())
  const mouseRef = useRef(new THREE.Vector2())
  const selectionGroupRef = useRef<THREE.Group>(new THREE.Group())
  const annotationGroupRef = useRef<THREE.Group>(new THREE.Group())
  const transformControlsRef = useRef<TransformControls | null>(null)
  const undoStackRef = useRef<EditAction[]>([])
  const redoStackRef = useRef<EditAction[]>([])
  const [selectedCount, setSelectedCount] = useState(0)
  const [deletedCount, setDeletedCount] = useState(0)
  const [annotations, setAnnotations] = useState<AnnotationPoint[]>([])
  const [pendingAnnotation, setPendingAnnotation] = useState<{
    screenX: number
    screenY: number
    position: THREE.Vector3
  } | null>(null)
  const [annotationInput, setAnnotationInput] = useState('')
  const annotationInputRef = useRef<HTMLInputElement>(null)

  const handleCanvasReady = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas
    setCanvasReady(true)
  }, [])

  const {
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
    controlsRef,
    fpsDisplayRef,
  } = useSplatViewer({
    canvasRef,
    onProgress: () => {},
    onLoadComplete: () => {},
    onError: () => {},
  })

  const displayModelName = currentModelName || modelName

  useEffect(() => {
    if (canvasReady && !loadedRef.current) {
      loadedRef.current = true
      loadSplat(sogUrl)
    }
  }, [canvasReady, sogUrl, loadSplat])

  useEffect(() => {
    const scene = sceneRef.current
    const selGroup = selectionGroupRef.current
    selGroup.name = 'selection-group'
    if (scene && !scene.children.includes(selGroup)) {
      scene.add(selGroup)
    }
    const annGroup = annotationGroupRef.current
    annGroup.name = 'annotation-group'
    if (scene && !scene.children.includes(annGroup)) {
      scene.add(annGroup)
    }
    return () => {
      if (scene) {
        if (selGroup.parent === scene) scene.remove(selGroup)
        if (annGroup.parent === scene) scene.remove(annGroup)
      }
    }
  }, [])

  useEffect(() => {
    const renderer = rendererRef.current
    const scene = sceneRef.current
    const camera = cameraRef.current
    if (!renderer || !scene || !camera) return

    const ambient = new THREE.AmbientLight(0xffffff, 0.4)
    scene.add(ambient)
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.3)
    dirLight.position.set(5, 10, 5)
    scene.add(dirLight)

    const tc = new TransformControls(camera, renderer.domElement)
    transformControlsRef.current = tc

    tc.addEventListener('dragging-changed', (event) => {
      if (controlsRef.current) controlsRef.current.enabled = !event.value
    })

    return () => {
      tc.detach()
      tc.dispose()
      transformControlsRef.current = null
      scene.remove(ambient)
      scene.remove(dirLight)
    }
  }, [rendererRef, sceneRef, cameraRef])

  useEffect(() => {
    if (pendingAnnotation && annotationInputRef.current) {
      annotationInputRef.current.focus()
    }
  }, [pendingAnnotation])

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      if (files.length > 0) {
        loadSplatFromFile(files[0])
      }
    },
    [loadSplatFromFile],
  )

  const { openFileDialog } = useFileInput(handleFilesSelected)

  const updateSelectedCount = useCallback(() => {
    setSelectedCount(selectionGroupRef.current.children.length)
  }, [])

  const getMarkerSize = useCallback(() => {
    const splatMesh = splatMeshRef.current
    if (!splatMesh) return 0.08
    const box = splatMesh.getBoundingBox()
    const sphere = box.getBoundingSphere(new THREE.Sphere())
    return sphere.radius * 0.015
  }, [splatMeshRef])

  const createMarker = useCallback(
    (position: THREE.Vector3, color: number, opacity = 1, wireframe = true) => {
      const size = getMarkerSize()
      const geo = new THREE.SphereGeometry(size, 8, 8)
      const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity, wireframe, depthTest: true })
      const marker = new THREE.Mesh(geo, mat)
      marker.position.copy(position)
      marker.userData.isMarker = true
      return marker
    },
    [getMarkerSize],
  )

  const pushUndo = useCallback((action: EditAction) => {
    undoStackRef.current.push(action)
    if (undoStackRef.current.length > 50) {
      undoStackRef.current.shift()
    }
    redoStackRef.current = []
  }, [])

  const addAnnotationToScene = useCallback(
    (annotation: AnnotationPoint) => {
      const size = getMarkerSize() * 2.5
      const color = annotation.color
      const marker = createAnnotationMarker(color, size)
      marker.position.set(annotation.position.x, annotation.position.y, annotation.position.z)
      marker.userData.isAnnotation = true
      marker.userData.annotationId = annotation.id

      const sprite = createAnnotationSprite(annotation.label)
      sprite.position.set(annotation.position.x, annotation.position.y + size * 2.5, annotation.position.z)
      sprite.userData.isAnnotationLabel = true
      sprite.userData.annotationId = annotation.id

      const group = annotationGroupRef.current
      group.add(marker)
      group.add(sprite)
    },
    [getMarkerSize],
  )

  const removeAnnotationFromScene = useCallback((annotationId: string) => {
    const group = annotationGroupRef.current
    const toRemove: THREE.Object3D[] = []
    group.traverse((child) => {
      if (child.userData?.annotationId === annotationId) {
        toRemove.push(child)
      }
    })
    toRemove.forEach((obj) => {
      group.remove(obj)
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose()
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose())
        } else {
          obj.material.dispose()
        }
      }
      if (obj instanceof THREE.Sprite) {
        obj.material.map?.dispose()
        obj.material.dispose()
      }
    })
  }, [])

  const confirmAnnotation = useCallback(() => {
    if (!pendingAnnotation || !annotationInput.trim()) {
      setPendingAnnotation(null)
      setAnnotationInput('')
      return
    }

    const label = annotationInput.trim()
    const colorIdx = annotations.length % ANNOTATION_COLORS.length
    const newAnnotation: AnnotationPoint = {
      id: `ann-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      position: {
        x: pendingAnnotation.position.x,
        y: pendingAnnotation.position.y,
        z: pendingAnnotation.position.z,
      },
      label,
      color: ANNOTATION_COLORS[colorIdx],
    }

    addAnnotationToScene(newAnnotation)
    const newAnnotations = [...annotations, newAnnotation]
    setAnnotations(newAnnotations)

    pushUndo({
      type: 'annotate',
      data: newAnnotation,
      timestamp: Date.now(),
    })

    setPendingAnnotation(null)
    setAnnotationInput('')
  }, [pendingAnnotation, annotationInput, annotations, addAnnotationToScene, pushUndo])

  const cancelAnnotation = useCallback(() => {
    setPendingAnnotation(null)
    setAnnotationInput('')
  }, [])

  const deleteAnnotation = useCallback(
    (annotationId: string) => {
      const idx = annotations.findIndex((a) => a.id === annotationId)
      if (idx === -1) return
      const removed = annotations[idx]
      removeAnnotationFromScene(annotationId)
      const newAnnotations = annotations.filter((a) => a.id !== annotationId)
      setAnnotations(newAnnotations)
      pushUndo({
        type: 'annotate-delete',
        data: removed,
        timestamp: Date.now(),
      })
    },
    [annotations, removeAnnotationFromScene, pushUndo],
  )

  const handleUndo = useCallback(() => {
    const stack = undoStackRef.current
    if (stack.length === 0) return

    const action = stack.pop()!
    redoStackRef.current.push(action)

    if (action.type === 'select') {
      const group = selectionGroupRef.current
      if (group.children.length > 0) {
        const removed = group.children[group.children.length - 1]
        group.remove(removed)
        ;(removed as THREE.Mesh).geometry?.dispose()
        ;(removed as THREE.Mesh).material instanceof THREE.Material &&
          ((removed as THREE.Mesh).material as THREE.Material).dispose()
        updateSelectedCount()
      }
    } else if (action.type === 'delete') {
      const scene = sceneRef.current
      if (!scene) return
      const markersToRemove: THREE.Object3D[] = []
      scene.traverse((child) => {
        if ((child as THREE.Mesh).userData?.isDeleted && (child as THREE.Mesh).userData?.undoId === (action.data as any)?.id) {
          markersToRemove.push(child)
        }
      })
      markersToRemove.forEach((m) => {
        scene.remove(m)
        ;(m as THREE.Mesh).geometry?.dispose()
        ;(m as THREE.Mesh).material instanceof THREE.Material &&
          ((m as THREE.Mesh).material as THREE.Material).dispose()
      })
      setDeletedCount((c) => Math.max(0, c - markersToRemove.length))
    } else if (action.type === 'annotate') {
      const ann = action.data as AnnotationPoint
      removeAnnotationFromScene(ann.id)
      setAnnotations((prev) => prev.filter((a) => a.id !== ann.id))
    } else if (action.type === 'annotate-delete') {
      const ann = action.data as AnnotationPoint
      addAnnotationToScene(ann)
      setAnnotations((prev) => [...prev, ann])
    }
  }, [updateSelectedCount, sceneRef, removeAnnotationFromScene, addAnnotationToScene])

  const handleRedo = useCallback(() => {
    const stack = redoStackRef.current
    if (stack.length === 0) return

    const action = stack.pop()!
    undoStackRef.current.push(action)

    if (action.type === 'select') {
      const data = action.data as { x: number; y: number; z: number }
      const marker = createMarker(new THREE.Vector3(data.x, data.y, data.z), 0x44ff44)
      selectionGroupRef.current.add(marker)
      updateSelectedCount()
    } else if (action.type === 'delete') {
      const data = action.data as { x: number; y: number; z: number; id: string }
      const marker = createMarker(new THREE.Vector3(data.x, data.y, data.z), 0xff0000, 0.6, false)
      marker.userData.isDeleted = true
      marker.userData.undoId = data.id
      sceneRef.current?.add(marker)
      setDeletedCount((c) => c + 1)
    } else if (action.type === 'annotate') {
      const ann = action.data as AnnotationPoint
      addAnnotationToScene(ann)
      setAnnotations((prev) => [...prev, ann])
    } else if (action.type === 'annotate-delete') {
      const ann = action.data as AnnotationPoint
      removeAnnotationFromScene(ann.id)
      setAnnotations((prev) => prev.filter((a) => a.id !== ann.id))
    }
  }, [createMarker, updateSelectedCount, sceneRef, addAnnotationToScene, removeAnnotationFromScene])

  const clearSelection = useCallback(() => {
    const group = selectionGroupRef.current
    while (group.children.length > 0) {
      const child = group.children[0]
      group.remove(child)
      ;(child as THREE.Mesh).geometry?.dispose()
      ;(child as THREE.Mesh).material instanceof THREE.Material &&
        ((child as THREE.Mesh).material as THREE.Material).dispose()
    }
    const tc = transformControlsRef.current
    if (tc) tc.detach()
    setSelectedCount(0)
  }, [])

  const clearDeletedMarkers = useCallback(() => {
    const scene = sceneRef.current
    if (!scene) return
    const toRemove: THREE.Object3D[] = []
    scene.traverse((child) => {
      if ((child as THREE.Mesh).userData?.isDeleted) {
        toRemove.push(child)
      }
    })
    toRemove.forEach((m) => {
      scene.remove(m)
      ;(m as THREE.Mesh).geometry?.dispose()
      ;(m as THREE.Mesh).material instanceof THREE.Material &&
        ((m as THREE.Mesh).material as THREE.Material).dispose()
    })
    setDeletedCount(0)
  }, [sceneRef])

  const clearAllAnnotations = useCallback(() => {
    const group = annotationGroupRef.current
    while (group.children.length > 0) {
      const child = group.children[0]
      group.remove(child)
      if (child instanceof THREE.Mesh) {
        child.geometry?.dispose()
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose())
        } else {
          child.material.dispose()
        }
      }
      if (child instanceof THREE.Sprite) {
        child.material.map?.dispose()
        child.material.dispose()
      }
    }
    setAnnotations([])
  }, [])

  const handleCanvasClick = useCallback(
    (event: React.MouseEvent) => {
      if (state.editMode === 'view') return

      const canvas = canvasRef.current
      const camera = cameraRef.current
      const scene = sceneRef.current
      if (!canvas || !camera || !scene) return

      const rect = canvas.getBoundingClientRect()
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1

      const raycaster = raycasterRef.current
      raycaster.setFromCamera(mouseRef.current, camera)

      const splatMesh = splatMeshRef.current
      if (!splatMesh) return

      if (state.editMode === 'annotate') {
        const box = splatMesh.getBoundingBox()
        const sphere = box.getBoundingSphere(new THREE.Sphere())
        const intersects = raycaster.ray.intersectSphere(sphere, new THREE.Vector3())
        if (!intersects) return

        const hitPoint = raycaster.ray.at(intersects.x, new THREE.Vector3())
        if (!hitPoint) return

        setPendingAnnotation({
          screenX: event.clientX,
          screenY: event.clientY,
          position: hitPoint,
        })
        setAnnotationInput('')
        return
      }

      const box = splatMesh.getBoundingBox()
      const sphere = box.getBoundingSphere(new THREE.Sphere())
      const intersects = raycaster.ray.intersectSphere(sphere, new THREE.Vector3())
      if (!intersects) return

      const hitPoint = raycaster.ray.at(intersects.x, new THREE.Vector3())
      if (!hitPoint) return

      if (state.editMode === 'select') {
        const marker = createMarker(hitPoint, 0x44ff44)
        selectionGroupRef.current.add(marker)
        pushUndo({
          type: 'select',
          data: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z },
          timestamp: Date.now(),
        })
        updateSelectedCount()
      }

      if (state.editMode === 'delete') {
        const id = `del-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const marker = createMarker(hitPoint, 0xff0000, 0.6, false)
        marker.userData.isDeleted = true
        marker.userData.undoId = id
        scene.add(marker)
        pushUndo({
          type: 'delete',
          data: { x: hitPoint.x, y: hitPoint.y, z: hitPoint.z, id },
          timestamp: Date.now(),
        })
        setDeletedCount((c) => c + 1)
      }
    },
    [state.editMode, cameraRef, sceneRef, splatMeshRef, createMarker, pushUndo, updateSelectedCount],
  )

  const handleEditModeChange = useCallback(
    (mode: EditMode) => {
      setEditMode(mode)
      const group = selectionGroupRef.current
      const tc = transformControlsRef.current

      setPendingAnnotation(null)
      setAnnotationInput('')

      if (mode === 'view') {
        if (tc) tc.detach()
        return
      }

      if (mode === 'move') {
        if (group.children.length > 0 && tc) {
          tc.setMode('translate')
          tc.attach(group)
        }
      } else {
        if (tc) tc.detach()
      }
    },
    [setEditMode],
  )

  const handleDeselectAll = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  const handleClearDeleted = useCallback(() => {
    clearDeletedMarkers()
  }, [clearDeletedMarkers])

  const handleAnnotationInputKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        confirmAnnotation()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        cancelAnnotation()
      }
    },
    [confirmAnnotation, cancelAnnotation],
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.editMode === 'view') {
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
          e.preventDefault()
          openFileDialog()
        }
        return
      }
      if (pendingAnnotation) return
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z' || e.key === 'Z') {
          e.preventDefault()
          if (e.shiftKey) {
            handleRedo()
          } else {
            handleUndo()
          }
        }
        if (e.key === 'y' || e.key === 'Y') {
          e.preventDefault()
          handleRedo()
        }
      }
      if (e.key === 'Escape') {
        handleEditModeChange('view')
      }
      if (e.key === 'Delete' && state.editMode === 'annotate') {
        if (annotations.length > 0) {
          deleteAnnotation(annotations[annotations.length - 1].id)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.editMode, handleUndo, handleRedo, handleEditModeChange, openFileDialog, pendingAnnotation, annotations, deleteAnnotation])

  const editModeLabel = (mode: EditMode) => {
    switch (mode) {
      case 'select': return '选择'
      case 'move': return '移动'
      case 'delete': return '删除'
      case 'annotate': return '注点'
      default: return ''
    }
  }

  return (
    <div className="fixed inset-0 bg-[#0a0a0f]">
      <SplatCanvas onCanvasReady={handleCanvasReady} />

      <div
        className="fixed inset-0 z-10"
        style={{ pointerEvents: state.editMode !== 'view' ? 'auto' : 'none' }}
        onClick={handleCanvasClick}
      />

      <FileDropZone onFilesSelected={handleFilesSelected} enabled />

      {pendingAnnotation && (
        <div
          className="fixed z-[70] animate-in"
          style={{ left: pendingAnnotation.screenX, top: pendingAnnotation.screenY, transform: 'translate(-50%, -120%)' }}
        >
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#0a0a0f]/95 backdrop-blur-xl border border-[#00D2FF]/30 shadow-lg shadow-[#00D2FF]/10">
            <input
              ref={annotationInputRef}
              type="text"
              value={annotationInput}
              onChange={(e) => setAnnotationInput(e.target.value)}
              onKeyDown={handleAnnotationInputKeyDown}
              placeholder="输入注点标签…"
              maxLength={30}
              className="w-36 bg-transparent text-sm text-white outline-none placeholder:text-white/20"
            />
            <button
              onClick={confirmAnnotation}
              disabled={!annotationInput.trim()}
              className="text-[11px] px-2 py-1 rounded-md bg-[#00D2FF]/20 text-[#00D2FF] hover:bg-[#00D2FF]/30 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              确定
            </button>
            <button
              onClick={cancelAnnotation}
              className="text-[11px] px-2 py-1 rounded-md bg-white/5 text-white/30 hover:bg-white/10 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      )}

      <ViewerToolbar
        modelName={displayModelName}
        onReset={resetView}
        onToggleWireframe={toggleWireframe}
        onToggleFullscreen={toggleFullscreen}
        onToggleInfo={toggleInfoPanel}
        isWireframe={state.isWireframe}
        isFullscreen={state.isFullscreen}
        editMode={state.editMode}
        onEditModeChange={handleEditModeChange}
        selectedCount={selectedCount}
        onDeselectAll={handleDeselectAll}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStackRef.current.length > 0}
        canRedo={redoStackRef.current.length > 0}
        onOpenFile={openFileDialog}
      />

      <ProgressBar progress={state.progress} isLoading={state.isLoading} />

      <InfoPanel
        open={state.showInfoPanel}
        onClose={toggleInfoPanel}
        modelName={displayModelName}
        splatCount={state.splatCount}
        fps={state.fps}
      />

      {state.editMode === 'annotate' && annotations.length > 0 && (
        <div className="fixed right-4 top-24 z-30 w-48 max-h-[60vh] overflow-y-auto rounded-xl bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/5">
          <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
            <span className="text-[10px] tracking-widest uppercase text-white/30">
              注点列表 ({annotations.length})
            </span>
            <button
              onClick={clearAllAnnotations}
              className="text-[10px] text-red-400/50 hover:text-red-400 transition-colors"
            >
              清空
            </button>
          </div>
          <div className="p-2 space-y-1">
            {annotations.map((ann, idx) => (
              <div
                key={ann.id}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/[0.03] group"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: '#' + ann.color.toString(16).padStart(6, '0') }}
                />
                <span className="text-xs text-white/60 truncate flex-1">{ann.label}</span>
                <button
                  onClick={() => deleteAnnotation(ann.id)}
                  className="opacity-0 group-hover:opacity-100 text-[10px] text-red-400/50 hover:text-red-400 transition-all"
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 flex items-center gap-4 px-5 py-2.5 rounded-xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase text-white/20">点数</span>
          <span className="text-xs text-white/60 tabular-nums">
            {state.splatCount > 0 ? `${(state.splatCount / 10000).toFixed(1)}万` : '--'}
          </span>
        </div>
        <div className="w-px h-4 bg-white/5" />
        <div className="flex items-center gap-2">
          <span className="text-[10px] tracking-widest uppercase text-white/20">FPS</span>
          <span className="text-xs text-[#00D2FF] tabular-nums" ref={fpsDisplayRef}>
            {state.fps > 0 ? state.fps : '--'}
          </span>
        </div>
        {state.editMode !== 'view' && (
          <>
            <div className="w-px h-4 bg-white/5" />
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-widest uppercase text-white/20">模式</span>
              <span className="text-xs text-[#FFD700]">{editModeLabel(state.editMode)}</span>
            </div>
          </>
        )}
        {state.editMode === 'annotate' && annotations.length > 0 && (
          <>
            <div className="w-px h-4 bg-white/5" />
            <span className="text-xs text-[#00D2FF]/60">{annotations.length} 个注点</span>
          </>
        )}
        {state.editMode === 'select' && selectedCount > 0 && (
          <>
            <div className="w-px h-4 bg-white/5" />
            <button onClick={handleDeselectAll} className="text-[10px] text-[#ff6666]/60 hover:text-[#ff6666] transition-colors">
              清除 {selectedCount} 个选中
            </button>
          </>
        )}
        {state.editMode === 'delete' && deletedCount > 0 && (
          <>
            <div className="w-px h-4 bg-white/5" />
            <button onClick={handleClearDeleted} className="text-[10px] text-[#ff6666]/60 hover:text-[#ff6666] transition-colors">
              清除 {deletedCount} 个标记
            </button>
          </>
        )}
      </div>

      {state.error && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl bg-red-500/10 border border-red-500/20 backdrop-blur-xl">
          <p className="text-sm text-red-400">{state.error}</p>
        </div>
      )}
    </div>
  )
}