'use client'

import AuthGuard from '@components/auth/AuthGuard'
import TasbeehList from '@components/tasbeeh/TasbeehList'

function TasbeehContent() {
  return (
    <div className="space-y-6 w-full h-full">
      {/* Tasbeeh List */}
      <TasbeehList />
    </div>
  )
}

export default function TasbeehPage() {
  return (
    <AuthGuard>
      <TasbeehContent />
    </AuthGuard>
  )
}
