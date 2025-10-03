'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import LibraryForm from '@components/library/LibraryForm'
import LibraryList from '@components/library/LibraryList'
import LibraryMiqaatsModal from '@components/library/LibraryMiqaatsModal'
import { IconMusic, IconPlus } from '@tabler/icons-react'
import { Library } from '@type/library'
import { Button } from 'antd'
import { useState } from 'react'

function LibraryManagement() {
  const [showForm, setShowForm] = useState(false)
  const [showMiqaatsModal, setShowMiqaatsModal] = useState(false)
  const [editingLibrary, setEditingLibrary] = useState<Library | null>(null)
  const [selectedLibrary, setSelectedLibrary] = useState<Library | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')

  const handleCreateLibrary = () => {
    setEditingLibrary(null)
    setShowForm(true)
  }

  const handleEditLibrary = (library: Library) => {
    setEditingLibrary(library)
    setShowForm(true)
  }

  const handleViewMiqaats = (library: Library) => {
    setSelectedLibrary(library)
    setShowMiqaatsModal(true)
  }

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1)
    setShowForm(false)
    setEditingLibrary(null)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingLibrary(null)
  }

  const handleMiqaatsModalClose = () => {
    setShowMiqaatsModal(false)
    setSelectedLibrary(null)
  }

  const handleDeleteLibrary = (id: number) => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout
      title="Library Management"
      icon={<IconMusic className="h-8 w-8 text-blue-600" />}
      showSearch={true}
      onSearch={setSearchQuery}
      actions={[
        <Button key="add-library" type="primary" icon={<IconPlus className="h-5 w-5" />} onClick={handleCreateLibrary} className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700">
          Add Library Item
        </Button>,
      ]}>
      {/* Library List */}
      <LibraryList key={refreshKey} searchQuery={searchQuery} onEditLibrary={handleEditLibrary} onDeleteLibrary={handleDeleteLibrary} onViewMiqaats={handleViewMiqaats} />

      {/* Library Form Modal */}
      <LibraryForm open={showForm} onClose={handleFormClose} onSuccess={handleFormSuccess} library={editingLibrary} />

      {/* Library Miqaats Modal */}
      <LibraryMiqaatsModal open={showMiqaatsModal} onClose={handleMiqaatsModalClose} library={selectedLibrary} />
    </DashboardLayout>
  )
}

export default function LibraryPage() {
  return (
    <AuthGuard>
      <LibraryManagement />
    </AuthGuard>
  )
}
