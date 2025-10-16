import { CreateLocationRequest, Location, UpdateLocationRequest } from '@type/location'
import { Button, Input, Select } from 'antd'
import { useEffect, useState } from 'react'

interface LocationFormProps {
  location?: Location
  onSubmit: (data: CreateLocationRequest | UpdateLocationRequest) => void
  onCancel: () => void
}

const LOCATION_TYPES = ['city', 'state', 'country', 'region', 'other', 'spot']

const TIMEZONES = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Phoenix',
  'America/Anchorage',
  'Pacific/Honolulu',
  'Europe/London',
  'Europe/Paris',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Singapore',
  'Asia/Tokyo',
  'Australia/Sydney',
  'UTC',
]

const LocationForm = ({ location, onSubmit, onCancel }: LocationFormProps) => {
  const [formData, setFormData] = useState<CreateLocationRequest>({
    type: location?.type || 'city',
    city: location?.city || '',
    country: location?.country || '',
    latitude: location?.latitude || 0,
    longitude: location?.longitude || 0,
    timezone: location?.timezone || 'UTC',
    state: location?.state || '',
  })

  useEffect(() => {
    if (location) {
      setFormData({
        type: location.type,
        city: location.city,
        country: location.country,
        latitude: location.latitude,
        longitude: location.longitude,
        timezone: location.timezone,
        state: location.state,
      })
    }
  }, [location])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
        <Select
          value={formData.type}
          onChange={value => setFormData({ ...formData, type: value })}
          className="w-full"
          options={LOCATION_TYPES.map(type => ({ label: type.charAt(0).toUpperCase() + type.slice(1), value: type }))}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
        <Input value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} placeholder="Enter city name" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
        <Input value={formData.country} onChange={e => setFormData({ ...formData, country: e.target.value })} placeholder="Enter country name" required />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
        <Input value={formData.state} onChange={e => setFormData({ ...formData, state: e.target.value })} placeholder="Enter state/province (optional)" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Latitude *</label>
          <Input type="number" step="any" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} placeholder="e.g., 40.7128" required />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Longitude *</label>
          <Input type="number" step="any" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} placeholder="e.g., -74.0060" required />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Timezone *</label>
        <Select value={formData.timezone} onChange={value => setFormData({ ...formData, timezone: value })} className="w-full" showSearch options={TIMEZONES.map(tz => ({ label: tz, value: tz }))} />
      </div>

      <div className="flex space-x-2 pt-4">
        <Button type="primary" htmlType="submit" className="flex-1">
          {location ? 'Update' : 'Create'} Location
        </Button>
        <Button onClick={onCancel} className="flex-1">
          Cancel
        </Button>
      </div>
    </form>
  )
}

export default LocationForm
