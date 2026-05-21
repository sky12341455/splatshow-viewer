import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { models } from '@/data/models'

export function FeaturedModels() {
  const navigate = useNavigate()
  const featured = models.slice(0, 4)

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-xs tracking-widest uppercase text-[#00D2FF] mb-3 block">
              精选模型
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              探索高斯泼溅世界
            </h2>
          </div>
          <button
            onClick={() => navigate('/gallery')}
            className="hidden md:flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors group"
          >
            查看全部
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((model) => (
            <button
              key={model.id}
              onClick={() => navigate(`/viewer?src=${encodeURIComponent(model.sogUrl)}&id=${model.id}`)}
              className="group relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/5 bg-white/[0.02] hover:border-[#00D2FF]/20 hover:bg-white/[0.04] transition-all duration-500 text-left"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#0f0f23] to-[#0a0a0f]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-80" />

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C5CE7]/30 to-[#00D2FF]/30 group-hover:from-[#6C5CE7]/50 group-hover:to-[#00D2FF]/50 transition-all duration-500" />
                </div>
              </div>

              <div className="absolute bottom-0 left-0 right-0 p-5">
                <h3 className="text-base font-semibold text-white/90 group-hover:text-white transition-colors mb-1">
                  {model.name}
                </h3>
                <p className="text-xs text-white/30 line-clamp-2 leading-relaxed">
                  {model.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {model.tags.slice(0, 3).map((tag) => (
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
          ))}
        </div>

        <div className="flex justify-center mt-8 md:hidden">
          <button
            onClick={() => navigate('/gallery')}
            className="flex items-center gap-2 text-sm text-white/40 hover:text-white/80 transition-colors group"
          >
            查看全部
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  )
}