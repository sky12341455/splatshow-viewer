interface ProgressBarProps {
  progress: number
  isLoading: boolean
}

export function ProgressBar({ progress, isLoading }: ProgressBarProps) {
  if (!isLoading) return null

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-80">
      <div className="px-4 py-3 rounded-xl bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/40 tracking-wider uppercase">
            加载中
          </span>
          <span className="text-xs text-[#00D2FF] tabular-nums">
            {Math.round(progress)}%
          </span>
        </div>
        <div className="h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#6C5CE7] to-[#00D2FF] rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  )
}