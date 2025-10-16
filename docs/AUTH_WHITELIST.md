# Email Whitelist Authentication

This application implements email whitelisting for Google OAuth authentication. Only users with whitelisted email addresses can successfully authenticate and access the dashboard.

## Configuration

### Environment Variable

Add the following environment variable to your `.env.local` file:

```env
NEXT_PUBLIC_ALLOWED_EMAILS=user1@example.com,user2@example.com,user3@example.com
```

**Format:**

- Comma-separated list of email addresses
- Emails are case-insensitive
- Whitespace is automatically trimmed

### Example

```env
NEXT_PUBLIC_ALLOWED_EMAILS=john@company.com,jane@company.com,admin@company.com
```

## How It Works

### 1. OAuth Callback Validation

When a user authenticates via Google OAuth:

1. User clicks "Continue with Google"
2. Google authentication completes
3. OAuth callback route (`/api/auth/callback`) validates the email
4. If email is NOT in whitelist:
   - User is automatically signed out
   - Redirected to login with error message
5. If email IS in whitelist:
   - User is allowed to proceed to dashboard

### 2. AuthGuard Protection

Every protected route checks the user's email:

1. `AuthGuard` component validates email on every render
2. If email is not whitelisted:
   - User is signed out
   - Redirected to login with error message

### 3. Client-Side Validation

The whitelist is validated on the client-side for immediate feedback.

## Security Notes

⚠️ **Important Security Considerations:**

1. **Environment Variable Exposure**: Using `NEXT_PUBLIC_ALLOWED_EMAILS` makes the whitelist visible in the client-side JavaScript bundle. This is acceptable for most use cases as it only reveals which emails are allowed, not any sensitive credentials.

2. **Alternative Approach**: For enhanced security, you can:

   - Use `ALLOWED_EMAILS` (without `NEXT_PUBLIC_` prefix)
   - Create a server-side API route to validate emails
   - Check whitelist only server-side in the OAuth callback

3. **Supabase RLS**: Consider implementing Supabase Row Level Security (RLS) policies as an additional layer of protection.

## Error Messages

Users with non-whitelisted emails will see:

> "Access denied. Your email is not authorized to access this application. Please contact the administrator."

## Adding/Removing Users

To add or remove authorized users:

1. Update `.env.local`:

   ```env
   NEXT_PUBLIC_ALLOWED_EMAILS=existing@email.com,newemail@email.com
   ```

2. Restart the development server:

   ```bash
   npm run dev
   ```

3. For production, update the environment variables in your hosting platform and redeploy.

## Testing

### Test Allowed Email

1. Use an email from the whitelist
2. Authenticate with Google
3. Should successfully access dashboard

### Test Blocked Email

1. Use an email NOT in the whitelist
2. Authenticate with Google
3. Should be redirected to login with error message
4. Should be automatically signed out

## Troubleshooting

### "All emails blocked"

- **Cause**: `ALLOWED_EMAILS` environment variable is empty or not set
- **Solution**: Add at least one email to the whitelist

### "Email still has access after removal"

- **Cause**: User's session is still valid
- **Solution**: User must sign out and sign in again, or wait for session to expire

### Whitelist not working

1. Check environment variable is set correctly
2. Ensure no extra spaces in email list
3. Verify server was restarted after changing `.env.local`
4. Check browser console for validation errors

## Implementation Details

### Files Modified

- `/src/lib/utils/emailWhitelist.ts` - Whitelist validation logic
- `/app/api/auth/callback/route.ts` - OAuth callback handler
- `/src/components/auth/LoginPage.tsx` - Login page with error handling
- `/src/components/auth/AuthGuard.tsx` - Protected route guard
- `.env.example` - Environment variable template

### Key Functions

- `isEmailWhitelisted(email)` - Check if email is in whitelist
- `getWhitelistedEmails()` - Get array of whitelisted emails
- `isWhitelistConfigured()` - Check if whitelist is configured
- `getWhitelistErrorMessage()` - Get user-friendly error message
