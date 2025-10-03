'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import UserForm, { UserFormRef } from '@components/users/UserForm'
import UserList from '@components/users/UserList'
import { UserService } from '@lib/api/generated/user'
import { CreateUserData, UpdateUserData, User } from '@lib/schema/types'
import { IconPlus } from '@tabler/icons-react'
import { Button, Modal } from 'antd'
import { useRef, useState } from 'react'

function UsersManagement() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const formRef = useRef<UserFormRef>(null)

  const handleCreateUser = async (userData: CreateUserData | UpdateUserData) => {
    try {
      setLoading(true)
      setError(null)
      await UserService.create(userData as CreateUserData)
      setSuccess('User created successfully!')
      setShowForm(false)
      handleUserUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateUser = async (userData: UpdateUserData) => {
    if (!editingUser) return

    try {
      setLoading(true)
      setError(null)
      await UserService.update(editingUser.id.toString(), userData)
      setSuccess('User updated successfully!')
      setEditingUser(null)
      setShowForm(false)
      handleUserUpdated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return
    }

    try {
      setLoading(true)
      setError(null)
      await UserService.delete(userId)
      setSuccess('User deleted successfully!')
      // Refresh will be handled by UserTable component
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setLoading(false)
    }
  }

  const handleEditUser = (user: User) => {
    setEditingUser(user)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditingUser(null)
    setShowForm(false)
    setError(null)
    setSuccess(null)
  }

  const [refreshKey, setRefreshKey] = useState(0)

  const handleUserUpdated = () => {
    // Trigger refresh by updating the key
    setRefreshKey(prev => prev + 1)
  }

  return (
    <DashboardLayout
      actions={[
        <Button key="add-user" type="primary" icon={<IconPlus className="h-5 w-5" />} onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 border-blue-600 hover:border-blue-700">
          Add User
        </Button>,
      ]}
      showSearch={false}>
      <div className="space-y-6 w-full">
        {/* Header */}

        {/* Success/Error Messages */}
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

        {/* User Form Modal */}
        <Modal
          title={editingUser ? 'Edit User' : 'Add New User'}
          open={showForm}
          onCancel={handleCancelForm}
          width={800}
          destroyOnHidden
          footer={[
            <Button key="cancel" onClick={handleCancelForm} disabled={loading}>
              Cancel
            </Button>,
            <Button
              key="submit"
              type="primary"
              loading={loading}
              onClick={async () => {
                // Get form data from the form ref
                if (formRef.current) {
                  const formData = formRef.current.getFormData()

                  const userData = {
                    name: formData.name.trim(),
                    email: formData.email.trim(),
                    phone_number: formData.phone_number.trim() || null,
                    country: formData.country.trim() || null,
                    unverfied_email: formData.unverfied_email.trim() || null,
                    roles: formData.roles,
                    status: formData.status,
                  }

                  // Basic validation
                  if (!userData.name || !userData.email) {
                    return
                  }

                  if (editingUser) {
                    await handleUpdateUser(userData)
                  } else {
                    await handleCreateUser(userData)
                  }
                }
              }}>
              {editingUser ? 'Update User' : 'Create User'}
            </Button>,
          ]}>
          <UserForm ref={formRef} user={editingUser ?? null} />
        </Modal>

        {/* User List */}
        <div className="bg-white">
          <UserList key={refreshKey} onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} onUserUpdated={handleUserUpdated} />
        </div>
      </div>
    </DashboardLayout>
  )
}

export default function UsersPage() {
  return (
    <AuthGuard>
      <UsersManagement />
    </AuthGuard>
  )
}
