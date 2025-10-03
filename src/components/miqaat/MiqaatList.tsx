import { MiqaatService } from '@lib/api/miqaat'
import { IconCalendar, IconEdit, IconFilter, IconMapPin, IconMoon, IconSearch, IconStar, IconSun, IconTrash } from '@tabler/icons-react'
import { Miqaat, MiqaatFilters, MiqaatTypeEnum, PhaseEnum } from '@type/miqaat'
import { Badge, Button, Input, message, Popconfirm, Select, Space, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface MiqaatListProps {
  onEditMiqaat?: (miqaat: Miqaat) => void
  onDeleteMiqaat?: (id: number) => void
  onViewLibraries?: (miqaat: Miqaat) => void
}

const MiqaatList = ({ onEditMiqaat, onDeleteMiqaat, onViewLibraries }: MiqaatListProps) => {
  const [miqaats, setMiqaats] = useState<Miqaat[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<MiqaatFilters>({})
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  const loadMiqaats = async (page = 1, search = '', filterData: MiqaatFilters = {}) => {
    try {
      setLoading(true)

      const result = await MiqaatService.getPaginated(page, pagination.pageSize, filterData)
      setMiqaats(result.data)
      setPagination(prev => ({ ...prev, total: result.total, current: page }))
    } catch (error) {
      message.error('Failed to load miqaats')
      console.error('Load miqaats error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadMiqaats()
  }, [])

  const handleSearch = (value: string) => {
    setSearchQuery(value)
    const searchFilters = { ...filters, name: value }
    loadMiqaats(1, value, searchFilters)
  }

  const handleFilterChange = (key: keyof MiqaatFilters, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    loadMiqaats(1, searchQuery, newFilters)
  }

  const handleDelete = async (id: number) => {
    try {
      await MiqaatService.delete(id)
      message.success('Miqaat deleted successfully')
      loadMiqaats(pagination.current, searchQuery, filters)
      onDeleteMiqaat?.(id)
    } catch (error) {
      message.error('Failed to delete miqaat')
      console.error('Delete error:', error)
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

  const formatDate = (date?: number, month?: number) => {
    if (!date || !month) return '-'
    return `${date}/${month}`
  }

  const getPhaseIcon = (phase: PhaseEnum) => {
    return phase === PhaseEnum.DAY ? <IconSun className="h-4 w-4 text-yellow-500" /> : <IconMoon className="h-4 w-4 text-blue-500" />
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: Miqaat) => (
        <div className="flex items-center gap-2">
          <div>
            <div className="font-medium text-gray-900 flex items-center gap-2">
              {text}
              {record.important && <IconStar className="h-4 w-4 text-yellow-500" />}
            </div>
            {record.description && <div className="text-sm text-gray-500 mt-1">{record.description}</div>}
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
          <div className="flex items-center gap-1 text-sm">
            <IconCalendar className="h-3 w-3 text-gray-400" />
            {formatDate(record.date, record.month)}
          </div>
          {record.date_night && record.month_night && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <IconMoon className="h-3 w-3 text-gray-400" />
              {formatDate(record.date_night, record.month_night)}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: (location?: string) =>
        location ? (
          <div className="flex items-center gap-1 text-sm text-gray-600">
            <IconMapPin className="h-3 w-3" />
            {location}
          </div>
        ) : (
          '-'
        ),
    },
    {
      title: 'Phase',
      dataIndex: 'phase',
      key: 'phase',
      render: (phase: PhaseEnum) => (
        <div className="flex items-center gap-1">
          {getPhaseIcon(phase)}
          <span className="text-sm">{phase}</span>
        </div>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority?: number) => (priority ? <Badge count={priority} color="blue" /> : '-'),
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
      <div className="bg-white p-4 rounded-lg border border-gray-200">
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
                  {month}
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
                loadMiqaats()
              }}>
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <Table
          columns={columns}
          dataSource={miqaats}
          rowKey="id"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            onChange: (page, pageSize) => {
              setPagination(prev => ({ ...prev, pageSize: pageSize || 10 }))
              loadMiqaats(page, searchQuery, filters)
            },
          }}
        />
      </div>
    </div>
  )
}

export default MiqaatList
