import Table from '@components/ui/atoms/Table'
import { UserService } from '@lib/api/generated/user'
import { User } from '@lib/schema/types'
import { IconGlobe, IconMail, IconPencil, IconPhone, IconTrash, IconUser } from '@tabler/icons-react'
import { Button, Input, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface UserTableProps {
  onUserClick?: (user: User) => void
  onUserEdit?: (user: User) => void
  onUserDelete?: (user: User) => void
  onUserCreate?: () => void
  onUserUpdated?: () => void
  className?: string
}

export function UserTable({ onUserClick, onUserEdit, onUserUpdated, className }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })
  const [filters, setFilters] = useState<Record<string, any>>({})
  const [sorter, setSorter] = useState<{ field?: string; order?: 'ascend' | 'descend' }>({})

  // Load users with server-side filtering, sorting, and pagination
  const loadUsers = async (page = pagination.current, pageSize = pagination.pageSize, filterParams = filters, sortParams = sorter) => {
    try {
      setLoading(true)
      setError(null)

      // Import supabase directly for advanced queries
      const { supabase } = await import('@lib/config/supabase')

      let query = supabase.from('user').select('*', { count: 'exact' })

      // Apply filters
      Object.entries(filterParams).forEach(([key, value]) => {
        if (value && value.length > 0) {
          if (key === 'name' || key === 'email' || key === 'phone_number' || key === 'country') {
            // Text search filters
            query = query.ilike(key, `%${value}%`)
          } else if (key === 'status') {
            // Status filter
            query = query.in('status', value)
          } else if (key === 'roles') {
            // Roles filter - check if user has any of the selected roles
            // Since roles is stored as an array, we use array overlap operator
            query = query.overlaps('roles', value)
          }
        }
      })

      // Apply sorting
      if (sortParams.field && sortParams.order) {
        const ascending = sortParams.order === 'ascend'
        query = query.order(sortParams.field, { ascending })
      } else {
        // Default sorting by created_at desc
        query = query.order('created_at', { ascending: false })
      }

      // Apply pagination
      const start = (page - 1) * pageSize
      query = query.range(start, start + pageSize - 1)

      const { data, error, count } = await query

      if (error) throw error

      setUsers(data || [])
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: count || 0,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  // Handle table change (sorting, pagination, filtering)
  const handleTableChange = (paginationInfo: any, tableFilters: any, tableSorter: any) => {
    const newPagination = {
      current: paginationInfo.current,
      pageSize: paginationInfo.pageSize,
    }

    const newSorter = {
      field: tableSorter.field,
      order: tableSorter.order,
    }

    const newFilters = { ...filters }

    // Update filters from table filters
    Object.entries(tableFilters).forEach(([key, value]) => {
      if (value && Array.isArray(value) && value.length > 0) {
        newFilters[key] = value
      } else if (value && !Array.isArray(value) && value) {
        newFilters[key] = value
      } else {
        delete newFilters[key]
      }
    })

    // Update state
    setPagination(prev => ({ ...prev, ...newPagination }))
    setSorter(newSorter)
    setFilters(newFilters)

    // Reload data with new parameters
    loadUsers(newPagination.current, newPagination.pageSize, newFilters, newSorter)
  }

  // Handle delete
  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete ${user.name}?`)) return

    try {
      await UserService.delete(user.id.toString())
      const updatedUsers = users.filter(u => u.id !== user.id)
      setUsers(updatedUsers)
      onUserUpdated?.()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  // Load users on mount and when refresh is triggered
  useEffect(() => {
    loadUsers()
  }, [refreshTrigger])

  // Listen for external refresh trigger
  useEffect(() => {
    if (onUserUpdated) {
      setRefreshTrigger(prev => prev + 1)
    }
  }, [onUserUpdated])

  // Render user status badge
  const renderStatus = (status: string) => {
    const statusConfig = {
      CREATED: { color: 'blue', label: 'Created' },
      ACTIVE: { color: 'green', label: 'Active' },
      INACTIVE: { color: 'default', label: 'Inactive' },
      SUSPENDED: { color: 'red', label: 'Suspended' },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { color: 'default', label: status }

    return <Tag color={config.color}>{config.label}</Tag>
  }

  // Render roles
  const renderRoles = (roles: string) => {
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return (
      <div className="flex flex-wrap gap-1">
        {roleArray.map((role, index) => (
          <Tag key={index} color="blue">
            {role}
          </Tag>
        ))}
      </div>
    )
  }

  // Table columns with inline filters
  const columns = [
    {
      title: 'User',
      dataIndex: 'name',
      key: 'name',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by name"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        </div>
      ),
      render: (name: string, user: User) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <IconUser className="w-4 h-4 text-blue-600" />
            </div>
          </div>
          <div>
            <div className="font-medium text-gray-900">{name}</div>
            <div className="text-sm text-gray-500">ID: {user.id}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by email"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        </div>
      ),
      render: (email: string) => (
        <div className="flex items-center space-x-2">
          <IconMail className="w-4 h-4 text-gray-400" />
          <span className="text-sm">{email}</span>
        </div>
      ),
    },
    {
      title: 'Phone',
      dataIndex: 'phone_number',
      key: 'phone_number',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by phone"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        </div>
      ),
      render: (phone: string) =>
        phone ? (
          <div className="flex items-center space-x-2">
            <IconPhone className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{phone}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">No phone</span>
        ),
    },
    {
      title: 'Country',
      dataIndex: 'country',
      key: 'country',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by country"
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => confirm()}
            style={{ marginBottom: 8, display: 'block' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <Button type="primary" onClick={() => confirm()} size="small" style={{ width: 90 }}>
              Search
            </Button>
            <Button onClick={() => clearFilters()} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </div>
        </div>
      ),
      render: (country: string) =>
        country ? (
          <div className="flex items-center space-x-2">
            <IconGlobe className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{country}</span>
          </div>
        ) : (
          <span className="text-sm text-gray-400">Not set</span>
        ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      key: 'roles',
      filters: [
        { text: 'User', value: 'user' },
        { text: 'Admin', value: 'admin' },
        { text: 'Manager', value: 'manager' },
      ],
      render: (roles: string) => renderRoles(roles),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: true,
      filters: [
        { text: 'Created', value: 'CREATED' },
        { text: 'Active', value: 'ACTIVE' },
        { text: 'Inactive', value: 'INACTIVE' },
        { text: 'Suspended', value: 'SUSPENDED' },
      ],
      render: (status: string) => renderStatus(status),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (date: string) => <span className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, user: User) => (
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            size="small"
            icon={<IconPencil className="w-4 h-4" />}
            onClick={(e: any) => {
              e.stopPropagation()
              onUserEdit?.(user)
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<IconTrash className="w-4 h-4" />}
            onClick={(e: any) => {
              e.stopPropagation()
              handleDelete(user)
            }}
          />
        </div>
      ),
    },
  ]

  return (
    <div className={className}>
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <div className="text-sm text-red-600">{error}</div>
        </div>
      )}

      <Table
        showFooter
        columns={columns}
        loading={loading}
        rowKey="id"
        onRow={record => ({
          onClick: () => onUserClick?.(record),
          style: { cursor: 'pointer' },
        })}
        data={users}
        onChange={handleTableChange}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  )
}
