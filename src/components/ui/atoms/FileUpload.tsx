'use client'

import { IconCloudUpload, IconFile, IconMusic, IconPhoto } from '@tabler/icons-react'
import { useCallback, useState } from 'react'

interface FileUploadProps {
  onFileSelect: (file: File) => void
  accept: string
  maxSize?: number // in MB
  type: 'audio' | 'pdf'
  className?: string
  disabled?: boolean
}

export default function FileUpload({ onFileSelect, accept, maxSize = 50, type, className = '', disabled = false }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (!disabled) {
        setIsDragOver(true)
      }
    },
    [disabled]
  )

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      if (files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
    },
    [disabled, onFileSelect]
  )

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files
      if (files && files.length > 0) {
        const file = files[0]
        if (validateFile(file)) {
          onFileSelect(file)
        }
      }
    },
    [onFileSelect]
  )

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      alert(`File size must be less than ${maxSize}MB`)
      return false
    }

    // Check file type
    const validTypes = accept.split(',').map(type => type.trim())
    const fileType = file.type
    const fileName = file.name.toLowerCase()

    const isValidType = validTypes.some(validType => {
      if (validType.startsWith('.')) {
        return fileName.endsWith(validType)
      }
      return fileType.includes(validType.replace('*', ''))
    })

    if (!isValidType) {
      alert(`Please select a valid ${type} file`)
      return false
    }

    return true
  }

  const getIcon = () => {
    switch (type) {
      case 'audio':
        return <IconMusic className="w-8 h-8 text-blue-500" />
      case 'pdf':
        return <IconFile className="w-8 h-8 text-red-500" />
      default:
        return <IconPhoto className="w-8 h-8 text-gray-500" />
    }
  }

  const getAcceptText = () => {
    switch (type) {
      case 'audio':
        return 'audio files (MP3, WAV, etc.)'
      case 'pdf':
        return 'PDF files'
      default:
        return 'files'
    }
  }

  return (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
        ${isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && document.getElementById(`file-input-${type}`)?.click()}>
      <input id={`file-input-${type}`} type="file" accept={accept} onChange={handleFileInput} className="hidden" disabled={disabled} />

      <div className="flex flex-col items-center space-y-3">
        {getIcon()}
        <div>
          <p className="text-sm font-medium text-gray-900">{isDragOver ? 'Drop file here' : 'Click or drag to upload'}</p>
          <p className="text-xs text-gray-500">
            {getAcceptText()} (max {maxSize}MB)
          </p>
        </div>
        <IconCloudUpload className="w-6 h-6 text-gray-400" />
      </div>
    </div>
  )
}
