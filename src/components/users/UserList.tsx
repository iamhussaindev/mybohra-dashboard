'use client'

import { User } from '@lib/schema/types'
import { UserTable } from './UserTable'

interface UserListProps {
  onEditUser: (user: User) => void
  onDeleteUser: (userId: string) => void
  onUserUpdated?: () => void
}

export default function UserList({ onEditUser, onDeleteUser, onUserUpdated }: UserListProps) {
  const handleUserClick = (user: User) => {
    // Handle user click/view action
    console.log('User clicked:', user)
  }

  const handleUserEdit = (user: User) => {
    onEditUser(user)
  }

  const handleUserDelete = (user: User) => {
    onDeleteUser(user.id.toString())
  }

  return (
    <div className="space-y-6">
      <UserTable onUserClick={handleUserClick} onUserEdit={handleUserEdit} onUserDelete={handleUserDelete} onUserUpdated={onUserUpdated} className="bg-white" />
    </div>
  )
}
