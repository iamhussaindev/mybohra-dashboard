'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import MiqaatForm from '@components/miqaat/MiqaatForm'
import MiqaatLibrariesModal from '@components/miqaat/MiqaatLibrariesModal'
import MiqaatList from '@components/miqaat/MiqaatList'
import { Miqaat } from '@type/miqaat'
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
      <div className="w-full">
        {/* Header */}

        {/* Miqaat List */}
        <div className="bg-white">
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
