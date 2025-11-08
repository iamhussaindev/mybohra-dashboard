'use client'

import { LoadingOutlined } from '@ant-design/icons'
import { IconEdit } from '@tabler/icons-react'
import { Input, Select, Spin, Table, Tag } from 'antd'
import { useState } from 'react'
import InfiniteScroll from 'react-infinite-scroll-component'

const { Option } = Select

interface InlineEditorColumn {
  title: string
  dataIndex: string
  key: string
  width?: number
  type?: 'text' | 'textarea' | 'select' | 'url' | 'tags' | 'categories'
  options?: Array<{ label: string; value: any }>
  placeholder?: string
}

interface InlineEditorProps<T> {
  editingMode: boolean
  setEditingMode: (editingMode: boolean) => void
  data: T[]
  columns: InlineEditorColumn[]
  onSave: (updatedData: Record<number, Partial<T>>) => Promise<void>
  loading?: boolean
  rowKey: keyof T
  title: string
  onLoadMore?: () => void
  hasMore?: boolean
}

export default function InlineEditor<T extends Record<string, any>>({
  editingMode,
  setEditingMode,
  data,
  columns,
  onSave,
  loading = false,
  rowKey,
  title,
  onLoadMore,
  hasMore = false,
}: InlineEditorProps<T>) {
  const [editingData, setEditingData] = useState<Record<number, Partial<T>>>({})
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)

  const startEditing = () => {
    setEditingMode(true)
    // Initialize editing data with current data
    const initialData: Record<number, Partial<T>> = {}
    data.forEach(item => {
      initialData[item[rowKey] as number] = { ...item }
    })
    setEditingData(initialData)
    setHasChanges(false)
  }

  const cancelEditing = () => {
    setEditingMode(false)
    setEditingData({})
    setHasChanges(false)
  }

  const updateField = (id: number, field: keyof T, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }))
    setHasChanges(true)
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      await onSave(editingData)
      setEditingMode(false)
      setEditingData({})
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to save changes:', error)
    } finally {
      setSaving(false)
    }
  }

  const renderCell = (text: any, record: T, column: InlineEditorColumn) => {
    const id = record[rowKey] as number
    const currentValue = editingData[id]?.[column.dataIndex as keyof T] ?? text

    if (editingMode) {
      switch (column.type) {
        case 'textarea':
          return (
            <Input.TextArea
              value={currentValue || ''}
              onChange={e => updateField(id, column.dataIndex as keyof T, e.target.value)}
              size="small"
              className="border border-gray-300 rounded"
              placeholder={column.placeholder}
              rows={2}
            />
          )
        case 'select':
          return (
            <Select value={currentValue} onChange={value => updateField(id, column.dataIndex as keyof T, value)} size="small" className="w-full" placeholder={column.placeholder}>
              {column.options?.map(option => (
                <Option key={option.value} value={option.value}>
                  {option.label}
                </Option>
              ))}
            </Select>
          )
        case 'url':
          return (
            <Input
              value={currentValue || ''}
              onChange={e => updateField(id, column.dataIndex as keyof T, e.target.value)}
              size="small"
              className="border border-gray-300 rounded"
              placeholder={column.placeholder || 'Enter URL'}
            />
          )
        case 'tags':
          return (
            <Input
              value={Array.isArray(currentValue) ? currentValue.join(', ') : currentValue || ''}
              onChange={e => {
                const tagArray = e.target.value
                  .split(',')
                  .map(tag => tag.trim())
                  .filter(Boolean)
                updateField(id, column.dataIndex as keyof T, tagArray)
              }}
              size="small"
              className="border border-gray-300 rounded"
              placeholder={column.placeholder || 'tag1, tag2, tag3'}
            />
          )
        case 'categories':
          return (
            <Input
              value={Array.isArray(currentValue) ? currentValue.join(', ') : currentValue || ''}
              onChange={e => {
                const categoryArray = e.target.value
                  .split(',')
                  .map(cat => cat.trim())
                  .filter(Boolean)
                updateField(id, column.dataIndex as keyof T, categoryArray)
              }}
              size="small"
              className="border border-gray-300 rounded"
              placeholder={column.placeholder || 'category1, category2'}
            />
          )
        default: // text
          return (
            <Input
              value={currentValue || ''}
              onChange={e => updateField(id, column.dataIndex as keyof T, e.target.value)}
              size="small"
              className="border border-gray-300 rounded"
              placeholder={column.placeholder}
            />
          )
      }
    }

    // Display mode
    switch (column.type) {
      case 'url':
        return (
          <div className="text-sm text-gray-700">
            {text ? (
              <a href={text} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                Link
              </a>
            ) : (
              '-'
            )}
          </div>
        )
      case 'tags':
        return (
          <div className="text-sm text-gray-700">
            {text && text.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {text.slice(0, 2).map((tag: string, idx: number) => (
                  <Tag key={idx} color="blue" className="text-xs">
                    {tag}
                  </Tag>
                ))}
                {text.length > 2 && <span className="text-xs text-gray-500">+{text.length - 2}</span>}
              </div>
            ) : (
              '-'
            )}
          </div>
        )
      case 'categories':
        return (
          <div className="text-sm text-gray-700">
            {text && text.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {text.slice(0, 2).map((category: string, idx: number) => (
                  <Tag key={idx} color="green" className="text-xs">
                    {category}
                  </Tag>
                ))}
                {text.length > 2 && <span className="text-xs text-gray-500">+{text.length - 2}</span>}
              </div>
            ) : (
              '-'
            )}
          </div>
        )
      default:
        return <div className="text-sm text-gray-900">{text || '-'}</div>
    }
  }

  const tableColumns = columns.map(column => ({
    ...column,
    render: (text: any, record: T) => renderCell(text, record, column),
  }))

  return (
    <div className="space-y-4">
      {/* Status Banner */}
      {editingMode && (
        <div className="bg-blue-50 hidden border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <IconEdit className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">Edit Mode Active</span>
            {hasChanges && (
              <Tag color="orange" className="ml-2">
                Unsaved Changes
              </Tag>
            )}
          </div>
          <p className="text-xs text-blue-700 mt-1">Click on any field to edit. Changes are saved temporarily until you click &quot;Save Changes&quot;.</p>
        </div>
      )}

      {/* Table with Infinite Scroll */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" id="inline-editor-scroll-container" style={{ maxHeight: '600px', overflowY: 'auto' }}>
        <InfiniteScroll
          scrollableTarget="inline-editor-scroll-container"
          next={onLoadMore || (() => {})}
          hasMore={hasMore && !!onLoadMore}
          loader={
            <div className="flex justify-center items-center py-4">
              <Spin size="small" indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
            </div>
          }
          endMessage={data.length > 0 ? <div className="text-center py-3 text-xs text-gray-500 border-t border-gray-200 bg-gray-50">All {data.length} items loaded</div> : null}
          dataLength={data.length}>
          <Table columns={tableColumns} dataSource={data} rowKey={rowKey as string} pagination={false} loading={loading} scroll={{ x: 'max-content' }} size="small" />
        </InfiniteScroll>
      </div>
    </div>
  )
}
