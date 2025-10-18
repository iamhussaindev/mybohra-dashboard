'use client'

import { TasbeehService } from '@lib/api/tasbeeh'
import { Tasbeeh, TasbeehFilters, TasbeehType } from '@type/tasbeeh'
import { Select, Spin, Empty } from 'antd'
import { useEffect, useState } from 'react'
import TasbeehCard from './TasbeehCard'

interface TasbeehListProps {
  onEdit: (tasbeeh: Tasbeeh) => void
  onDelete: (id: number) => void
  refreshKey?: number
  searchQuery?: string
}

const { Option } = Select

export default function TasbeehList({ onEdit, onDelete, refreshKey = 0, searchQuery = '' }: TasbeehListProps) {
  const [tasbeehs, setTasbeehs] = useState<Tasbeeh[]>([])
  const [loading, setLoading] = useState(false)
  const [typeFilter, setTypeFilter] = useState<TasbeehType | undefined>()

  useEffect(() => {
    loadTasbeehs()
  }, [refreshKey, searchQuery, typeFilter])

  const loadTasbeehs = async () => {
    try {
      setLoading(true)
      
      const filters: TasbeehFilters = {}
      if (typeFilter) {
        filters.type = typeFilter
      }
      if (searchQuery) {
        filters.name = searchQuery
      }

      const data = await TasbeehService.getAll(filters)
      setTasbeehs(data)
    } catch (error) {
      console.error('Failed to load tasbeehs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Filter by type:</span>
        <Select
          placeholder="All Types"
          value={typeFilter}
          onChange={setTypeFilter}
          allowClear
          className="w-48">
          {Object.values(TasbeehType).map(type => (
            <Option key={type} value={type}>
              {type.charAt(0) + type.slice(1).toLowerCase()}
            </Option>
          ))}
        </Select>
        {tasbeehs.length > 0 && (
          <span className="text-sm text-gray-500 ml-auto">
            Showing {tasbeehs.length} tasbeeh{tasbeehs.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Tasbeeh Grid */}
      {tasbeehs.length === 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <Empty
            description={
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tasbeeh Items Found</h3>
                <p className="text-gray-600">
                  {searchQuery || typeFilter
                    ? 'Try adjusting your search or filters'
                    : 'Start by adding your first tasbeeh item'}
                </p>
              </div>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasbeehs.map(tasbeeh => (
            <TasbeehCard
              key={tasbeeh.id}
              tasbeeh={tasbeeh}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  )
}

