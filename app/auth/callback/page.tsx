'use client'

import { supabase } from '@lib/config/supabase'
import { getWhitelistErrorMessage, isEmailWhitelisted } from '@lib/utils/emailWhitelist'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('🔐 Client-side auth callback started')

        // Get session from URL hash (Supabase automatically handles this)
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession()

        if (sessionError) {
          console.error('❌ Session error:', sessionError.message)
          setError(sessionError.message)
          router.push(`/login?error=${encodeURIComponent(sessionError.message)}`)
          return
        }

        if (!session) {
          console.error('❌ No session found after OAuth')
          setError('No session found')
          router.push('/login?error=No+session+found')
          return
        }

        const user = session.user
        const email = user?.email

        console.log('👤 User authenticated:', { email, id: user.id })

        if (!email) {
          console.error('❌ No email found in user data')
          await supabase.auth.signOut()
          router.push('/login?error=No+email+found')
          return
        }

        // Check if email is whitelisted
        console.log('🔍 Checking email whitelist for:', email)
        if (!isEmailWhitelisted(email)) {
          console.warn(`🚫 Blocked login attempt from non-whitelisted email: ${email}`)

          // Sign out the user
          await supabase.auth.signOut()

          router.push(`/login?error=${encodeURIComponent(getWhitelistErrorMessage())}`)
          return
        }

        // Email is whitelisted, redirect to dashboard
        console.log(`✅ Successful login from whitelisted email: ${email}`)
        router.push('/dashboard')
      } catch (err) {
        console.error('❌ Callback error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Authentication failed'
        setError(errorMessage)
        router.push(`/login?error=${encodeURIComponent(errorMessage)}`)
      }
    }

    handleAuthCallback()
  }, [router])

  if (error) {
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
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Authentication Error</h2>
              <p className="text-gray-600 mb-6">{error}</p>
              <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="text-center">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="animate-spin w-8 h-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Completing authentication...</h2>
        <p className="text-gray-600">Please wait while we verify your credentials</p>
      </div>
    </div>
  )
}
