'use client'

import DashboardLayout from '@components/layout/DashboardLayout'
import { MusafirkhanaService } from '@lib/api/musafirkhana'
import { Musafirkhana } from '@type/mazaar'
import { IconBed, IconMapPin, IconPencil, IconPhoto, IconPlus, IconTrash } from '@tabler/icons-react'
import { App, Button, Empty, Modal, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import MusafirkhanaForm from './MusafirkhanaForm'

export default function MusafirkhanaList() {
  const [musafirkhana, setMusafirkhana] = useState<Musafirkhana[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingMusafirkhana, setEditingMusafirkhana] = useState<Musafirkhana | null>(null)
  const { modal } = App.useApp()

  useEffect(() => {
    loadMusafirkhana()
  }, [searchQuery])

  const loadMusafirkhana = async () => {
    try {
      setLoading(true)
      const data = await MusafirkhanaService.getAll({ name: searchQuery || undefined })
      setMusafirkhana(data)
    } catch (error) {
      console.error('Failed to load musafirkhana:', error)
      message.error('Failed to load musafirkhana')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleCreate = () => {
    setEditingMusafirkhana(null)
    setShowForm(true)
  }

  const handleEdit = (item: Musafirkhana) => {
    setEditingMusafirkhana(item)
    setShowForm(true)
  }

  const handleDelete = (item: Musafirkhana) => {
    modal.confirm({
      title: 'Delete Musafirkhana',
      content: `Are you sure you want to delete "${item.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await MusafirkhanaService.delete(item.id)
          message.success('Musafirkhana deleted successfully')
          loadMusafirkhana()
        } catch (error) {
          message.error('Failed to delete musafirkhana')
        }
      },
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMusafirkhana(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadMusafirkhana()
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Musafirkhana, b: Musafirkhana) => a.name.localeCompare(b.name),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Location',
      key: 'location',
      render: (_: any, record: Musafirkhana) => (
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
      title: 'Rooms',
      dataIndex: 'total_rooms',
      key: 'total_rooms',
      render: (rooms: number) => (
        <div className="flex items-center gap-1">
          <IconBed className="w-4 h-4 text-gray-500" />
          <span>{rooms || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Contact',
      key: 'contact',
      render: (_: any, record: Musafirkhana) => (
        <div className="text-sm">
          {record.contact1 || record.contact2 ? (
            <div>
              {record.contact1 && <div>{record.contact1}</div>}
              {record.contact2 && <div>{record.contact2}</div>}
            </div>
          ) : (
            <span className="text-gray-400">-</span>
          )}
        </div>
      ),
    },
    {
      title: 'Photos',
      key: 'photos',
      render: (_: any, record: Musafirkhana) => (
        <div className="flex items-center gap-1">
          <IconPhoto className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{record.photos?.length || 0}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Musafirkhana) => (
        <div className="flex items-center gap-2">
          <Button type="text" size="small" icon={<IconPencil className="w-4 h-4" />} onClick={() => handleEdit(record)} />
          <Button type="text" size="small" danger icon={<IconTrash className="w-4 h-4" />} onClick={() => handleDelete(record)} />
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Musafirkhana"
      subtitle="Manage Musafirkhana (guest houses)"
      showSearch={true}
      onSearch={handleSearch}
      actions={[
        <Button key="add-musafirkhana" type="primary" icon={<IconPlus className="w-4 h-4" />} onClick={handleCreate}>
          Add Musafirkhana
        </Button>,
      ]}
      padding="24px"
    >
      {/* Table */}
      {musafirkhana.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <Empty description="No musafirkhana found. Create your first musafirkhana to get started." />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table columns={columns} dataSource={musafirkhana} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onCancel={handleFormClose} footer={null} width={800} title={editingMusafirkhana ? 'Edit Musafirkhana' : 'Create Musafirkhana'}>
        <MusafirkhanaForm musafirkhana={editingMusafirkhana} onSuccess={handleFormSuccess} onCancel={handleFormClose} />
      </Modal>
    </DashboardLayout>
  )
}

