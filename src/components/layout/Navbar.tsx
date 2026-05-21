import { Link, useLocation } from 'react-router-dom'
import { Box, Image, Menu } from 'lucide-react'
import { useState } from 'react'

const links = [
  { to: '/', label: '首页' },
  { to: '/gallery', label: '画廊' },
]

export function Navbar() {
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a0f]/70 border-b border-white/5">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <Box className="w-7 h-7 text-[#00D2FF] group-hover:drop-shadow-[0_0_8px_#00D2FF] transition-all" />
          <span className="text-lg tracking-widest uppercase text-white/90 group-hover:text-white transition-colors">
            SplatShow
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm tracking-wider uppercase transition-all duration-300 ${
                location.pathname === link.to
                  ? 'text-[#00D2FF] drop-shadow-[0_0_6px_#00D2FF40]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <button
          className="md:hidden text-white/60 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#0a0a0f]/95 backdrop-blur-xl px-6 py-4 space-y-3">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`block text-sm tracking-wider uppercase transition-colors ${
                location.pathname === link.to
                  ? 'text-[#00D2FF]'
                  : 'text-white/50 hover:text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}