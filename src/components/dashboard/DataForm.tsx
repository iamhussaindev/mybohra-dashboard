'use client'

import { Data } from '@type/data'
import { Input } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface DataFormProps {
  data?: Data | null
}

export interface DataFormRef {
  getFormData: () => any
}

const DataForm = forwardRef<DataFormRef, DataFormProps>(({ data }, ref) => {
  const [formData, setFormData] = useState({
    key: '',
    value: '',
  })
  const [errors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (data) {
      setFormData({
        key: data.key,
        value: data.value || '',
      })
    }
  }, [data])

  useImperativeHandle(ref, () => ({
    getFormData: () => formData,
  }))

  return (
    <div className="py-6">
      <form className="space-y-6">
        {/* Key Field */}
        <div>
          <label htmlFor="key" className="block text-sm font-medium text-gray-700 mb-2">
            Key *
          </label>
          <Input
            id="key"
            value={formData.key}
            onChange={e => setFormData(prev => ({ ...prev, key: e.target.value }))}
            placeholder="Enter data key"
            status={errors.key ? 'error' : undefined}
            size="large"
          />
          {errors.key && <p className="mt-1 text-sm text-red-600">{errors.key}</p>}
        </div>

        {/* Value Field */}
        <div>
          <label htmlFor="value" className="block text-sm font-medium text-gray-700 mb-2">
            Value
          </label>
          <Input.TextArea
            id="value"
            value={formData.value}
            onChange={e => setFormData(prev => ({ ...prev, value: e.target.value }))}
            placeholder="Enter data value (optional)"
            status={errors.value ? 'error' : undefined}
            size="large"
            rows={4}
          />
          {errors.value && <p className="mt-1 text-sm text-red-600">{errors.value}</p>}
        </div>
      </form>
    </div>
  )
})

DataForm.displayName = 'DataForm'

export default DataForm
