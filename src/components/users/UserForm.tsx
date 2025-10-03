'use client'

import { User } from '@lib/schema/types'
import { Input, Select } from 'antd'
import { forwardRef, useEffect, useImperativeHandle, useState } from 'react'

interface UserFormProps {
  user?: User | null
}

export interface UserFormRef {
  getFormData: () => any
}

const UserForm = forwardRef<UserFormRef, UserFormProps>(({ user }, ref) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone_number: '',
    country: '',
    unverfied_email: '',
    roles: ['user'],
    status: 'CREATED',
  })
  const [errors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone_number: user.phone_number || '',
        country: user.country || '',
        unverfied_email: user.unverfied_email || '',
        roles: Array.isArray(user.roles) ? user.roles : [user.roles],
        status: user.status,
      })
    }
  }, [user])

  useImperativeHandle(ref, () => ({
    getFormData: () => formData,
  }))

  return (
    <div className="py-6">
      <form className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Name Field */}
          <div className="md:col-span-2">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input id="name" value={formData.name} onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter full name" status={errors.name ? 'error' : undefined} />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Email Field */}
          <div className="md:col-span-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address *
            </label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="Enter email address"
              status={errors.email ? 'error' : undefined}
            />
            {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Phone Number Field */}
          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number
            </label>
            <Input
              type="tel"
              id="phone_number"
              value={formData.phone_number}
              onChange={e => setFormData(prev => ({ ...prev, phone_number: e.target.value }))}
              placeholder="Enter phone number (optional)"
              status={errors.phone_number ? 'error' : undefined}
            />
            {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number}</p>}
          </div>

          {/* Country Field */}
          <div>
            <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
              Country
            </label>
            <Input
              type="text"
              id="country"
              value={formData.country}
              onChange={e => setFormData(prev => ({ ...prev, country: e.target.value }))}
              placeholder="Enter country (optional)"
              status={errors.country ? 'error' : undefined}
            />
            {errors.country && <p className="mt-1 text-sm text-red-600">{errors.country}</p>}
          </div>

          {/* Unverified Email Field */}
          <div className="md:col-span-2">
            <label htmlFor="unverfied_email" className="block text-sm font-medium text-gray-700 mb-2">
              Unverified Email
            </label>
            <Input
              type="email"
              id="unverfied_email"
              value={formData.unverfied_email}
              onChange={e => setFormData(prev => ({ ...prev, unverfied_email: e.target.value }))}
              placeholder="Enter unverified email (optional)"
              status={errors.unverfied_email ? 'error' : undefined}
            />
            {errors.unverfied_email && <p className="mt-1 text-sm text-red-600">{errors.unverfied_email}</p>}
          </div>
        </div>

        {/* Roles and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Roles Field */}
          <div className="md:col-span-2">
            <label htmlFor="roles" className="block text-sm font-medium text-gray-700 mb-2">
              Roles *
            </label>
            <Select
              id="roles"
              mode="multiple"
              value={formData.roles}
              onChange={value => setFormData(prev => ({ ...prev, roles: value }))}
              placeholder="Select roles"
              status={errors.roles ? 'error' : undefined}
              className="w-full"
              options={[
                { value: 'user', label: 'User' },
                { value: 'admin', label: 'Admin' },
                { value: 'manager', label: 'Manager' },
              ]}
            />
            {errors.roles && <p className="mt-1 text-sm text-red-600">{errors.roles}</p>}
          </div>

          {/* Status Field */}
          <div className="md:col-span-2">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Status *
            </label>
            <Select
              id="status"
              value={formData.status}
              onChange={value => setFormData(prev => ({ ...prev, status: value }))}
              placeholder="Select a status"
              status={errors.status ? 'error' : undefined}
              className="w-full"
              options={[
                { value: 'CREATED', label: 'Created' },
                { value: 'ACTIVE', label: 'Active' },
                { value: 'INACTIVE', label: 'Inactive' },
                { value: 'SUSPENDED', label: 'Suspended' },
              ]}
            />
            {errors.status && <p className="mt-1 text-sm text-red-600">{errors.status}</p>}
          </div>
        </div>
      </form>
    </div>
  )
})

UserForm.displayName = 'UserForm'

export default UserForm
