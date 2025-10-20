'use client'

import DashboardLayout from '@components/layout/DashboardLayout'
import { TasbeehService } from '@lib/api/tasbeeh'
import { IconGridDots, IconList, IconPhoto, IconPlayerPlay, IconPlus, IconVolume } from '@tabler/icons-react'
import { Tasbeeh, TasbeehType } from '@type/tasbeeh'
import { App, Button, Empty, Select, Space, Spin, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'
import TasbeehCard from './TasbeehCard'
import TasbeehForm from './TasbeehForm'

const { Option } = Select

type ViewMode = 'grid' | 'table'

export default function TasbeehList() {
  const [tasbeehs, setTasbeehs] = useState<Tasbeeh[]>([])
  const [allTasbeehs, setAllTasbeehs] = useState<Tasbeeh[]>([])
  const [displayedTasbeehs, setDisplayedTasbeehs] = useState<Tasbeeh[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TasbeehType | undefined>()
  const [availableTypes, setAvailableTypes] = useState<TasbeehType[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>('table')
  const [playingAudio, setPlayingAudio] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }
  const modal = appContext?.modal

  const [showForm, setShowForm] = useState(false)
  const [editingTasbeeh, setEditingTasbeeh] = useState<Tasbeeh | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const pageSize = 20

  useEffect(() => {
    loadTasbeehs()
  }, [refreshKey, searchQuery, typeFilter])

  const loadTasbeehs = async () => {
    try {
      setLoading(true)

      // Load all tasbeehs first (without filters) to get available types
      const allData = await TasbeehService.getAll()
      setAllTasbeehs(allData)

      // Extract unique types from the data
      const uniqueTypes = Array.from(new Set(allData.map(t => t.type)))
      setAvailableTypes(uniqueTypes)

      // Now apply filters
      let filteredData = allData

      if (typeFilter) {
        filteredData = filteredData.filter(t => t.type === typeFilter)
      }

      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filteredData = filteredData.filter(
          t => t.name.toLowerCase().includes(query) || t.description?.toLowerCase().includes(query) || t.text?.toLowerCase().includes(query) || t.tags?.some(tag => tag.toLowerCase().includes(query))
        )
      }

      setTasbeehs(filteredData)
      setDisplayedTasbeehs(filteredData.slice(0, pageSize))
      setPage(1)
      setHasMore(filteredData.length > pageSize)
    } catch (error) {
      console.error('Failed to load tasbeehs:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadMore = () => {
    if (!hasMore || loading) return

    const nextPage = page + 1
    const startIndex = page * pageSize
    const endIndex = startIndex + pageSize
    const newItems = tasbeehs.slice(startIndex, endIndex)

    if (newItems.length > 0) {
      setDisplayedTasbeehs(prev => [...prev, ...newItems])
      setPage(nextPage)
      setHasMore(endIndex < tasbeehs.length)
    } else {
      setHasMore(false)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement
    const bottom = target.scrollHeight - target.scrollTop <= target.clientHeight + 50

    if (bottom && hasMore && !loading) {
      loadMore()
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'DEENI':
        return 'green'
      case 'MISC':
        return 'blue'
      case 'OTHER':
        return 'gray'
      default:
        return 'default'
    }
  }

  const handlePlayAudio = (tasbeeh: Tasbeeh) => {
    if (!tasbeeh.audio) return

    if (playingAudio === tasbeeh.id) {
      setPlayingAudio(null)
    } else {
      const audio = new Audio(tasbeeh.audio)
      audio.onended = () => setPlayingAudio(null)
      audio.onerror = () => setPlayingAudio(null)
      audio.play()
      setPlayingAudio(tasbeeh.id)
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: '25%',
      render: (text: string, record: Tasbeeh) => (
        <div>
          <div className="font-medium text-gray-900">{text}</div>
          {record.description && <div className="text-xs text-gray-500 mt-1 line-clamp-2">{record.description}</div>}
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: '12%',
      render: (type: TasbeehType) => <Tag color={getTypeColor(type)}>{type.charAt(0) + type.slice(1).toLowerCase()}</Tag>,
    },
    {
      title: 'Text',
      dataIndex: 'text',
      key: 'text',
      width: '25%',
      render: (text: string, record: Tasbeeh) => (
        <div className="space-y-1">
          {text && <div className="text-sm text-gray-700 line-clamp-2">{text}</div>}
          {record.arabic_text && (
            <div className="text-sm text-gray-600 line-clamp-1" dir="rtl">
              {record.arabic_text}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Count',
      dataIndex: 'count',
      key: 'count',
      width: '8%',
      align: 'center' as const,
      render: (count: number) => (count > 0 ? <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full font-medium">{count}</span> : <span className="text-gray-400">-</span>),
    },
    {
      title: 'Media',
      key: 'media',
      width: '12%',
      render: (record: Tasbeeh) => (
        <div className="flex items-center gap-2">
          {record.audio && (
            <Button
              type="text"
              size="small"
              icon={playingAudio === record.id ? <IconVolume className="h-4 w-4" /> : <IconPlayerPlay className="h-4 w-4" />}
              onClick={() => handlePlayAudio(record)}
              className="text-green-600 hover:text-green-700"
            />
          )}
          {record.image && <IconPhoto className="h-4 w-4 text-blue-600" />}
        </div>
      ),
    },
    {
      title: 'Tags',
      dataIndex: 'tags',
      key: 'tags',
      width: '15%',
      render: (tags: string[]) => (
        <div className="flex flex-wrap gap-1">
          {tags?.slice(0, 2).map((tag, idx) => (
            <Tag key={idx} color="blue" className="text-xs">
              {tag}
            </Tag>
          ))}
          {tags?.length > 2 && <span className="text-xs text-gray-500">+{tags.length - 2}</span>}
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: '12%',
      render: (record: Tasbeeh) => (
        <Space size="small">
          <Button type="link" size="small" onClick={() => handleEditTasbeeh(record)}>
            Edit
          </Button>
          <Button type="link" danger size="small" onClick={() => handleDeleteTasbeeh(record.id)}>
            Delete
          </Button>
        </Space>
      ),
    },
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  const handleAddTasbeeh = () => {
    setEditingTasbeeh(null)
    setShowForm(true)
  }

  const handleEditTasbeeh = (tasbeeh: Tasbeeh) => {
    setEditingTasbeeh(tasbeeh)
    setShowForm(true)
  }

  const handleDeleteTasbeeh = async (id: number) => {
    modal?.confirm({
      title: 'Delete Tasbeeh',
      content: 'Are you sure you want to delete this tasbeeh? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await TasbeehService.delete(id)
          message.success('Tasbeeh deleted successfully')
          setRefreshKey(prev => prev + 1)
        } catch (error) {
          console.error('Delete error:', error)
          message.error('Failed to delete tasbeeh')
        }
      },
    })
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTasbeeh(null)
  }

  return (
    <DashboardLayout
      title="Tasbeeh Management"
      showSearch={true}
      onSearch={setSearchQuery}
      actions={[
        <Select key="type-filter" placeholder="All Types" value={typeFilter} onChange={setTypeFilter} allowClear className="w-48">
          {availableTypes.length > 0 ? (
            availableTypes.map(type => {
              const count = allTasbeehs.filter(t => t.type === type).length
              return (
                <Option key={type} value={type}>
                  {type.charAt(0) + type.slice(1).toLowerCase()} ({count})
                </Option>
              )
            })
          ) : (
            <Option disabled>No types available</Option>
          )}
        </Select>,
        <Button key="add-tasbeeh" type="primary" icon={<IconPlus className="h-5 w-5" />} onClick={handleAddTasbeeh} className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700">
          Add Tasbeeh
        </Button>,
      ]}>
      <div className="space-y-0 h-full">
        {/* Filters */}
        <div className="flex items-center gap-3 bg-white py-2 px-4 border-b border-gray-200">
          <span className="text-sm font-medium text-gray-700">Filter by type:</span>

          {tasbeehs.length > 0 && (
            <span className="text-sm text-gray-500 ml-auto">
              Showing {tasbeehs.length} of {allTasbeehs.length} tasbeeh{tasbeehs.length !== 1 ? 's' : ''}
            </span>
          )}

          {/* View Mode Toggle */}
          <div className="flex gap-1 ml-4">
            <Button size="small" type={viewMode === 'grid' ? 'primary' : 'default'} icon={<IconGridDots className="h-4 w-4" />} onClick={() => setViewMode('grid')} />
            <Button size="small" type={viewMode === 'table' ? 'primary' : 'default'} icon={<IconList className="h-4 w-4" />} onClick={() => setViewMode('table')} />
          </div>
        </div>
        <TasbeehForm open={showForm} onClose={handleFormClose} onSuccess={handleFormSuccess} editingTasbeeh={editingTasbeeh} />

        {/* Content - Table or Grid View */}
        {tasbeehs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12">
            <Empty
              description={
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasbeeh Items Found</h3>
                  <p className="text-gray-600">{searchQuery || typeFilter ? 'Try adjusting your search or filters' : 'Start by adding your first tasbeeh item'}</p>
                </div>
              }
            />
          </div>
        ) : viewMode === 'table' ? (
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="overflow-auto" onScroll={handleScroll}>
              <Table columns={columns} dataSource={displayedTasbeehs} rowKey="id" pagination={false} scroll={{ x: 'max-content' }} loading={loading} />
              {hasMore && !loading && displayedTasbeehs.length > 0 && (
                <div className="text-center py-4 border-t border-gray-200 bg-gray-50">
                  <Button type="link" onClick={loadMore} size="small">
                    Load More ({tasbeehs.length - displayedTasbeehs.length} remaining)
                  </Button>
                </div>
              )}
              {!hasMore && displayedTasbeehs.length > 0 && (
                <div className="text-center py-3 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">All {displayedTasbeehs.length} items loaded</div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {tasbeehs.map(tasbeeh => (
              <TasbeehCard key={tasbeeh.id} tasbeeh={tasbeeh} onEdit={handleEditTasbeeh} onDelete={handleDeleteTasbeeh} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
