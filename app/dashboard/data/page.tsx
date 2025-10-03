'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DataForm, { DataFormRef } from '@components/dashboard/DataForm'
import DataList from '@components/dashboard/DataList'
import DashboardLayout from '@components/layout/DashboardLayout'
import { DataService } from '@lib/api/data'
import { CreateDataRequest, Data, UpdateDataRequest } from '@type/data'
import { Button, Modal } from 'antd'
import { useRef, useState } from 'react'

function DataManagement() {
  const [showForm, setShowForm] = useState(false)
  const [editingData, setEditingData] = useState<Data | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)
  const formRef = useRef<DataFormRef>(null)

  const handleCreateData = async (dataRequest: CreateDataRequest | UpdateDataRequest) => {
    try {
      setLoading(true)
      setError(null)
      await DataService.create(dataRequest as CreateDataRequest)
      setSuccess('Data created successfully!')
      setShowForm(false)
      handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create data')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateData = async (dataRequest: UpdateDataRequest) => {
    if (!editingData) return

    try {
      setLoading(true)
      setError(null)
      await DataService.update(editingData.id, dataRequest)
      setSuccess('Data updated successfully!')
      setEditingData(null)
      setShowForm(false)
      handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteData = async (dataId: number) => {
    if (!confirm('Are you sure you want to delete this data item? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      await DataService.delete(dataId)
      setSuccess('Data deleted successfully!')
      handleRefresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete data')
    } finally {
      setLoading(false)
    }
  }

  const handleEditData = (data: Data) => {
    setEditingData(data)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditingData(null)
    setShowForm(false)
    setError(null)
    setSuccess(null)
  }

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">Data Management</h1>
            <p className="text-slate-600 mt-1 text-sm">Manage key-value data pairs</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New Data
            </div>
          </button>
        </div>

        {/* Messages */}
        {success && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-emerald-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-emerald-700">{success}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Data Form Modal */}
        <Modal
          title={editingData ? 'Edit Data' : 'Add New Data'}
          open={showForm}
          onCancel={handleCancelForm}
          width={600}
          destroyOnClose
          footer={[
            <Button key="cancel" onClick={handleCancelForm} disabled={loading}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={async () => {
                if (formRef.current) {
                  const formData = formRef.current.getFormData()

                  const dataRequest = {
                    key: formData.key.trim(),
                    value: formData.value.trim() || null,
                  }

                  if (!dataRequest.key) {
                    return
                  }

                  if (editingData) {
                    await handleUpdateData(dataRequest)
                  } else {
                    await handleCreateData(dataRequest)
                  }
                }
              }}>
              {editingData ? 'Update Data' : 'Create Data'}
            </Button>,
          ]}>
          <DataForm ref={formRef} data={editingData ?? null} />
        </Modal>

        {/* Data List */}
        <div className="bg-white">
          <DataList key={refreshKey} onEditData={handleEditData} onDeleteData={handleDeleteData} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function DataPage() {
  return (
    <AuthGuard>
      <DataManagement />
    </AuthGuard>
  )
}
