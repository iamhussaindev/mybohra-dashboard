'use client'

import AuthGuard from '@components/auth/AuthGuard'
import MusafirkhanaList from '@components/mazaar/MusafirkhanaList'

function MusafirkhanaContent() {
  return (
    <div className="space-y-6 w-full h-full">
      <MusafirkhanaList />
    </div>
  )
}

export default function MusafirkhanaPage() {
  return (
    <AuthGuard>
      <MusafirkhanaContent />
    </AuthGuard>
  )
}

