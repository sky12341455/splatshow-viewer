import { useEffect, useRef, useState, useCallback } from 'react'
import { ArrowDown, Upload, FolderOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export function HeroSection() {
  const navigate = useNavigate()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    const particles: { x: number; y: number; vx: number; vy: number; r: number; alpha: number }[] = []
    const count = 60

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.3 - 0.3,
        r: Math.random() * 1.5 + 0.5,
        alpha: Math.random() * 0.4 + 0.1,
      })
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      for (const p of particles) {
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0, 210, 255, ${p.alpha})`
        ctx.fill()

        p.x += p.vx
        p.y += p.vy

        if (p.y < -10) {
          p.y = canvas.height + 10
          p.x = Math.random() * canvas.width
        }
        if (p.x < -10) p.x = canvas.width + 10
        if (p.x > canvas.width + 10) p.x = -10

        for (const q of particles) {
          if (p === q) continue
          const dx = p.x - q.x
          const dy = p.y - q.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(q.x, q.y)
            ctx.strokeStyle = `rgba(108, 92, 231, ${0.06 * (1 - dist / 120)})`
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }
    draw()

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  const openFileDialog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.sog,.ply,.splat,.spz'
    input.multiple = false
    input.onchange = () => {
      if (input.files && input.files[0]) {
        const file = input.files[0]
        const url = URL.createObjectURL(file)
        navigate(`/viewer?src=${encodeURIComponent(url)}&name=${encodeURIComponent(file.name)}`)
      }
      input.remove()
    }
    input.click()
  }, [navigate])

  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current++
    if (e.dataTransfer?.types.includes('Files')) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    dragCounter.current--
    if (dragCounter.current === 0) {
      setIsDragOver(false)
    }
  }, [])

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setIsDragOver(false)
      dragCounter.current = 0

      const files = e.dataTransfer?.files
      if (files && files.length > 0) {
        const file = files[0]
        const ext = '.' + file.name.split('.').pop()?.toLowerCase()
        if (['.sog', '.ply', '.splat', '.spz'].includes(ext)) {
          const url = URL.createObjectURL(file)
          navigate(`/viewer?src=${encodeURIComponent(url)}&name=${encodeURIComponent(file.name)}`)
        }
      }
    },
    [navigate],
  )

  useEffect(() => {
    document.addEventListener('dragenter', handleDragEnter)
    document.addEventListener('dragleave', handleDragLeave)
    document.addEventListener('dragover', handleDragOver)
    document.addEventListener('drop', handleDrop)
    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [handleDragEnter, handleDragLeave, handleDragOver, handleDrop])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <canvas ref={canvasRef} className="absolute inset-0 z-0" />

      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0f]/90 via-[#0f0f23]/80 to-[#0a0a0f]/95 z-[1]" />

      <div className="absolute inset-0 overflow-hidden z-[1]">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#6C5CE7]/10 rounded-full blur-[120px] animate-pulse" />
        <div
          className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-[#00D2FF]/10 rounded-full blur-[100px] animate-pulse"
          style={{ animationDelay: '1s' }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#6C5CE7]/5 rounded-full blur-[150px] animate-pulse"
          style={{ animationDelay: '2s' }}
        />
      </div>

      <div className="absolute inset-0 opacity-[0.025] z-[1]">
        <div
          className="w-full h-full"
          style={{
            backgroundImage:
              'radial-gradient(circle at 25% 25%, #00D2FF 1px, transparent 1px), radial-gradient(circle at 75% 75%, #6C5CE7 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-white/10 bg-white/5 mb-8 animate-float">
          <span className="w-2 h-2 rounded-full bg-[#00D2FF] animate-pulse" />
          <span className="text-xs tracking-widest uppercase text-white/50">
            3D Gaussian Splatting Viewer
          </span>
        </div>

        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tighter mb-6">
          <span className="bg-gradient-to-r from-white via-white/90 to-[#00D2FF] bg-clip-text text-transparent">
            高斯泼溅
          </span>
          <br />
          <span className="bg-gradient-to-r from-[#6C5CE7] to-[#00D2FF] bg-clip-text text-transparent">
            在线展示平台
          </span>
        </h1>

        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed tracking-wide">
          基于 WebGL2 与 Spark 渲染引擎，在浏览器中实时浏览高质量的 3D 高斯泼溅模型。
          支持 SOG / PLY / SPLAT 格式，无需安装任何软件。
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={() => navigate('/gallery')}
            className="group relative px-8 py-3.5 rounded-xl bg-white/10 border border-white/10 hover:border-[#00D2FF]/30 hover:bg-white/[0.15] transition-all duration-300"
          >
            <span className="relative z-10 text-sm tracking-widest uppercase text-white/80 group-hover:text-white transition-colors">
              浏览模型
            </span>
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#6C5CE7]/0 via-[#00D2FF]/0 to-[#00D2FF]/0 group-hover:from-[#6C5CE7]/10 group-hover:via-transparent group-hover:to-[#00D2FF]/10 transition-all duration-500" />
          </button>

          <button
            onClick={() => navigate('/viewer')}
            className="group relative px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#6C5CE7] to-[#00D2FF] hover:shadow-lg hover:shadow-[#6C5CE7]/25 transition-all duration-300"
          >
            <span className="relative z-10 text-sm tracking-widest uppercase text-white font-medium">
              在线查看器
            </span>
          </button>
        </div>

        <div className="max-w-md mx-auto">
          <div className="rounded-2xl border border-dashed border-white/10 hover:border-[#00D2FF]/30 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 p-8">
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#00D2FF]/20 flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#00D2FF]" />
              </div>
              <p className="text-sm text-white/40">
                拖拽 .sog / .ply / .splat 文件到页面任意位置
              </p>
              <span className="text-xs text-white/15">或</span>
              <button
                onClick={openFileDialog}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#00D2FF]/30 transition-all"
              >
                <FolderOpen className="w-4 h-4 text-[#00D2FF]/70" />
                <span className="text-xs text-white/50">选择本地文件</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {isDragOver && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0f]/60 backdrop-blur-sm pointer-events-none">
          <div className="w-96 px-8 py-12 rounded-3xl bg-[#0a0a0f]/95 border-2 border-dashed border-[#00D2FF]/60 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/30 to-[#00D2FF]/30 flex items-center justify-center">
              <Upload className="w-9 h-9 text-[#00D2FF]" />
            </div>
            <p className="text-base text-white/80 font-medium">松手以打开模型</p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF]/60">.sog</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF]/60">.ply</span>
              <span className="text-[10px] px-2 py-1 rounded-full bg-[#00D2FF]/10 text-[#00D2FF]/60">.splat</span>
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce z-10">
        <ArrowDown className="w-5 h-5 text-white/20" />
      </div>
    </section>
  )
}