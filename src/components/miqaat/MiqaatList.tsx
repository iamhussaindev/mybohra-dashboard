import Table from '@components/ui/atoms/Table'
import { useDebounce } from '@hooks/useDebounce'
import { MiqaatService } from '@lib/api/miqaat'
import { supabase } from '@lib/config/supabase'
import HijriDate from '@lib/helpers/HijriDate'
import { IconCalendar, IconEdit, IconFilter, IconMapPin, IconSearch, IconTrash } from '@tabler/icons-react'
import { Miqaat, MiqaatFilters, MiqaatTypeEnum } from '@type/miqaat'
import { Button, Input, message, Popconfirm, Select, Space, Tag } from 'antd'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'

interface MiqaatListProps {
  onEditMiqaat?: (miqaat: Miqaat) => void
  onDeleteMiqaat?: (id: number) => void
  onViewLibraries?: (miqaat: Miqaat) => void
}

const MiqaatList = ({ onEditMiqaat, onDeleteMiqaat, onViewLibraries }: MiqaatListProps) => {
  const [miqaats, setMiqaats] = useState<Miqaat[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MiqaatFilters>({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 20,
    total: 0,
  })
  const [hasMore, setHasMore] = useState(true)
  const [uploadingId, setUploadingId] = useState<number | null>(null)

  // Debounce search query to avoid excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500)
  const isInitialMount = useRef(true)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const pendingMiqaatRef = useRef<Miqaat | null>(null)

  const loadMiqaatsInternal = async (page: number, pageSize: number, append: boolean, currentFilters: MiqaatFilters, searchQuery: string) => {
    try {
      if (append) {
        setLoadingMore(true)
      } else {
        setLoading(true)
      }

      // Combine filters with debounced search query for server-side filtering
      const combinedFilters: MiqaatFilters = {
        ...currentFilters,
        name: searchQuery || undefined,
      }

      const result = await MiqaatService.getPaginated(page, pageSize, combinedFilters)

      if (append) {
        // Prevent duplicates by checking if items already exist
        setMiqaats(prev => {
          const existingIds = new Set(prev.map(m => m.id))
          const newItems = result.data.filter(item => !existingIds.has(item.id))
          return [...prev, ...newItems]
        })
      } else {
        setMiqaats(result.data)
      }

      setPagination(prev => ({ ...prev, total: result.total, current: page, pageSize }))
      setHasMore(result.data.length === pageSize && page * pageSize < result.total)
    } catch (error) {
      message.error('Failed to load miqaats')
      console.error('Load miqaats error:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  // Refetch function for the Table component's infinite scroll
  const refetch = useCallback(
    async (paginate = false, reset = false) => {
      if (paginate && !loadingMore && !loading && hasMore) {
        const nextPage = pagination.current + 1
        await loadMiqaatsInternal(nextPage, pagination.pageSize, true, filters, debouncedSearchQuery)
      } else if (reset) {
        await loadMiqaatsInternal(1, pagination.pageSize, false, filters, debouncedSearchQuery)
      }
    },
    [loadingMore, loading, hasMore, pagination.current, pagination.pageSize, filters, debouncedSearchQuery]
  )

  // Initial load and reload when filters change
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      loadMiqaatsInternal(1, pagination.pageSize, false, filters, debouncedSearchQuery)
      return
    }
    // Reset to page 1 when filters change
    loadMiqaatsInternal(1, pagination.pageSize, false, filters, debouncedSearchQuery)
  }, [debouncedSearchQuery, filters])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleFilterChange = (key: keyof MiqaatFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleDelete = async (id: number) => {
    try {
      await MiqaatService.delete(id)
      message.success('Miqaat deleted successfully')
      loadMiqaatsInternal(pagination.current, pagination.pageSize, false, filters, debouncedSearchQuery)
      onDeleteMiqaat?.(id)
    } catch (error) {
      message.error('Failed to delete miqaat')
      console.error('Delete error:', error)
    }
  }

  const handleSelectImage = (miqaat: Miqaat) => {
    pendingMiqaatRef.current = miqaat
    fileInputRef.current?.click()
  }

  const handleUploadImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    const selectedMiqaat = pendingMiqaatRef.current

    if (!file || !selectedMiqaat) {
      event.target.value = ''
      pendingMiqaatRef.current = null
      return
    }

    setUploadingId(selectedMiqaat.id)

    try {
      const fileExt = file.name.split('.').pop() || file.type.split('/').pop() || 'jpg'
      const uniqueSuffix = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)
      const filePath = `${selectedMiqaat.id}/${Date.now()}-${uniqueSuffix}.${fileExt}`

      const { error: uploadError } = await supabase.storage.from('miqaat').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      })

      if (uploadError) {
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from('miqaat').getPublicUrl(filePath)
      const publicUrl = urlData.publicUrl

      await MiqaatService.update(selectedMiqaat.id, { image: publicUrl })

      setMiqaats(prev => prev.map(miqaat => (miqaat.id === selectedMiqaat.id ? { ...miqaat, image: publicUrl } : miqaat)))

      message.success('Image uploaded successfully')
    } catch (error) {
      console.error('Image upload error:', error)
      message.error('Failed to upload image')
    } finally {
      setUploadingId(null)
      pendingMiqaatRef.current = null
      event.target.value = ''
    }
  }

  const getTypeColor = (type?: MiqaatTypeEnum) => {
    const colors: Record<string, string> = {
      URS: 'red',
      MILAD: 'green',
      WASHEQ: 'blue',
      PEHLI_RAAT: 'purple',
      SHAHADAT: 'red',
      ASHARA: 'orange',
      IMPORTANT_NIGHT: 'gold',
      EID: 'cyan',
      OTHER: 'default',
    }
    return colors[type || ''] || 'default'
  }

  const formatHijriDate = (date?: number, month?: number) => {
    if (!date || !month) return '-'
    return `${date} ${HijriDate.SHORT_NAMES[month - 1]}`
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (_: string, record: Miqaat) => (
        <div className="flex items-center gap-3">
          {record.image ? (
            <img src={record.image} alt={record.name} className="h-12 w-12 rounded object-cover border border-gray-200" />
          ) : (
            <div className="h-12 w-12 rounded border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400">No Image</div>
          )}
          <Button size="small" onClick={() => handleSelectImage(record)} loading={uploadingId === record.id}>
            {record.image ? 'Change Image' : 'Upload Image'}
          </Button>
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-normal flex items-center gap-2">{text} </div>
          </div>
        </div>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: MiqaatTypeEnum) => (type ? <Tag color={getTypeColor(type)}>{type}</Tag> : '-'),
    },
    {
      title: 'Date',
      key: 'date',
      render: (record: Miqaat) => (
        <div className="space-y-1">
          <div className="flex font-normal items-center gap-1">
            <IconCalendar className="h-3 w-3 text-gray-400" />
            {formatHijriDate(record.date, record.month)}
          </div>
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location?: string) =>
        location ? (
          <div className="flex font-normal items-center gap-1 text-gray-600">
            <IconMapPin className="h-3 w-3" />
            {location}
          </div>
        ) : (
          '-'
        ),
    },

    {
      title: 'Actions',
      key: 'actions',
      render: (record: Miqaat) => (
        <Space>
          <Button type="link" size="small" onClick={() => onEditMiqaat?.(record)} icon={<IconEdit className="h-4 w-4" />}>
            Edit
          </Button>
          <Button type="link" size="small" onClick={() => onViewLibraries?.(record)} className="text-blue-600 hover:text-blue-700">
            View Libraries
          </Button>
          <Popconfirm title="Are you sure you want to delete this miqaat?" onConfirm={() => handleDelete(record.id)} okText="Yes" cancelText="No">
            <Button type="link" size="small" danger icon={<IconTrash className="h-4 w-4" />}>
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input placeholder="Search miqaats..." prefix={<IconSearch className="h-4 w-4 text-gray-400" />} value={searchQuery} onChange={e => handleSearch(e.target.value)} className="w-full" />
          </div>
          <div className="flex gap-2">
            <Select placeholder="Filter by type" style={{ width: 150 }} allowClear onChange={value => handleFilterChange('type', value)}>
              {Object.values(MiqaatTypeEnum).map(type => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
            <Select placeholder="Filter by month" style={{ width: 120 }} allowClear onChange={value => handleFilterChange('month', value)}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <Select.Option key={month} value={month}>
                  {HijriDate.SHORT_NAMES[month - 1]}
                </Select.Option>
              ))}
            </Select>
            <Select placeholder="Important" style={{ width: 120 }} allowClear onChange={value => handleFilterChange('important', value)}>
              <Select.Option value={true}>Important</Select.Option>
              <Select.Option value={false}>Not Important</Select.Option>
            </Select>
            <Button
              icon={<IconFilter className="h-4 w-4" />}
              onClick={() => {
                setFilters({})
                setSearchQuery('')
                loadMiqaatsInternal(1, pagination.pageSize, false, {}, '')
              }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border-t border-gray-200">
        <Table
          showFooter
          columns={columns}
          data={miqaats}
          rowKey="id"
          loading={loading || loadingMore}
          refetch={refetch}
          pagination={{
            total: pagination.total,
            current: pagination.current,
            pageSize: pagination.pageSize,
            hasNextPage: hasMore,
          }}
        />
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUploadImage} />
    </div>
  )
}

export default MiqaatList
