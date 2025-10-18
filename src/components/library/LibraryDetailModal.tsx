'use client'

import { IconBook, IconFile, IconMusic, IconTag, IconX } from '@tabler/icons-react'
import { Library } from '@type/library'
import { Button, Modal, Tag } from 'antd'
import { useRef, useState } from 'react'

interface LibraryDetailModalProps {
  library: Library | null
  open: boolean
  onClose: () => void
}

export default function LibraryDetailModal({ library, open, onClose }: LibraryDetailModalProps) {
  const [audioPlaying, setAudioPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  if (!library) return null

  const handlePlayAudio = () => {
    if (!library.audio_url) return

    if (audioPlaying) {
      audioRef.current?.pause()
      setAudioPlaying(false)
    } else {
      if (audioRef.current) {
        audioRef.current.src = library.audio_url
        audioRef.current
          .play()
          .then(() => {
            setAudioPlaying(true)
            setAudioError(false)
          })
          .catch(error => {
            console.error('Audio playback error:', error)
            setAudioError(true)
            setAudioPlaying(false)
          })
      }
    }
  }

  const handleAudioEnded = () => {
    setAudioPlaying(false)
  }

  const handleAudioError = () => {
    setAudioError(true)
    setAudioPlaying(false)
  }

  const getAlbumColor = (album?: string) => {
    switch (album) {
      case 'SAHIFA':
        return 'purple'
      case 'MUNAJAAT':
        return 'blue'
      case 'QURAN':
        return 'green'
      case 'HADITH':
        return 'orange'
      default:
        return 'default'
    }
  }

  return (
    <>
      <Modal
        title={
          <div className="flex items-center gap-2">
            <IconBook className="h-5 w-5 text-blue-600" />
            <span>{library.name}</span>
          </div>
        }
        open={open}
        onCancel={onClose}
        footer={[
          <Button key="close" onClick={onClose}>
            Close
          </Button>,
        ]}
        width={700}>
        <div className="space-y-4 mt-4">
          {/* Description */}
          {library.description && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Description</h4>
              <p className="text-gray-600">{library.description}</p>
            </div>
          )}

          {/* Album */}
          {library.album && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Album</h4>
              <Tag color={getAlbumColor(library.album)} icon={<IconTag className="h-3 w-3" />}>
                {library.album}
              </Tag>
            </div>
          )}

          {/* Arabic Text */}
          {(library as any).arabic_text && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Arabic Text</h4>
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200" dir="rtl">
                <p className="text-lg leading-relaxed">{(library as any).arabic_text}</p>
              </div>
            </div>
          )}

          {/* Transliteration */}
          {(library as any).transliteration && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Transliteration</h4>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-gray-700 leading-relaxed italic">{(library as any).transliteration}</p>
              </div>
            </div>
          )}

          {/* Translation */}
          {(library as any).translation && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Translation</h4>
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <p className="text-gray-700 leading-relaxed">{(library as any).translation}</p>
              </div>
            </div>
          )}

          {/* Audio Player */}
          {library.audio_url && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Audio</h4>
              <div className="flex items-center gap-2">
                <Button type="primary" icon={audioPlaying ? <IconX className="h-4 w-4" /> : <IconMusic className="h-4 w-4" />} onClick={handlePlayAudio} disabled={audioError}>
                  {audioPlaying ? 'Stop Audio' : 'Play Audio'}
                </Button>
                {audioError && <span className="text-red-500 text-sm">Failed to load audio</span>}
              </div>
            </div>
          )}

          {/* PDF Link */}
          {library.pdf_url && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">PDF Document</h4>
              <Button type="link" icon={<IconFile className="h-4 w-4" />} href={library.pdf_url} target="_blank">
                View PDF
              </Button>
            </div>
          )}

          {/* YouTube Link */}
          {library.youtube_url && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">YouTube</h4>
              <Button type="link" icon={<IconFile className="h-4 w-4" />} href={library.youtube_url} target="_blank">
                Watch on YouTube
              </Button>
            </div>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {library.created_at && library.created_at !== '1970-01-01T00:00:00.000Z' && (
                <div>
                  <span className="text-gray-500">Created:</span>
                  <span className="ml-2 text-gray-700">{new Date(library.created_at).toLocaleDateString()}</span>
                </div>
              )}
              {library.updated_at && library.updated_at !== '1970-01-01T00:00:00.000Z' && (
                <div>
                  <span className="text-gray-500">Updated:</span>
                  <span className="ml-2 text-gray-700">{new Date(library.updated_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </Modal>

      {/* Hidden audio element */}
      <audio ref={audioRef} onEnded={handleAudioEnded} onError={handleAudioError} className="hidden" />
    </>
  )
}
