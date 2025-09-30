'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DashboardLayout from '@components/layout/DashboardLayout'
import UserForm from '@components/users/UserForm'
import UserList from '@components/users/UserList'
import { UserService } from '@lib/api/users'
import { useState } from 'react'
import { CreateUserData, UpdateUserData, User } from '../../src/types/user'

function UsersManagement() {
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const handleCreateUser = async (userData: CreateUserData | UpdateUserData) => {
    try {
      setLoading(true)
      setError(null)
      await UserService.createUser(userData as CreateUserData)
      setSuccess('User created successfully!')
      setShowForm(false)
      // Refresh the user list by triggering a re-render
      window.location.reload()
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
      await UserService.updateUser(editingUser.id, userData)
      setSuccess('User updated successfully!')
      setEditingUser(null)
      setShowForm(false)
      // Refresh the user list by triggering a re-render
      window.location.reload()
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
      await UserService.deleteUser(userId)
      setSuccess('User deleted successfully!')
      // Refresh the user list by triggering a re-render
      window.location.reload()
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

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6 w-full">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-slate-800">User Management</h1>
            <p className="text-slate-600 mt-1 text-sm">Manage users, roles, and permissions</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add New User
            </div>
          </button>
        </div>

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
        {showForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
              <UserForm user={editingUser} onSubmit={editingUser ? handleUpdateUser : handleCreateUser} onCancel={handleCancelForm} loading={loading} />
            </div>
          </div>
        )}

        {/* User List */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <UserList onEditUser={handleEditUser} onDeleteUser={handleDeleteUser} />
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
