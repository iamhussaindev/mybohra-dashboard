'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import LocationForm from '@components/location/LocationForm'
import LocationList from '@components/location/LocationList'
import { LocationService } from '@lib/api/location'
import { IconPlus } from '@tabler/icons-react'
import { CreateLocationRequest, Location, UpdateLocationRequest } from '@type/location'
import { Button, message, Modal } from 'antd'
import { useState } from 'react'

function LocationManagement() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | undefined>(undefined)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreateOrUpdate = async (data: CreateLocationRequest | UpdateLocationRequest) => {
    try {
      if (editingLocation) {
        await LocationService.update(editingLocation.id, data as UpdateLocationRequest)
        message.success('Location updated successfully')
      } else {
        await LocationService.create(data as CreateLocationRequest)
        message.success('Location created successfully')
      }
      setIsModalOpen(false)
      setEditingLocation(undefined)
      setRefreshKey(prev => prev + 1)
    } catch (error) {
      message.error(editingLocation ? 'Failed to update location' : 'Failed to create location')
      console.error('Form submit error:', error)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setIsModalOpen(true)
  }

  const handleDelete = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout
      title="Location Management"
      showSearch={true}
      onSearch={setSearchQuery}
      actions={[
        <Button
          key="add-location"
          type="primary"
          icon={<IconPlus className="h-5 w-5" />}
          onClick={() => {
            setEditingLocation(undefined)
            setIsModalOpen(true)
          }}
          className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700">
          Add Location
        </Button>,
      ]}>
      <LocationList key={refreshKey} searchQuery={searchQuery} onEditLocation={handleEdit} onDeleteLocation={handleDelete} />

      <Modal title={editingLocation ? 'Edit Location' : 'Create Location'} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null} width={600}>
        <LocationForm location={editingLocation} onSubmit={handleCreateOrUpdate} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </DashboardLayout>
  )
}

export default function LocationPage() {
  return (
    <AuthGuard>
      <LocationManagement />
    </AuthGuard>
  )
}
