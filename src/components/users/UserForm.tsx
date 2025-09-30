'use client'

import { useEffect, useState } from 'react'
import { CreateUserData, UpdateUserData, User, USER_ROLES, UserRole } from '../../types/user'

interface UserFormProps {
  user?: User | null
  onSubmit: (data: CreateUserData | UpdateUserData) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export default function UserForm({ user, onSubmit, onCancel, loading = false }: UserFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    roles: ['user'] as string[],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone_number: user.phone_number || '',
        roles: user.roles,
      })
    }
  }, [user])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }

    if (formData.phone_number && !/^\+?[\d\s\-()]+$/.test(formData.phone_number)) {
      newErrors.phone_number = 'Phone number is invalid'
    }

    if (formData.roles.length === 0) {
      newErrors.roles = 'At least one role is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      const submitData = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone_number: formData.phone_number.trim() || undefined,
        roles: formData.roles,
      }

      await onSubmit(submitData)
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleRoleToggle = (role: UserRole) => {
    setFormData(prev => ({
      ...prev,
      roles: prev.roles.includes(role) ? prev.roles.filter(r => r !== role) : [...prev.roles, role],
    }))
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">{user ? 'Edit User' : 'Create New User'}</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${errors.name ? 'border-red-300' : 'border-gray-300'}`}
            placeholder="Enter full name"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
        </div>

        {/* Email Field */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.email ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter email address"
          />
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
        </div>

        {/* Phone Number Field */}
        <div>
          <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            id="phone_number"
            value={formData.phone_number}
            onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
            className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 ${
              errors.phone_number ? 'border-red-300' : 'border-gray-300'
            }`}
            placeholder="Enter phone number (optional)"
          />
          {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
        </div>

        {/* Roles Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Roles *</label>
          <div className="space-y-2">
            {Object.values(USER_ROLES).map(role => (
              <label key={role} className="flex items-center">
                <input type="checkbox" checked={formData.roles.includes(role)} onChange={() => handleRoleToggle(role)} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" />
                <span className="ml-2 text-sm text-gray-700 capitalize">{role}</span>
              </label>
            ))}
          </div>
          {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200"
            disabled={loading}>
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? (
              <div className="flex items-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {user ? 'Updating...' : 'Creating...'}
              </div>
            ) : user ? (
              'Update User'
            ) : (
              'Create User'
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
