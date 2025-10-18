'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import TasbeehForm from '@components/tasbeeh/TasbeehForm'
import TasbeehList from '@components/tasbeeh/TasbeehList'
import { TasbeehService } from '@lib/api/tasbeeh'
import { IconListTree, IconPlus } from '@tabler/icons-react'
import { Tasbeeh } from '@type/tasbeeh'
import { App, Button } from 'antd'
import { useState } from 'react'

function TasbeehContent() {
  const appContext = App.useApp()
  const message = appContext?.message || { error: console.error, success: console.log, warning: console.warn }
  const modal = appContext?.modal

  const [showForm, setShowForm] = useState(false)
  const [editingTasbeeh, setEditingTasbeeh] = useState<Tasbeeh | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const handleAddTasbeeh = () => {
    setEditingTasbeeh(null)
    setShowForm(true)
  }

  const handleEditTasbeeh = (tasbeeh: Tasbeeh) => {
    setEditingTasbeeh(tasbeeh)
    setShowForm(true)
  }

  const handleDeleteTasbeeh = async (id: number) => {
    modal?.confirm({
      title: 'Delete Tasbeeh',
      content: 'Are you sure you want to delete this tasbeeh? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await TasbeehService.delete(id)
          message.success('Tasbeeh deleted successfully')
          setRefreshKey(prev => prev + 1)
        } catch (error) {
          console.error('Delete error:', error)
          message.error('Failed to delete tasbeeh')
        }
      },
    })
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingTasbeeh(null)
  }

  return (
    <DashboardLayout
      title="Tasbeeh Management"
      icon={<IconListTree className="h-8 w-8 text-green-600" />}
      showSearch={true}
      onSearch={setSearchQuery}
      actions={[
        <Button key="add-tasbeeh" type="primary" icon={<IconPlus className="h-5 w-5" />} onClick={handleAddTasbeeh} className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700">
          Add Tasbeeh
        </Button>,
      ]}>
      <div className="space-y-6 w-full">
        {/* Tasbeeh List */}
        <TasbeehList key={refreshKey} refreshKey={refreshKey} searchQuery={searchQuery} onEdit={handleEditTasbeeh} onDelete={handleDeleteTasbeeh} />

        {/* Tasbeeh Form Modal */}
        <TasbeehForm open={showForm} onClose={handleFormClose} onSuccess={handleFormSuccess} editingTasbeeh={editingTasbeeh} />
      </div>
    </DashboardLayout>
  )
}

export default function TasbeehPage() {
  return (
    <AuthGuard>
      <TasbeehContent />
    </AuthGuard>
  )
}
