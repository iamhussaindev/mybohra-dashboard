# Supabase OAuth Setup Guide

## Step-by-Step Configuration

### 1. Configure Redirect URLs in Supabase

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Add the following to **Redirect URLs**:

**For Development:**

```
http://localhost:3000/api/auth/callback
http://localhost:3000/api/auth/set-session
```

**For Production:**

```
https://yourdomain.com/api/auth/callback
https://yourdomain.com/api/auth/set-session
```

### 2. Set Site URL

In the same **URL Configuration** page:

**For Development:**

```
Site URL: http://localhost:3000
```

**For Production:**

```
Site URL: https://yourdomain.com
```

### 3. Enable Google OAuth Provider

1. Go to **Authentication** → **Providers**
2. Find **Google** in the list
3. Click **Enable**
4. You'll need to configure Google OAuth credentials:

#### Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure consent screen if prompted
6. Application type: **Web application**
7. Add **Authorized redirect URIs**:

   ```
   https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback
   ```

   (Replace YOUR_PROJECT_REF with your Supabase project reference)

8. Copy the **Client ID** and **Client Secret**
9. Paste them in Supabase → Authentication → Providers → Google

### 4. Configure Environment Variables

In your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Email Whitelist (required for OAuth)
NEXT_PUBLIC_ALLOWED_EMAILS=youremail@gmail.com,otheremail@gmail.com
```

### 5. Restart Development Server

After making changes:

```bash
npm run dev
```

## Testing OAuth Flow

### Expected Flow:

1. **User clicks "Continue with Google"**

   ```
   Frontend calls: supabase.auth.signInWithOAuth()
   Redirects to: Google OAuth consent screen
   ```

2. **User authorizes on Google**

   ```
   Google redirects to: http://localhost:3000/api/auth/callback?code=XXX
   ```

3. **Callback route validates**

   ```
   - Exchanges code for session
   - Checks email against whitelist
   - If valid: Redirects to /api/auth/set-session
   - If invalid: Redirects to /login with error
   ```

4. **Set-session route**

   ```
   - Reads session from cookie
   - Sets session in localStorage
   - Redirects to /dashboard
   ```

5. **Dashboard loads**
   ```
   - AuthGuard checks for user
   - User is authenticated
   - Dashboard displays
   ```

## Debugging

### Check Browser Console

When OAuth callback is hit, open DevTools → Console and you should see:

```
🔐 Client-side auth callback started
👤 User authenticated: { email: 'user@example.com', id: 'xxx' }
🔍 Checking email whitelist for: user@example.com
📧 Email whitelist check: { email: 'user@example.com', whitelistedEmails: [...] }
✅ Email user@example.com is whitelisted
✅ Successful login from whitelisted email: user@example.com
```

### Common Issues

#### "Invalid authentication callback"

**Symptoms**: Error message appears immediately after Google authorization

**Causes**:

- Redirect URL not configured in Supabase
- Code parameter not being sent by Google
- Supabase project reference mismatch

**Solutions**:

1. Double-check redirect URLs in Supabase dashboard
2. Ensure Site URL is set correctly
3. Verify Google OAuth redirect URI matches your Supabase project

#### "Email not authorized"

**Symptoms**: Successfully authenticates with Google but gets error

**Cause**: Email not in whitelist

**Solution**: Add email to `.env.local`:

```env
NEXT_PUBLIC_ALLOWED_EMAILS=youremail@gmail.com
```

#### Session not persisting

**Symptoms**: Redirects to login after successful authentication

**Cause**: Session not being stored correctly

**Solutions**:

1. Check browser localStorage: `localStorage.getItem('sb-auth-token')`
2. Clear localStorage and try again: `localStorage.clear()`
3. Check if cookies are blocked in browser

## Verification Checklist

Before testing, verify:

- [ ] Supabase redirect URLs include `/api/auth/callback` and `/api/auth/set-session`
- [ ] Site URL matches your development/production URL
- [ ] Google OAuth is enabled in Supabase
- [ ] Google OAuth credentials are configured
- [ ] `NEXT_PUBLIC_ALLOWED_EMAILS` contains your email
- [ ] Development server was restarted after env changes
- [ ] Browser has no ad blockers/popup blockers interfering

## Manual Testing Steps

1. **Open browser in Incognito/Private mode**
2. **Clear localStorage**: Open DevTools Console and run:
   ```javascript
   localStorage.clear()
   ```
3. **Go to `/login`**
4. **Click "Continue with Google"**
5. **Watch the terminal** for callback logs
6. **Check browser console** for any errors
7. **Should redirect to dashboard** if email is whitelisted

## Production Deployment

When deploying to production:

1. **Update environment variables** in your hosting platform
2. **Add production redirect URLs** in Supabase dashboard
3. **Update Site URL** to production domain
4. **Add production redirect URI** in Google Cloud Console

## Troubleshooting Commands

```bash
# Check environment variables
cat .env.local | grep ALLOWED_EMAILS

# Restart dev server
npm run dev

# Clear build cache
rm -rf .next

# Rebuild
npm run build
```

## Still Having Issues?

1. Check the **Authentication Troubleshooting Guide** for more details
2. Review server logs for detailed error messages
3. Check browser DevTools → Console for client errors
4. Verify all URLs match exactly (no trailing slashes, correct protocol)
5. Try with a different browser or incognito mode
