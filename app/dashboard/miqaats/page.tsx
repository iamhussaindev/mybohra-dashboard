'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import MiqaatForm from '@components/miqaat/MiqaatForm'
import MiqaatLibrariesModal from '@components/miqaat/MiqaatLibrariesModal'
import MiqaatList from '@components/miqaat/MiqaatList'
import { IconCalendar, IconPlus } from '@tabler/icons-react'
import { Miqaat } from '@type/miqaat'
import { Button } from 'antd'
import { useState } from 'react'

function MiqaatManagement() {
  const [showForm, setShowForm] = useState(false)
  const [showLibrariesModal, setShowLibrariesModal] = useState(false)
  const [editingMiqaat, setEditingMiqaat] = useState<Miqaat | null>(null)
  const [selectedMiqaat, setSelectedMiqaat] = useState<Miqaat | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleCreateMiqaat = () => {
    setEditingMiqaat(null)
    setShowForm(true)
  }

  const handleEditMiqaat = (miqaat: Miqaat) => {
    setEditingMiqaat(miqaat)
    setShowForm(true)
  }

  const handleViewLibraries = (miqaat: Miqaat) => {
    setSelectedMiqaat(miqaat)
    setShowLibrariesModal(true)
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    setShowForm(false)
    setEditingMiqaat(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingMiqaat(null)
  }

  const handleLibrariesModalClose = () => {
    setShowLibrariesModal(false)
    setSelectedMiqaat(null)
  }

  const handleDeleteMiqaat = (id: number) => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
              <IconCalendar className="h-8 w-8 text-purple-600" />
              Miqaat Management
            </h1>
            <p className="text-gray-600 mt-1">Manage religious events, dates, and their associated library content</p>
          </div>
          <Button
            type="primary"
            size="large"
            icon={<IconPlus className="h-5 w-5" />}
            onClick={handleCreateMiqaat}
            className="bg-purple-600 hover:bg-purple-700 border-purple-600 hover:border-purple-700">
            Add Miqaat
          </Button>
        </div>

        {/* Miqaat List */}
        <div className="bg-white rounded-lg">
          <MiqaatList key={refreshKey} onEditMiqaat={handleEditMiqaat} onDeleteMiqaat={handleDeleteMiqaat} onViewLibraries={handleViewLibraries} />
        </div>

        {/* Miqaat Form Modal */}
        <MiqaatForm open={showForm} onClose={handleFormClose} onSuccess={handleFormSuccess} miqaat={editingMiqaat} />

        {/* Miqaat Libraries Modal */}
        <MiqaatLibrariesModal open={showLibrariesModal} onClose={handleLibrariesModalClose} miqaat={selectedMiqaat} />
      </div>
    </DashboardLayout>
  )
}

export default function MiqaatsPage() {
  return (
    <AuthGuard>
      <MiqaatManagement />
    </AuthGuard>
  )
}
