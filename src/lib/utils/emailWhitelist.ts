/**
 * Email whitelist utility for authentication
 */

/**
 * Get whitelisted emails from environment variable
 * Expected format: comma-separated emails
 * Example: ALLOWED_EMAILS=user1@example.com,user2@example.com,user3@example.com
 */
export function getWhitelistedEmails(): string[] {
  const allowedEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS || process.env.ALLOWED_EMAILS || ''

  if (!allowedEmails) {
    console.warn('No ALLOWED_EMAILS environment variable found. All emails will be blocked.')
    return []
  }

  return allowedEmails
    .split(',')
    .map(email => email.trim().toLowerCase())
    .filter(email => email.length > 0)
}

/**
 * Check if an email is whitelisted
 */
export function isEmailWhitelisted(email: string): boolean {
  const whitelistedEmails = getWhitelistedEmails()

  // If no whitelist is configured, block all
  if (whitelistedEmails.length === 0) {
    return false
  }

  const normalizedEmail = email.trim().toLowerCase()
  return whitelistedEmails.includes(normalizedEmail)
}

/**
 * Check if email whitelist is configured
 */
export function isWhitelistConfigured(): boolean {
  const allowedEmails = process.env.NEXT_PUBLIC_ALLOWED_EMAILS || process.env.ALLOWED_EMAILS || ''
  return allowedEmails.trim().length > 0
}

/**
 * Get whitelist error message
 */
export function getWhitelistErrorMessage(): string {
  return 'Access denied. Your email is not authorized to access this application. Please contact the administrator.'
}
