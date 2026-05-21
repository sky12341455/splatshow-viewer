import { useNavigate } from 'react-router-dom'
import type { ModelEntry } from '@/types'

interface ModelCardProps {
  model: ModelEntry
}

export function ModelCard({ model }: ModelCardProps) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(`/viewer?src=${encodeURIComponent(model.sogUrl)}&name=${encodeURIComponent(model.name)}&id=${model.id}`)}
      className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-[#00D2FF]/20 hover:bg-white/[0.04] transition-all duration-500 text-left w-full"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] to-[#0a0a0f]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-24 h-24 rounded-2xl bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.06] transition-colors">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#6C5CE7]/20 to-[#00D2FF]/20 group-hover:from-[#6C5CE7]/40 group-hover:to-[#00D2FF]/40 transition-all duration-500" />
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-5">
        <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors mb-1">
          {model.name}
        </h3>
        <p className="text-xs text-white/30 line-clamp-2 leading-relaxed mb-3">
          {model.description}
        </p>
        <div className="flex flex-wrap items-center gap-1.5">
          {model.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/30 border border-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </button>
  )
}