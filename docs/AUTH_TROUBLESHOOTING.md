# Authentication Troubleshooting Guide

## Common Issues and Solutions

### Issue: "Invalid authentication callback" Error

This error occurs when OAuth callback fails. Here are the steps to fix it:

#### 1. **Check Supabase Redirect URLs Configuration**

Go to your Supabase Dashboard:

1. Navigate to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   ```
   http://localhost:3000/api/auth/callback
   https://yourdomain.com/api/auth/callback
   ```

#### 2. **Verify Site URL**

In Supabase Dashboard → **Authentication** → **URL Configuration**:

- **Site URL**: Set to `http://localhost:3000` for development
- For production: Set to your production URL (e.g., `https://yourdomain.com`)

#### 3. **Check Environment Variables**

Ensure these are set in `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_ALLOWED_EMAILS=youremail@example.com
```

#### 4. **Enable Google OAuth Provider**

In Supabase Dashboard:

1. Go to **Authentication** → **Providers**
2. Enable **Google** provider
3. Add your Google OAuth credentials:
   - Client ID
   - Client Secret

### Issue: "Email not authorized" Error

**Cause**: Your email is not in the whitelist

**Solution**: Add your email to the whitelist:

```env
NEXT_PUBLIC_ALLOWED_EMAILS=youremail@gmail.com,another@email.com
```

### Issue: Dashboard shows without login

**Cause**: Authentication guard not working

**Solutions**:

1. Clear browser localStorage and cookies
2. Check that `AuthGuard` wraps all protected routes
3. Verify `useAuth()` hook is detecting user state correctly

### Issue: Stuck on loading screen

**Cause**: Auth state not resolving

**Solutions**:

1. Check browser console for errors
2. Verify Supabase credentials are correct
3. Check network tab for failed API requests
4. Try signing out: `localStorage.clear()` in browser console

## Debugging Steps

### 1. Check Browser Console

Open Developer Tools → Console and look for these logs:

- `🔐 OAuth Callback received:` - Callback route was hit
- `🔄 Exchanging code for session...` - Code exchange started
- `👤 User authenticated:` - User data received
- `🔍 Checking email whitelist for:` - Email validation
- `✅ Successful login from whitelisted email:` - Success!

### 2. Check Network Tab

Look for these requests:

- `/api/auth/callback?code=...` - OAuth callback
- POST to Supabase auth endpoint - Session exchange

### 3. Check localStorage

In browser console:

```javascript
// Check if session exists
localStorage.getItem('sb-' + 'YOUR_PROJECT_REF' + '-auth-token')

// Clear session
localStorage.clear()
```

### 4. Test Authentication Flow

1. **Clear everything**: `localStorage.clear()` + clear cookies
2. **Go to login**: Should show login page
3. **Click Google login**: Should redirect to Google
4. **Authorize**: Should redirect to `/api/auth/callback`
5. **Check logs**: Look for callback logs in terminal
6. **Success**: Should redirect to `/dashboard`

## Supabase Dashboard Configuration Checklist

- [ ] Google OAuth provider enabled
- [ ] Google Client ID and Secret configured
- [ ] Redirect URLs include `/api/auth/callback`
- [ ] Site URL is set correctly
- [ ] Email confirmations disabled (if using OAuth only)
- [ ] RLS policies configured (if using database)

## Environment Variables Checklist

- [ ] `NEXT_PUBLIC_SUPABASE_URL` is set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` is set
- [ ] `NEXT_PUBLIC_ALLOWED_EMAILS` contains at least one email
- [ ] Server restarted after changing `.env.local`

## Quick Fix Commands

```bash
# Restart development server
npm run dev

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build

# Check environment variables
npm run check:env
```

## Support URLs to Configure

### Development

```
Site URL: http://localhost:3000
Redirect URLs:
  - http://localhost:3000/api/auth/callback
```

### Production

```
Site URL: https://yourdomain.com
Redirect URLs:
  - https://yourdomain.com/api/auth/callback
```

## Common Error Messages

| Error                             | Cause                                            | Solution                                    |
| --------------------------------- | ------------------------------------------------ | ------------------------------------------- |
| "Invalid authentication callback" | No code parameter or redirect URL not configured | Add redirect URL in Supabase dashboard      |
| "Email not authorized"            | Email not in whitelist                           | Add email to `ALLOWED_EMAILS`               |
| "Supabase is not configured"      | Missing env variables                            | Check `.env.local` file                     |
| "Failed to create session"        | Session exchange failed                          | Check Supabase logs and OAuth configuration |

## Advanced Debugging

### Enable Verbose Logging

The callback route now includes comprehensive logging. Watch your terminal for:

```
🔐 OAuth Callback received: { hasCode: true, hasError: false, url: '/api/auth/callback' }
🔄 Exchanging code for session...
👤 User authenticated: { email: 'user@example.com', id: 'user-id' }
🔍 Checking email whitelist for: user@example.com
📧 Email whitelist check: { email: 'user@example.com', whitelistedEmails: [...], ... }
✅ Email user@example.com is whitelisted
✅ Successful login from whitelisted email: user@example.com
```

### If you see "❌ No code in callback URL"

This means the OAuth flow didn't provide a code parameter. Check:

1. Redirect URL is correctly configured in Supabase
2. Google OAuth credentials are correct
3. You're not blocking redirects or popups in browser

### If you see "🚫 Blocked login attempt from non-whitelisted email"

Your email is not in the whitelist. Add it:

```env
NEXT_PUBLIC_ALLOWED_EMAILS=youremail@gmail.com
```

Then restart the server:

```bash
npm run dev
```

## Need More Help?

1. Check server logs for detailed error messages
2. Check browser console for client-side errors
3. Verify all configuration in Supabase dashboard
4. Ensure environment variables are correct
