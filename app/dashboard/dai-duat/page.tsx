'use client'

import AuthGuard from '@components/auth/AuthGuard'
import DaiDuatList from '@components/mazaar/DaiDuatList'

function DaiDuatContent() {
  return (
    <div className="space-y-6 w-full h-full">
      <DaiDuatList />
    </div>
  )
}

export default function DaiDuatPage() {
  return (
    <AuthGuard>
      <DaiDuatContent />
    </AuthGuard>
  )
}

