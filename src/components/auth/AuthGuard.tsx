'use client'

import { useAuth } from '@hooks/useSupabase'
import { getWhitelistErrorMessage, isEmailWhitelisted } from '@lib/utils/emailWhitelist'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  redirectTo?: string
}

export default function AuthGuard({ children, fallback, redirectTo = '/login' }: AuthGuardProps) {
  const { user, loading, isConfigured, signOut } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isCheckingWhitelist, setIsCheckingWhitelist] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user && isConfigured) {
      router.push(redirectTo)
    }
  }, [mounted, loading, user, isConfigured, router, redirectTo])

  // Check if user email is whitelisted
  useEffect(() => {
    const checkWhitelist = async () => {
      if (user && user.email && !isCheckingWhitelist) {
        setIsCheckingWhitelist(true)

        if (!isEmailWhitelisted(user.email)) {
          console.warn(`Blocked access for non-whitelisted email: ${user.email}`)

          // Sign out the user
          await signOut()

          // Redirect to login with error
          router.push(`/login?error=${encodeURIComponent(getWhitelistErrorMessage())}`)
        }

        setIsCheckingWhitelist(false)
      }
    }

    checkWhitelist()
  }, [user, signOut, router, isCheckingWhitelist])

  // Show loading state
  if (!mounted || loading) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  // Show configuration error
  if (!isConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-red-100">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Configuration Required</h2>
              <p className="text-gray-600 mb-6">Supabase is not configured. Please add your credentials to your .env.local file.</p>
              <div className="bg-gray-50 p-4 rounded-lg text-left">
                <pre className="text-sm text-gray-700">
                  {`NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show children if authenticated
  if (user) {
    return <>{children}</>
  }

  // Don't render anything while redirecting
  return null
}
