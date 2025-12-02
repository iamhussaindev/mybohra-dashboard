'use client'

import DashboardLayout from '@components/layout/DashboardLayout'
import { MazaarService } from '@lib/api/mazaar'
import { IconMapPin, IconPencil, IconPhoto, IconPlus, IconTrash } from '@tabler/icons-react'
import { Mazaar } from '@type/mazaar'
import { App, Button, Empty, Modal, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import MazaarForm from './MazaarForm'

export default function MazaarList() {
  const [mazaars, setMazaars] = useState<Mazaar[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMazaar, setEditingMazaar] = useState<Mazaar | null>(null)
  const { modal } = App.useApp()

  useEffect(() => {
    loadMazaars()
  }, [searchQuery])

  const loadMazaars = async () => {
    try {
      setLoading(true)
      const data = await MazaarService.getAll({ name: searchQuery || undefined })
      setMazaars(data)
    } catch (error) {
      console.error('Failed to load mazaars:', error)
      message.error('Failed to load mazaars')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleCreate = () => {
    setEditingMazaar(null)
    setShowForm(true)
  }

  const handleEdit = (mazaar: Mazaar) => {
    setEditingMazaar(mazaar)
    setShowForm(true)
  }

  const handleDelete = (mazaar: Mazaar) => {
    modal.confirm({
      title: 'Delete Mazaar',
      content: `Are you sure you want to delete "${mazaar.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await MazaarService.delete(mazaar.id)
          message.success('Mazaar deleted successfully')
          loadMazaars()
        } catch (error) {
          message.error('Failed to delete mazaar')
        }
      },
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMazaar(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadMazaars()
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Mazaar, b: Mazaar) => a.name.localeCompare(b.name),
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: any, record: Mazaar) => (
        <div className="flex items-center gap-2">
          {record.lat && record.lng ? (
            <>
              <IconMapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {record.lat.toFixed(6)}, {record.lng.toFixed(6)}
              </span>
            </>
          ) : (
            <span className="text-sm text-gray-400">No location</span>
          )}
        </div>
      ),
    },
    {
      title: 'Contact',
      dataIndex: 'contact',
      key: 'contact',
      render: (contact: string) => contact || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Photos',
      key: 'photos',
      render: (_: any, record: Mazaar) => (
        <div className="flex items-center gap-1">
          <IconPhoto className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{record.photos?.length || 0}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Mazaar) => (
        <div className="flex items-center gap-2">
          <Button type="text" size="small" icon={<IconPencil className="w-4 h-4" />} onClick={() => handleEdit(record)} />
          <Button type="text" size="small" danger icon={<IconTrash className="w-4 h-4" />} onClick={() => handleDelete(record)} />
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Mazaars"
      subtitle="Manage mazaars (shrines)"
      showSearch={true}
      onSearch={handleSearch}
      actions={[
        <Button key="add-mazaar" type="primary" icon={<IconPlus className="w-4 h-4" />} onClick={handleCreate}>
          Add Mazaar
        </Button>,
      ]}
      padding="24px">
      {/* Table */}
      {mazaars.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <Empty description="No mazaars found. Create your first mazaar to get started." />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table columns={columns} dataSource={mazaars} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onCancel={handleFormClose} footer={null} width={800} title={editingMazaar ? 'Edit Mazaar' : 'Create Mazaar'}>
        <MazaarForm mazaar={editingMazaar} onSuccess={handleFormSuccess} onCancel={handleFormClose} />
      </Modal>
    </DashboardLayout>
  )
}
