import { useCallback, useEffect, useRef, useState } from 'react'
import { Upload } from 'lucide-react'

const SUPPORTED_EXTENSIONS = ['.sog', '.ply', '.splat', '.spz']

interface FileDropZoneProps {
  onFilesSelected: (files: File[]) => void
  enabled?: boolean
  compact?: boolean
  label?: string
}

export function FileDropZone({
  onFilesSelected,
  enabled = true,
  compact = false,
  label = '拖拽模型文件到此处',
}: FileDropZoneProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const dragCounter = useRef(0)
  const isSupportedRef = useRef((file: File) => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase()
    return SUPPORTED_EXTENSIONS.includes(ext)
  })
  const onFilesSelectedRef = useRef(onFilesSelected)
  onFilesSelectedRef.current = onFilesSelected

  useEffect(() => {
    let entered = false

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault()
      if (!entered && e.dataTransfer?.types.includes('Files')) {
        entered = true
        setIsDragOver(true)
      }
    }

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault()
      if (e.relatedTarget === null || (e.target as Element)?.tagName === 'HTML') {
        entered = false
        setIsDragOver(false)
      }
    }

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault()
    }

    const handleDrop = (e: DragEvent) => {
      e.preventDefault()
      entered = false
      setIsDragOver(false)

      if (!enabled) return
      const files = Array.from(e.dataTransfer?.files || [])
      const valid = files.filter(isSupportedRef.current)
      if (valid.length > 0) {
        onFilesSelectedRef.current(valid)
      }
    }

    document.addEventListener('dragenter', handleDragEnter, { passive: true })
    document.addEventListener('dragleave', handleDragLeave, { passive: true })
    document.addEventListener('dragover', handleDragOver, { passive: true })
    document.addEventListener('drop', handleDrop)

    return () => {
      document.removeEventListener('dragenter', handleDragEnter)
      document.removeEventListener('dragleave', handleDragLeave)
      document.removeEventListener('dragover', handleDragOver)
      document.removeEventListener('drop', handleDrop)
    }
  }, [enabled])

  if (!isDragOver) return null

  if (compact) {
    return (
      <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0f]/60 backdrop-blur-sm pointer-events-none">
        <div className="w-80 px-6 py-8 rounded-2xl bg-[#0a0a0f]/90 border-2 border-dashed border-[#00D2FF]/40 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-xl bg-[#00D2FF]/10 flex items-center justify-center">
            <Upload className="w-7 h-7 text-[#00D2FF]" />
          </div>
          <p className="text-sm text-[#00D2FF]/80 font-medium">{label}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0a0a0f]/70 backdrop-blur-md pointer-events-none">
      <div className="w-96 px-8 py-12 rounded-3xl bg-[#0a0a0f]/90 border-2 border-dashed border-[#00D2FF]/50 flex flex-col items-center gap-4">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#6C5CE7]/20 to-[#00D2FF]/20 flex items-center justify-center">
          <Upload className="w-9 h-9 text-[#00D2FF]" />
        </div>
        <p className="text-base text-white/70 font-medium">{label}</p>
        <div className="flex items-center gap-2">
          {SUPPORTED_EXTENSIONS.map((ext) => (
            <span key={ext} className="text-[10px] px-2 py-1 rounded-full bg-white/5 text-white/30 border border-white/5">
              {ext}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function useFileInput(onFilesSelected: (files: File[]) => void) {
  const openFileDialog = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = SUPPORTED_EXTENSIONS.join(',')
    input.multiple = false
    input.onchange = () => {
      const files = Array.from(input.files || [])
      if (files.length > 0) {
        onFilesSelected(files)
      }
      input.remove()
    }
    input.click()
  }, [onFilesSelected])

  return { openFileDialog, supportedExtensions: SUPPORTED_EXTENSIONS }
}