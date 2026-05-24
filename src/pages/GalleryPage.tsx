import { useState, useMemo } from 'react'
import { ModelCard } from '../components/gallery/ModelCard'
import { SearchBar } from '../components/gallery/SearchBar'
import { models } from '../data/models'

export default function GalleryPage() {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return models
    const q = search.toLowerCase()
    return models.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [search])

  return (
    <div className="pt-24 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12">
          <span className="text-xs tracking-widest uppercase text-[#00D2FF] mb-3 block">
            模型画廊
          </span>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-6">
            浏览全部模型
          </h1>
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-white/20 text-sm">未找到匹配的模型</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((model) => (
              <ModelCard key={model.id} model={model} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}