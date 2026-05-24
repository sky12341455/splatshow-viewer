import { ArrowLeft, RotateCcw, Grid3X3, Maximize, Info, Minimize, MousePointer2, Trash2, Move, PenLine, Undo2, Redo2, FolderOpen, MapPin } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { EditMode } from '../../types'

interface ViewerToolbarProps {
  modelName: string
  onReset: () => void
  onToggleWireframe: () => void
  onToggleFullscreen: () => void
  onToggleInfo: () => void
  isWireframe: boolean
  isFullscreen: boolean
  editMode: EditMode
  onEditModeChange: (mode: EditMode) => void
  selectedCount?: number
  onDeselectAll?: () => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
  onOpenFile?: () => void
}

export function ViewerToolbar({
  modelName,
  onReset,
  onToggleWireframe,
  onToggleFullscreen,
  onToggleInfo,
  isWireframe,
  isFullscreen,
  editMode,
  onEditModeChange,
  selectedCount = 0,
  onDeselectAll,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenFile,
}: ViewerToolbarProps) {
  const navigate = useNavigate()

  const editTools: { mode: EditMode; icon: typeof MousePointer2; label: string }[] = [
    { mode: 'select', icon: MousePointer2, label: '选择' },
    { mode: 'move', icon: Move, label: '移动' },
    { mode: 'delete', icon: Trash2, label: '删除' },
    { mode: 'annotate', icon: MapPin, label: '注点' },
  ]

  return (
    <>
      <div className="fixed top-0 left-0 right-0 z-30 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all backdrop-blur-xl"
          >
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <span className="text-sm text-white/50 tracking-wide">
            {modelName}
          </span>
          {editMode === 'select' && selectedCount > 0 && (
            <span className="text-xs text-[#44ff44]/60">
              ({selectedCount} 个选中)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onOpenFile && (
            <>
              <button
                onClick={onOpenFile}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all backdrop-blur-xl"
                title="打开文件 (Ctrl+O)"
              >
                <FolderOpen className="w-4 h-4 text-white/60" />
              </button>
              <div className="w-px h-6 bg-white/5 mx-1" />
            </>
          )}

          {editMode !== 'view' && (
            <>
              <button
                onClick={onUndo}
                disabled={!canUndo}
                className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all backdrop-blur-xl bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                title="撤销 (Ctrl+Z)"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onRedo}
                disabled={!canRedo}
                className="w-8 h-8 flex items-center justify-center rounded-lg border transition-all backdrop-blur-xl bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10 disabled:opacity-20 disabled:cursor-not-allowed"
                title="重做 (Ctrl+Y)"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-6 bg-white/5 mx-1" />
            </>
          )}

          <button
            onClick={() => onEditModeChange(editMode === 'view' ? 'select' : 'view')}
            className={`h-9 px-3 flex items-center gap-1.5 rounded-xl border transition-all backdrop-blur-xl ${
              editMode !== 'view'
                ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]'
                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
            }`}
            title="编辑模式"
          >
            <PenLine className="w-4 h-4" />
            <span className="text-[11px] tracking-wider">编辑</span>
          </button>

          {editMode !== 'view' && (
            <div className="flex items-center gap-1 ml-1">
              {editTools.map((tool) => (
                <button
                  key={tool.mode}
                  onClick={() => onEditModeChange(tool.mode)}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all backdrop-blur-xl ${
                    editMode === tool.mode
                      ? 'bg-[#FFD700]/10 border-[#FFD700]/30 text-[#FFD700]'
                      : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10'
                  }`}
                  title={tool.label}
                >
                  <tool.icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>
          )}

          <div className="w-px h-6 bg-white/5 mx-1" />

          <button
            onClick={onReset}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all backdrop-blur-xl"
            title="重置视角"
          >
            <RotateCcw className="w-4 h-4 text-white/60" />
          </button>
          <button
            onClick={onToggleWireframe}
            className={`w-9 h-9 flex items-center justify-center rounded-xl border transition-all backdrop-blur-xl ${
              isWireframe
                ? 'bg-[#00D2FF]/10 border-[#00D2FF]/30 text-[#00D2FF]'
                : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:border-white/10'
            }`}
            title="线框模式"
          >
            <Grid3X3 className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleFullscreen}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all backdrop-blur-xl"
            title={isFullscreen ? '退出全屏' : '全屏'}
          >
            {isFullscreen ? (
              <Minimize className="w-4 h-4 text-white/60" />
            ) : (
              <Maximize className="w-4 h-4 text-white/60" />
            )}
          </button>
          <button
            onClick={onToggleInfo}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 hover:border-white/10 transition-all backdrop-blur-xl"
            title="模型信息"
          >
            <Info className="w-4 h-4 text-white/60" />
          </button>
        </div>
      </div>
    </>
  )
}