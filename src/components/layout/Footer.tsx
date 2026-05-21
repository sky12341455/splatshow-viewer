import { Link } from 'react-router-dom'
import { Box, Github } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[#0a0a0f]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Box className="w-5 h-5 text-[#00D2FF]" />
              <span className="text-sm tracking-widest uppercase text-white/80">SplatShow</span>
            </div>
            <p className="text-xs text-white/30 leading-relaxed max-w-xs">
              基于 WebGL2 与 Spark 渲染引擎的高斯泼溅 3D 模型在线展示平台。支持 SOG 超压缩格式即时预览。
            </p>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-white/30 mb-3">导航</h4>
            <div className="space-y-2">
              <Link to="/" className="block text-sm text-white/40 hover:text-white/70 transition-colors">首页</Link>
              <Link to="/gallery" className="block text-sm text-white/40 hover:text-white/70 transition-colors">模型画廊</Link>
              <Link to="/viewer" className="block text-sm text-white/40 hover:text-white/70 transition-colors">在线查看器</Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs tracking-widest uppercase text-white/30 mb-3">技术栈</h4>
            <div className="flex flex-wrap gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">Three.js</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">WebGL2</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">Spark</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">React</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">TypeScript</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">SOG</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/15">
            &copy; {new Date().getFullYear()} SplatShow. All rights reserved.
          </p>
          <a
            href="https://github.com/sparkjsdev/spark"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-white/20 hover:text-white/40 transition-colors"
          >
            <Github className="w-3.5 h-3.5" />
            由 Spark 引擎驱动
          </a>
        </div>
      </div>
    </footer>
  )
}