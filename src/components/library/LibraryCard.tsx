'use client'

import { StorageService } from '@lib/api/storage'
import { IconCalendar, IconEdit, IconExternalLink, IconFile, IconPlayerPause, IconPlayerPlay, IconTag, IconTrash, IconVideo, IconX } from '@tabler/icons-react'
import { AlbumEnum, Library } from '@type/library'
import { Button, message, Popconfirm, Tag } from 'antd'
import { useCallback, useRef, useState } from 'react'

interface LibraryCardProps {
  library: Library
  onEdit: (library: Library) => void
  onDelete: (id: number) => void
  onUpdateLibrary: (id: number, updates: Partial<Library>) => Promise<void>
  onViewMiqaats: (library: Library) => void
}

export default function LibraryCard({ library, onEdit, onDelete, onUpdateLibrary, onViewMiqaats }: LibraryCardProps) {
  const [uploadingAudio, setUploadingAudio] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [selectedDate, setSelectedDate] = useState('')
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [dragCounter, setDragCounter] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const detectFileType = (file: File): 'audio' | 'pdf' | null => {
    const fileName = file.name.toLowerCase()
    const fileType = file.type.toLowerCase()

    // Check for audio files
    if (
      fileType.startsWith('audio/') ||
      fileName.endsWith('.mp3') ||
      fileName.endsWith('.wav') ||
      fileName.endsWith('.m4a') ||
      fileName.endsWith('.aac') ||
      fileName.endsWith('.ogg') ||
      fileName.endsWith('.flac') ||
      fileName.endsWith('.wma')
    ) {
      return 'audio'
    }

    // Check for PDF files
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      return 'pdf'
    }

    return null
  }

  const toggleAudio = () => {
    if (!audioRef.current || !library.audio_url) return

    if (audioPlaying) {
      audioRef.current.pause()
      setAudioPlaying(false)
    } else {
      audioRef.current.play().catch(() => {
        setAudioError(true)
        setAudioPlaying(false)
      })
      setAudioPlaying(true)
      setAudioError(false)
    }
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragCounter(prev => prev + 1)
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragOver(true)
    }
  }, [])

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragCounter(prev => prev - 1)
      if (dragCounter === 1) {
        setIsDragOver(false)
      }
    },
    [dragCounter]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragOver(false)
    setDragCounter(0)

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      const fileType = detectFileType(file)

      if (fileType) {
        handleFileUpload(file, fileType)
      } else {
        message.error('Please drop an audio file (.mp3, .wav, .m4a, etc.) or PDF file (.pdf)')
      }
    }
  }, [])

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't trigger card click if clicking on buttons or interactive elements
    if ((e.target as HTMLElement).closest('button, a, input')) {
      return
    }
    onEdit(library)
  }

  const getAlbumColor = (album?: AlbumEnum) => {
    const colors: Record<string, string> = {
      MADEH: 'blue',
      NOHA: 'red',
      SALAAM: 'green',
      ILTEJA: 'purple',
      QURAN: 'gold',
      DUA: 'orange',
      MUNAJAAT: 'cyan',
      MANQABAT: 'magenta',
      NAAT: 'lime',
      RASA: 'volcano',
      QASIDA: 'geekblue',
    }
    return colors[album || ''] || 'default'
  }

  const handleFileUpload = async (file: File, type: 'audio' | 'pdf') => {
    const setUploading = type === 'audio' ? setUploadingAudio : setUploadingPdf
    setUploading(true)

    try {
      const result = await StorageService.uploadFile(file, type, library.name)

      if (result.success && result.url) {
        const updates = type === 'audio' ? { audio_url: result.url } : { pdf_url: result.url }

        await onUpdateLibrary(library.id, updates)
        message.success(`${type.toUpperCase()} uploaded successfully`)
      } else {
        message.error(result.error || 'Upload failed')
      }
    } catch (error) {
      message.error('Upload failed')
      console.error('Upload error:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteFile = async (type: 'audio' | 'pdf') => {
    try {
      const url = type === 'audio' ? library.audio_url : library.pdf_url
      if (!url) return

      const path = extractPathFromUrl(url)
      if (path) {
        await StorageService.deleteFile(path, type)
      }

      const updates = type === 'audio' ? { audio_url: undefined } : { pdf_url: undefined }

      await onUpdateLibrary(library.id, updates)
      message.success(`${type.toUpperCase()} deleted successfully`)
    } catch (error) {
      message.error('Delete failed')
      console.error('Delete error:', error)
    }
  }

  const extractPathFromUrl = (url: string): string | null => {
    try {
      const urlObj = new URL(url)
      const pathParts = urlObj.pathname.split('/')
      const bucketIndex = pathParts.findIndex(part => part === 'audio' || part === 'pdf')
      if (bucketIndex === -1 || bucketIndex === pathParts.length - 1) return null
      return pathParts.slice(bucketIndex + 1).join('/')
    } catch {
      return null
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer ${
        isDragOver ? 'border-blue-400 bg-blue-50 shadow-lg scale-[1.02]' : ''
      }`}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCardClick}>
      {/* Drag Overlay */}
      {isDragOver && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-10 border-2 border-dashed border-blue-400 rounded-xl flex items-center justify-center z-10">
          <div className="text-center">
            <div className="text-blue-600 text-2xl font-bold mb-2">Drop File Here</div>
            <div className="text-blue-500 text-sm">Audio or PDF files supported</div>
          </div>
        </div>
      )}

      {/* Drag Indicator */}
      {!library.audio_url || !library.pdf_url ? (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200 px-4 py-2">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span>Drag & drop audio or PDF files here</span>
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
          </div>
        </div>
      ) : null}

      {/* Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-gray-900 truncate">{library.name}</h3>
            {library.description && <p className="text-sm text-gray-600 mt-1 line-clamp-2">{library.description}</p>}
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <Button type="text" size="small" icon={<IconEdit className="w-4 h-4" />} onClick={() => onEdit(library)} className="text-gray-500 hover:text-blue-600" />
            <Popconfirm title="Delete library item?" description="This action cannot be undone." onConfirm={() => onDelete(library.id)} okText="Delete" cancelText="Cancel">
              <Button type="text" size="small" icon={<IconTrash className="w-4 h-4" />} className="text-gray-500 hover:text-red-600" />
            </Popconfirm>
          </div>
        </div>

        {/* Album and Tags */}
        <div className="flex items-center space-x-2 mb-3">
          {library.album && (
            <Tag color={getAlbumColor(library.album)} className="text-xs">
              {library.album}
            </Tag>
          )}
          {library.tags && library.tags.length > 0 && (
            <div className="flex items-center space-x-1">
              <IconTag className="w-3 h-3 text-gray-400" />
              <span className="text-xs text-gray-500">
                {library.tags.slice(0, 2).join(', ')}
                {library.tags.length > 2 && ` +${library.tags.length - 2}`}
              </span>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div>
            <span className="font-medium">Created:</span> {formatDate(library.created_at)}
          </div>
          <div>
            <span className="font-medium">Updated:</span> {formatDate(library.updated_at)}
          </div>
        </div>
      </div>

      {/* Media Controls */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Audio Button */}
          <div className="relative">
            {library.audio_url ? (
              <div className="relative">
                <button
                  onClick={toggleAudio}
                  className="w-full h-20 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border border-blue-200 rounded-xl flex items-center justify-center group transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-col items-center space-y-1">
                    {audioPlaying ? <IconPlayerPause className="w-6 h-6 text-blue-600" /> : <IconPlayerPlay className="w-6 h-6 text-blue-600" />}
                    <span className="text-xs font-medium text-blue-700">Audio</span>
                  </div>
                </button>
                {audioError && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <IconX className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <Button type="text" size="small" onClick={() => handleDeleteFile('audio')} className="text-red-500 hover:text-red-700 p-1 h-auto">
                    <IconTrash className="w-3 h-3" />
                  </Button>
                </div>
                <audio ref={audioRef} src={library.audio_url} onEnded={() => setAudioPlaying(false)} />
              </div>
            ) : (
              <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-center">
                  <IconPlayerPlay className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Drop Audio</span>
                </div>
              </div>
            )}
          </div>

          {/* PDF Button */}
          <div className="relative">
            {library.pdf_url ? (
              <div className="relative">
                <a
                  href={library.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full h-20 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border border-red-200 rounded-xl flex items-center justify-center group transition-all duration-200 hover:shadow-md">
                  <div className="flex flex-col items-center space-y-1">
                    <IconFile className="w-6 h-6 text-red-600" />
                    <span className="text-xs font-medium text-red-700">PDF</span>
                  </div>
                </a>
                <div className="absolute top-2 right-2">
                  <Button type="text" size="small" onClick={() => handleDeleteFile('pdf')} className="text-red-500 hover:text-red-700 p-1 h-auto">
                    <IconTrash className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="text-center">
                  <IconFile className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Drop PDF</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* YouTube Section */}
      {library.youtube_url && (
        <div className="px-6 pb-4">
          <h4 className="text-sm font-medium text-gray-900 flex items-center mb-3">
            <IconVideo className="w-4 h-4 mr-2 text-red-600" />
            YouTube
          </h4>
          <a href={library.youtube_url} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
            <IconVideo className="w-4 h-4" />
            <span className="text-sm">Watch on YouTube</span>
            <IconExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}

      {/* Actions */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Button type="text" size="small" icon={<IconCalendar className="w-4 h-4" />} onClick={() => onViewMiqaats(library)} className="text-purple-600 hover:text-purple-700">
              Miqaats
            </Button>
          </div>

          <div className="flex items-center space-x-2">
            <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="text-xs px-2 py-1 border border-gray-300 rounded" placeholder="Select date" />
          </div>
        </div>
      </div>
    </div>
  )
}
