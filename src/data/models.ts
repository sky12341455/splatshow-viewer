import type { ModelEntry } from '@/types'
import { DEFAULT_MODEL_URL } from '@/types'

export const models: ModelEntry[] = [
  {
    id: 'point-cloud-30000',
    name: 'Point Cloud 30000',
    description: '3D 高斯泼溅点云模型，共 30000 个高斯点',
    sogUrl: DEFAULT_MODEL_URL,
    tags: ['点云', '默认', '演示'],
  },
  {
    id: 'demo-garden',
    name: '花园场景',
    description: '户外花园的沉浸式扫描重建，包含丰富的植被细节',
    sogUrl: DEFAULT_MODEL_URL,
    tags: ['户外', '自然', '场景'],
  },
  {
    id: 'demo-statue',
    name: '雕塑',
    description: '经典雕塑的高精度 3D 高斯泼溅重建',
    sogUrl: DEFAULT_MODEL_URL,
    tags: ['艺术', '雕塑', '室内'],
  },
  {
    id: 'demo-interior',
    name: '室内空间',
    description: '现代室内设计空间的完整 3D 扫描重建',
    sogUrl: DEFAULT_MODEL_URL,
    tags: ['室内', '建筑', '场景'],
  },
  {
    id: 'demo-plant',
    name: '盆栽植物',
    description: '绿色盆栽的高斯泼溅重建，细节丰富',
    sogUrl: DEFAULT_MODEL_URL,
    tags: ['自然', '植物', '特写'],
  },
  {
    id: 'demo-street',
    name: '街景',
    description: '城市街景的 3D 高斯泼溅扫描',
    sogUrl: DEFAULT_MODEL_URL,
    tags: ['户外', '城市', '场景'],
  },
]