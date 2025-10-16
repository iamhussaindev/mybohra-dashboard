import Table from '@components/ui/atoms/Table'
import { LocationService } from '@lib/api/location'
import { Location, LocationFilters } from '@type/location'
import { Button, message, Popconfirm } from 'antd'
import { useEffect, useState } from 'react'

// Props for LocationList component
export interface LocationListProps {
  onEditLocation?: (location: Location) => void
  onDeleteLocation?: (id: number) => void
  searchQuery?: string
}

const LOCATION_TYPES: string[] = ['city', 'state', 'country', 'region', 'spot', 'other']

const LocationList = ({ onEditLocation, onDeleteLocation, searchQuery = '' }: LocationListProps) => {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [filters] = useState<LocationFilters>({})
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null)
  const [sidebarVisible, setSidebarVisible] = useState(false)

  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 50,
    total: 0,
  })

  const [hasNextPage, setHasNextPage] = useState(false)

  const loadLocations = async (page: number = 1, search?: string, currentFilters?: LocationFilters) => {
    try {
      setLoading(true)
      let result

      if (search) {
        const data = await LocationService.search(search, 50)
        result = { data, total: data.length }
      } else {
        result = await LocationService.getAll(page, pagination.pageSize, currentFilters)
      }

      if (page === 1) {
        setLocations(result.data)
      } else {
        setLocations(prev => [...prev, ...result.data])
      }

      setPagination(prev => ({
        ...prev,
        current: page,
        total: result.total,
      }))

      setHasNextPage(result.data.length === pagination.pageSize)
    } catch (error) {
      message.error('Failed to load locations')
      console.error('Load locations error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadLocations(1, searchQuery, filters)
  }, [searchQuery, filters])

  const refetch = async (paginate: boolean = false, reset: boolean = false) => {
    const nextPage = paginate ? pagination.current + 1 : reset ? 1 : pagination.current
    await loadLocations(nextPage, searchQuery, filters)
  }

  const handleEdit = (location: Location) => {
    setSelectedLocation(location)
    setSidebarVisible(true)
    onEditLocation?.(location)
  }

  const handleDelete = async (id: number) => {
    try {
      await LocationService.delete(id)
      message.success('Location deleted successfully')
      loadLocations(1, searchQuery, filters)
      onDeleteLocation?.(id)
      if (selectedLocation?.id === id) {
        setSidebarVisible(false)
        setSelectedLocation(null)
      }
    } catch (error) {
      message.error('Failed to delete location')
      console.error('Delete error:', error)
    }
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => <div className="text-sm text-gray-700">{id}</div>,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => <div className="text-sm text-gray-700 capitalize">{type}</div>,
      filters: LOCATION_TYPES.map(type => ({ text: type.charAt(0).toUpperCase() + type.slice(1), value: type })),
      onFilter: (value: string, record: Location) => record.type === value,
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      width: 150,
      render: (city: string) => <div className="text-sm font-medium text-gray-900">{city}</div>,
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 120,
      render: (state: string) => <div className="text-sm text-gray-700">{state || '-'}</div>,
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      width: 120,
      render: (country: string) => <div className="text-sm text-gray-700">{country}</div>,
    },
    {
      title: 'Latitude',
      dataIndex: 'latitude',
      key: 'latitude',
      width: 100,
      render: (lat: number) => <div className="text-xs text-gray-600">{lat.toFixed(4)}</div>,
    },
    {
      title: 'Longitude',
      dataIndex: 'longitude',
      key: 'longitude',
      width: 100,
      render: (lng: number) => <div className="text-xs text-gray-600">{lng.toFixed(4)}</div>,
    },
    {
      title: 'Timezone',
      dataIndex: 'timezone',
      key: 'timezone',
      width: 150,
      render: (timezone: string) => <div className="text-xs text-gray-600">{timezone}</div>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (record: Location) => (
        <div className="flex space-x-2">
          <Button type="link" size="small" onClick={() => handleEdit(record)} className="text-xs p-0">
            Edit
          </Button>
          <Popconfirm title="Delete this location?" description="This action cannot be undone." onConfirm={() => handleDelete(record.id)} okText="Delete" cancelText="Cancel">
            <Button type="link" size="small" danger className="text-xs p-0">
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className="flex h-full">
      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${sidebarVisible ? 'w-[calc(100%-400px)]' : 'w-full'}`}>
        <div className="h-full overflow-auto">
          <div className="bg-white/80 overflow-hidden">
            <Table
              columns={columns}
              data={locations}
              rowKey="id"
              sticky={true}
              $clickable={true}
              onRow={record => ({
                onClick: () => {
                  setSelectedLocation(record)
                  setSidebarVisible(true)
                },
                style: {
                  cursor: 'pointer',
                  backgroundColor: record.id === selectedLocation?.id ? 'rgb(219, 234, 254)' : 'transparent',
                },
              })}
              loading={loading}
              refetch={refetch}
              pagination={{
                current: pagination.current,
                pageSize: pagination.pageSize,
                total: pagination.total,
                hasNextPage: hasNextPage,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default LocationList
