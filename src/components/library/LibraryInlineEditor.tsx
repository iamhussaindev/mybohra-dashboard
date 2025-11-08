'use client'

import DashboardLayout from '@components/layout/DashboardLayout'
import InlineEditor from '@components/shared/InlineEditor'
import { LibraryService } from '@lib/api/library'
import { IconEdit } from '@tabler/icons-react'
import { AlbumEnum, Library } from '@type/library'
import { App, Button } from 'antd'
import { useEffect, useState } from 'react'

export default function LibraryInlineEditor() {
  const [libraries, setLibraries] = useState<Library[]>([])
  const [loading, setLoading] = useState(false)
  const [editingMode, setEditingMode] = useState(false)

  const appContext = App.useApp()
  const messageApi = appContext?.message || { error: console.error, success: console.log, warning: console.warn }

  useEffect(() => {
    loadLibraries()
  }, [])

  const loadLibraries = async () => {
    try {
      setLoading(true)
      const data = await LibraryService.getAll()
      setLibraries(data)
    } catch (error) {
      console.error('Failed to load libraries:', error)
      messageApi.error('Failed to load libraries')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (updatedData: Record<number, Partial<Library>>) => {
    try {
      setLoading(true)
      const updatePromises = Object.entries(updatedData).map(([id, data]) => {
        if (data && Object.keys(data).length > 0) {
          return LibraryService.update(parseInt(id), data)
        }
        return Promise.resolve()
      })

      await Promise.all(updatePromises)
      messageApi.success('All changes saved successfully')
      loadLibraries() // Refresh data
    } catch (error) {
      console.error('Failed to save changes:', error)
      messageApi.error('Failed to save changes')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      type: 'text' as const,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      type: 'text' as const,
      placeholder: 'Enter name',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      width: 200,
      type: 'textarea' as const,
      placeholder: 'Enter description',
    },
    {
      title: 'Album',
      dataIndex: 'album',
      key: 'album',
      width: 150,
      type: 'select' as const,
      options: Object.values(AlbumEnum).map(album => ({ label: album, value: album })),
      placeholder: 'Select album',
    },
    {
      title: 'Audio URL',
      dataIndex: 'audio_url',
      key: 'audio_url',
      width: 200,
      type: 'url' as const,
      placeholder: 'Enter audio URL',
    },
    {
      title: 'PDF URL',
      dataIndex: 'pdf_url',
      key: 'pdf_url',
      width: 200,
      type: 'url' as const,
      placeholder: 'Enter PDF URL',
    },
    {
      title: 'YouTube URL',
      dataIndex: 'youtube_url',
      key: 'youtube_url',
      width: 200,
      type: 'url' as const,
      placeholder: 'Enter YouTube URL',
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: 200,
      type: 'tags' as const,
      placeholder: 'tag1, tag2, tag3',
    },
    {
      title: 'Categories',
      dataIndex: 'categories',
      key: 'categories',
      width: 200,
      type: 'categories' as const,
      placeholder: 'category1, category2',
    },
  ]

  return (
    <DashboardLayout
      actions={[
        <Button key="edit-mode" type="primary" icon={<IconEdit className="h-4 w-4" />} onClick={() => setEditingMode(!editingMode)}>
          {editingMode ? 'View Mode' : 'Edit Mode'}
        </Button>,
      ]}
      title="Library Inline Editor">
      <InlineEditor editingMode={editingMode} setEditingMode={setEditingMode} data={libraries} columns={columns} onSave={handleSave} loading={loading} rowKey="id" title="Library Management" />
    </DashboardLayout>
  )
}
