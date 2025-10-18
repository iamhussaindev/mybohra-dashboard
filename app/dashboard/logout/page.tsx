'use client'

import { supabase } from '@lib/config/supabase'
import { IconLogout } from '@tabler/icons-react'
import { Card, Spin } from 'antd'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const handleLogout = async () => {
      try {
        // Sign out from Supabase
        await supabase.auth.signOut()

        // Clear any local storage items
        if (typeof window !== 'undefined') {
          localStorage.removeItem('sb-auth-token')
          localStorage.clear()
        }

        // Wait a moment to ensure cleanup
        await new Promise(resolve => setTimeout(resolve, 500))

        // Redirect to login page
        router.push('/login')
      } catch (error) {
        console.error('Logout error:', error)
        // Redirect anyway
        router.push('/login')
      }
    }

    handleLogout()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-96 text-center">
        <div className="flex flex-col items-center space-y-4 py-8">
          <IconLogout className="h-16 w-16 text-blue-600 animate-pulse" />
          <Spin size="large" />
          <h2 className="text-xl font-semibold text-gray-900">Logging out...</h2>
          <p className="text-gray-600">Please wait while we securely log you out.</p>
        </div>
      </Card>
    </div>
  )
}
