import { X, HardDrive, Hash, FileText } from 'lucide-react'

interface InfoPanelProps {
  open: boolean
  onClose: () => void
  modelName: string
  splatCount: number
  fps: number
}

export function InfoPanel({
  open,
  onClose,
  modelName,
  splatCount,
  fps,
}: InfoPanelProps) {
  return (
    <div
      className={`fixed right-0 top-0 bottom-0 z-40 w-80 bg-[#0a0a0f]/95 backdrop-blur-2xl border-l border-white/5 transition-transform duration-300 ${
        open ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
        <h3 className="text-sm tracking-wider uppercase text-white/50">
          模型信息
        </h3>
        <button
          onClick={onClose}
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
        >
          <X className="w-4 h-4 text-white/30" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        <div className="space-y-1.5">
          <span className="text-[10px] tracking-widest uppercase text-white/20">
            名称
          </span>
          <p className="text-sm text-white/70">{modelName}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <Hash className="w-3.5 h-3.5 text-white/20 mb-2" />
            <span className="text-[10px] tracking-widest uppercase text-white/20 block mb-0.5">
              高斯点数
            </span>
            <p className="text-sm text-white/60 tabular-nums">
              {splatCount > 0 ? splatCount.toLocaleString() : '--'}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
            <HardDrive className="w-3.5 h-3.5 text-white/20 mb-2" />
            <span className="text-[10px] tracking-widest uppercase text-white/20 block mb-0.5">
              帧率
            </span>
            <p className="text-sm text-white/60 tabular-nums">
              {fps > 0 ? `${fps} FPS` : '--'}
            </p>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] tracking-widest uppercase text-white/20">
            格式
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs px-2 py-1 rounded-md bg-[#00D2FF]/10 text-[#00D2FF] border border-[#00D2FF]/20">
              SOG
            </span>
          </div>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] tracking-widest uppercase text-white/20">
            渲染引擎
          </span>
          <div className="flex items-center gap-2">
            <FileText className="w-3.5 h-3.5 text-white/20" />
            <span className="text-xs text-white/40">
              Spark + Three.js (WebGL2)
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}