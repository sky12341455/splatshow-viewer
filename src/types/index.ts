export interface ModelEntry {
  id: string
  name: string
  description: string
  sogUrl: string
  thumbnail?: string
  tags: string[]
  splatCount?: number
}

export type EditMode = 'view' | 'select' | 'move' | 'delete' | 'annotate'

export interface AnnotationPoint {
  id: string
  position: { x: number; y: number; z: number }
  label: string
  color: number
}

export interface ViewerState {
  isLoading: boolean
  progress: number
  error: string | null
  splatCount: number
  fps: number
  isWireframe: boolean
  isFullscreen: boolean
  showInfoPanel: boolean
  editMode: EditMode
  selectedCount: number
}

export const DEFAULT_MODEL_URL = '/assets/models/point_cloud_30000.sog'
export const DEFAULT_MODEL_NAME = 'Point Cloud 30000'