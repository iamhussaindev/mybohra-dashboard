'use client'

import AuthGuard from '@components/auth/AuthGuard'
import AssignDuasInterface from '@components/calendar/AssignDuasInterface'
import DashboardLayout from '@components/layout/DashboardLayout'

function AssignDuasContent() {
  return (
    <DashboardLayout showSearch={false}>
      <div className="h-[calc(100vh-56px)] w-full">
        <AssignDuasInterface />
      </div>
    </DashboardLayout>
  )
}

export default function AssignDuasPage() {
  return (
    <AuthGuard>
      <AssignDuasContent />
    </AuthGuard>
  )
}
