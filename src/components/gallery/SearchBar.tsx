import { Search } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative max-w-md w-full">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="搜索模型名称..."
        className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-white/80 placeholder:text-white/20 focus:outline-none focus:border-[#00D2FF]/20 focus:bg-white/[0.05] transition-all"
      />
    </div>
  )
}