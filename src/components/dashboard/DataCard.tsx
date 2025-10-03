import { DataService } from '@lib/api/data'
import { IconCheck, IconEdit } from '@tabler/icons-react'
import { Button, Input, message } from 'antd'
import { useEffect, useState } from 'react'

interface DataCardProps {
  dataKey: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

const DataCard = ({ dataKey, title, description, icon: Icon, color }: DataCardProps) => {
  const [data, setData] = useState<{ id: number; value: string | null } | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [inputValue, setInputValue] = useState('0')

  // Load data on mount
  useEffect(() => {
    loadData()
  }, [dataKey])

  // Load data by key or create if not found
  const loadData = async () => {
    try {
      const result = await DataService.getByKeyOrCreate(dataKey, '')
      setData(result)
      setInputValue(result?.value || '')
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  // Handle save
  const handleSave = async () => {
    try {
      setIsLoading(true)

      if (data) {
        // Update existing data
        await DataService.update(data.id, { value: inputValue })
        setData({ ...data, value: inputValue })
      } else {
        // Create new data
        const result = await DataService.create({ key: dataKey, value: inputValue })
        setData(result)
      }

      message.success(`${title} updated successfully`)
      setIsEditing(false)
    } catch (error) {
      message.error('Failed to update data')
      console.error('Update error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    setInputValue(data?.value || '')
    setIsEditing(false)
  }

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-lg transition-all duration-300 overflow-hidden">
      {/* Header with gradient background */}
      <div className="relative px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl ${color} shadow-sm`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">{title}</h3>
              <p className="text-xs text-gray-500 leading-relaxed">{description}</p>
            </div>
          </div>
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all duration-200 group-hover:text-gray-600">
            <IconEdit className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="px-6 py-4">
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                placeholder={description}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                className="text-sm flex-1 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                onPressEnter={handleSave}
                autoFocus
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button size="small" onClick={handleCancel} disabled={isLoading} className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100">
                Cancel
              </Button>
              <Button
                type="primary"
                size="small"
                loading={isLoading}
                onClick={handleSave}
                className="px-4 py-1.5 text-sm font-medium bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700">
                <IconCheck className="h-3 w-3 mr-1" />
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900 mb-1">Current Value</div>
                <div className="text-sm text-gray-700 font-mono bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 min-h-[40px] flex items-center">{data?.value || 'Not set'}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200">
                <IconEdit className="h-3 w-3 mr-1" />
                Edit Value
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Status indicator */}
      <div className="absolute top-4 right-4">
        <div className={`w-2 h-2 rounded-full ${data?.value ? 'bg-green-400' : 'bg-gray-300'}`}></div>
      </div>
    </div>
  )
}

export default DataCard
