'use client'

import { IconEdit, IconPhoto, IconPlayerPlay, IconTrash, IconVolume } from '@tabler/icons-react'
import { Tasbeeh, TasbeehType } from '@type/tasbeeh'
import { App, Button, Card, Tag } from 'antd'
import { useState } from 'react'

interface TasbeehCardProps {
  tasbeeh: Tasbeeh
  onEdit: (tasbeeh: Tasbeeh) => void
  onDelete: (id: number) => void
}

export default function TasbeehCard({ tasbeeh, onEdit, onDelete }: TasbeehCardProps) {
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(false)

  const handlePlayAudio = () => {
    if (!tasbeeh.audio) {
      message.warning('No audio available for this tasbeeh')
      return
    }

    if (isPlaying) {
      setIsPlaying(false)
      return
    }

    try {
      const audio = new Audio(tasbeeh.audio)
      audio.onended = () => setIsPlaying(false)
      audio.onerror = () => {
        setAudioError(true)
        setIsPlaying(false)
        message.error('Failed to play audio')
      }
      audio.play()
      setIsPlaying(true)
    } catch (error) {
      setAudioError(true)
      message.error('Failed to play audio')
    }
  }

  const getTypeColor = (type: TasbeehType) => {
    switch (type) {
      case TasbeehType.DHIKR:
        return 'green'
      case TasbeehType.DUA:
        return 'blue'
      case TasbeehType.SALAWAT:
        return 'purple'
      case TasbeehType.QURAN:
        return 'red'
      case TasbeehType.OTHER:
        return 'gray'
      default:
        return 'default'
    }
  }

  return (
    <Card
      className="h-full hover:shadow-lg transition-shadow duration-200"
      actions={[
        <Button key="edit" type="text" icon={<IconEdit className="h-4 w-4" />} onClick={() => onEdit(tasbeeh)}>
          Edit
        </Button>,
        <Button key="delete" type="text" danger icon={<IconTrash className="h-4 w-4" />} onClick={() => onDelete(tasbeeh.id)}>
          Delete
        </Button>,
      ]}>
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-lg mb-1">{tasbeeh.name}</h3>
            <Tag color={getTypeColor(tasbeeh.type)} className="mb-2">
              {tasbeeh.type.charAt(0) + tasbeeh.type.slice(1).toLowerCase()}
            </Tag>
          </div>
          {tasbeeh.image && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
              <img
                src={tasbeeh.image}
                alt={tasbeeh.name}
                className="w-full h-full object-cover"
                onError={e => {
                  e.currentTarget.style.display = 'none'
                  e.currentTarget.nextElementSibling?.classList.remove('hidden')
                }}
              />
              <IconPhoto className="h-6 w-6 text-gray-400 hidden" />
            </div>
          )}
        </div>

        {/* Arabic Text */}
        {tasbeeh.arabic_text && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-lg text-gray-800 text-right leading-relaxed" dir="rtl">
              {tasbeeh.arabic_text}
            </p>
          </div>
        )}

        {/* English Text */}
        {tasbeeh.text && (
          <div>
            <p className="text-gray-700 leading-relaxed">{tasbeeh.text}</p>
          </div>
        )}

        {/* Description */}
        {tasbeeh.description && (
          <div>
            <p className="text-sm text-gray-600 italic">{tasbeeh.description}</p>
          </div>
        )}

        {/* Count */}
        {tasbeeh.count > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Default Count:</span>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">{tasbeeh.count}</span>
          </div>
        )}

        {/* Tags */}
        {tasbeeh.tags && tasbeeh.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tasbeeh.tags.map((tag, index) => (
              <Tag key={index} color="blue">
                {tag}
              </Tag>
            ))}
          </div>
        )}

        {/* Audio Player */}
        {tasbeeh.audio && (
          <div className="flex items-center gap-2 pt-2 border-t">
            <Button
              type="primary"
              size="small"
              icon={isPlaying ? <IconVolume className="h-4 w-4" /> : <IconPlayerPlay className="h-4 w-4" />}
              onClick={handlePlayAudio}
              loading={isPlaying}
              disabled={audioError}>
              {isPlaying ? 'Playing...' : 'Play Audio'}
            </Button>
            {audioError && <span className="text-xs text-red-500">Audio unavailable</span>}
          </div>
        )}
      </div>
    </Card>
  )
}
