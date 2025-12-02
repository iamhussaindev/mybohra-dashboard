'use client'

import AuthGuard from '@components/auth/AuthGuard'
import MazaarList from '@components/mazaar/MazaarList'

function MazaarsContent() {
  return (
    <div className="space-y-6 w-full h-full">
      <MazaarList />
    </div>
  )
}

export default function MazaarsPage() {
  return (
    <AuthGuard>
      <MazaarsContent />
    </AuthGuard>
  )
}

