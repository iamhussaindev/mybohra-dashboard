import { supabase } from '@lib/config/supabase'
import { getWhitelistErrorMessage, isEmailWhitelisted } from '@lib/utils/emailWhitelist'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const error = requestUrl.searchParams.get('error')
  const errorDescription = requestUrl.searchParams.get('error_description')

  // Handle OAuth errors
  if (error) {
    console.error('OAuth error:', error, errorDescription)
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, requestUrl.origin))
  }

  if (code) {
    try {
      // Exchange code for session
      const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)

      if (exchangeError) {
        console.error('Exchange code error:', exchangeError)
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin))
      }

      const user = data.user
      const email = user?.email

      if (!email) {
        console.error('No email found in user data')
        // Sign out the user
        await supabase.auth.signOut()
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('No email found in your account')}`, requestUrl.origin))
      }

      // Check if email is whitelisted
      if (!isEmailWhitelisted(email)) {
        console.warn(`Blocked login attempt from non-whitelisted email: ${email}`)

        // Sign out the user
        await supabase.auth.signOut()

        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(getWhitelistErrorMessage())}`, requestUrl.origin))
      }

      // Email is whitelisted, allow login
      console.log(`Successful login from whitelisted email: ${email}`)
      return NextResponse.redirect(new URL('/dashboard', requestUrl.origin))
    } catch (error) {
      console.error('Callback error:', error)
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Authentication failed. Please try again.')}`, requestUrl.origin))
    }
  }

  // No code provided
  return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent('Invalid authentication callback')}`, requestUrl.origin))
}
