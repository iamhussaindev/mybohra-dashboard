'use client'

import DashboardLayout from '@components/layout/DashboardLayout'
import { DaiDuatService } from '@lib/api/daiDuat'
import { DaiDuat } from '@type/mazaar'
import { IconCalendar, IconPencil, IconPhoto, IconPlus, IconTrash, IconTrophy } from '@tabler/icons-react'
import { App, Button, Empty, Modal, Table, message } from 'antd'
import { useEffect, useState } from 'react'
import DaiDuatForm from './DaiDuatForm'

export default function DaiDuatList() {
  const [daiDuat, setDaiDuat] = useState<DaiDuat[]>([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDaiDuat, setEditingDaiDuat] = useState<DaiDuat | null>(null)
  const { modal } = App.useApp()

  useEffect(() => {
    loadDaiDuat()
  }, [searchQuery])

  const loadDaiDuat = async () => {
    try {
      setLoading(true)
      const data = await DaiDuatService.getAll({ name: searchQuery || undefined })
      setDaiDuat(data)
    } catch (error) {
      console.error('Failed to load dai duat:', error)
      message.error('Failed to load dai duat')
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (value: string) => {
    setSearchQuery(value)
  }

  const handleCreate = () => {
    setEditingDaiDuat(null)
    setShowForm(true)
  }

  const handleEdit = (item: DaiDuat) => {
    setEditingDaiDuat(item)
    setShowForm(true)
  }

  const handleDelete = (item: DaiDuat) => {
    modal.confirm({
      title: 'Delete Dai Duat',
      content: `Are you sure you want to delete "${item.name}"?`,
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await DaiDuatService.delete(item.id)
          message.success('Dai Duat deleted successfully')
          loadDaiDuat()
        } catch (error) {
          message.error('Failed to delete dai duat')
        }
      },
    })
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingDaiDuat(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    loadDaiDuat()
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: DaiDuat, b: DaiDuat) => a.name.localeCompare(b.name),
    },
    {
      title: 'City',
      dataIndex: 'city',
      key: 'city',
      render: (city: string) => city || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Area',
      dataIndex: 'area',
      key: 'area',
      render: (area: string) => area || <span className="text-gray-400">-</span>,
    },
    {
      title: 'Year',
      dataIndex: 'year',
      key: 'year',
      render: (year: number) => (
        <div className="flex items-center gap-1">
          <IconCalendar className="w-4 h-4 text-gray-500" />
          <span>{year || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Rank',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank: number) => (
        <div className="flex items-center gap-1">
          <IconTrophy className="w-4 h-4 text-yellow-500" />
          <span>{rank || '-'}</span>
        </div>
      ),
    },
    {
      title: 'Photos',
      key: 'photos',
      render: (_: any, record: DaiDuat) => (
        <div className="flex items-center gap-1">
          <IconPhoto className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{record.photos?.length || 0}</span>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: DaiDuat) => (
        <div className="flex items-center gap-2">
          <Button type="text" size="small" icon={<IconPencil className="w-4 h-4" />} onClick={() => handleEdit(record)} />
          <Button type="text" size="small" danger icon={<IconTrash className="w-4 h-4" />} onClick={() => handleDelete(record)} />
        </div>
      ),
    },
  ]

  return (
    <DashboardLayout
      title="Dai Duat"
      subtitle="Manage Dai Duat (religious leaders)"
      showSearch={true}
      onSearch={handleSearch}
      actions={[
        <Button key="add-dai-duat" type="primary" icon={<IconPlus className="w-4 h-4" />} onClick={handleCreate}>
          Add Dai Duat
        </Button>,
      ]}
      padding="24px"
    >
      {/* Table */}
      {daiDuat.length === 0 && !loading ? (
        <div className="bg-white rounded-lg border border-gray-200 p-12">
          <Empty description="No dai duat found. Create your first dai duat to get started." />
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <Table columns={columns} dataSource={daiDuat} rowKey="id" loading={loading} pagination={{ pageSize: 20 }} />
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onCancel={handleFormClose} footer={null} width={800} title={editingDaiDuat ? 'Edit Dai Duat' : 'Create Dai Duat'}>
        <DaiDuatForm daiDuat={editingDaiDuat} onSuccess={handleFormSuccess} onCancel={handleFormClose} />
      </Modal>
    </DashboardLayout>
  )
}

