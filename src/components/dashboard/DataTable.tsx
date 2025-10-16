'use client'

import { DataService } from '@lib/api/data'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { Data } from '@type/data'
import { Button, Input, Table, Tag } from 'antd'
import { useEffect, useState } from 'react'

interface DataTableProps {
  onDataEdit?: (data: Data) => void
  onDataDelete?: (data: Data) => void
  className?: string
}

export function DataTable({ onDataEdit, className }: DataTableProps) {
  const [data, setData] = useState<Data[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  })

  // Load data
  const loadData = async (page = pagination.current, pageSize = pagination.pageSize) => {
    try {
      setLoading(true)
      setError(null)
      const result = await DataService.getPaginated(page, pageSize)
      setData(result.data)
      setPagination(prev => ({
        ...prev,
        current: page,
        pageSize,
        total: result.total,
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Handle table change
  const handleTableChange = (paginationInfo: any) => {
    loadData(paginationInfo.current, paginationInfo.pageSize)
  }

  // Handle delete
  const handleDelete = async (item: Data) => {
    if (!confirm(`Are you sure you want to delete "${item.key}"?`)) return

    try {
      await DataService.delete(item.id)
      setData(data.filter(d => d.id !== item.id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete data')
    }
  }

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [])

  // Table columns
  const columns = [
    {
      title: 'Key',
      dataIndex: 'key',
      key: 'key',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by key"
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
      render: (key: string) => (
        <div className="flex items-center">
          <Tag color="blue">{key}</Tag>
        </div>
      ),
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      sorter: true,
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder="Search by value"
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
      render: (value: string) => (
        <div className="max-w-xs">
          <p className="text-sm text-gray-800 truncate" title={value}>
            {value || <span className="text-gray-400 italic">No value</span>}
          </p>
        </div>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      sorter: true,
      render: (date: string) => <span className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: 'Updated',
      dataIndex: 'updated_at',
      key: 'updated_at',
      sorter: true,
      render: (date: string) => <span className="text-sm text-gray-500">{new Date(date).toLocaleDateString()}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, item: Data) => (
        <div className="flex items-center space-x-2">
          <Button
            type="text"
            size="small"
            icon={<IconEdit className="w-4 h-4" />}
            onClick={(e: any) => {
              e.stopPropagation()
              onDataEdit?.(item)
            }}
          />
          <Button
            type="text"
            size="small"
            danger
            icon={<IconTrash className="w-4 h-4" />}
            onClick={(e: any) => {
              e.stopPropagation()
              handleDelete(item)
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
        className="shadow-box"
        dataSource={data}
        columns={columns}
        loading={loading}
        rowKey="id"
        onChange={handleTableChange}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} data items`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  )
}
