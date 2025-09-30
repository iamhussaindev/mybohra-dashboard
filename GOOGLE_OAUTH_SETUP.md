# Google OAuth Setup with Supabase

This guide will help you set up Google OAuth authentication with your Supabase project.

## 1. Create Google OAuth Credentials

### Step 1: Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Create a new project or select an existing one

### Step 2: Enable Google+ API

1. In the Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google+ API" and enable it
3. Also enable "Google Identity" API

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth 2.0 Client IDs**
3. Choose **Web application** as the application type
4. Add the following authorized redirect URIs:

   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

   Replace `your-project-id` with your actual Supabase project ID.

5. Click **Create**
6. Copy the **Client ID** and **Client Secret** - you'll need these for Supabase

## 2. Configure Supabase

### Step 1: Add Google Provider

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **Providers**
4. Find **Google** and click **Enable**

### Step 2: Add Google Credentials

1. In the Google provider settings, add:
   - **Client ID**: The Client ID from Google Cloud Console
   - **Client Secret**: The Client Secret from Google Cloud Console

### Step 3: Configure Redirect URLs

1. In the **Site URL** field, add your domain:

   ```
   http://localhost:3000
   ```

   (For production, use your actual domain)

2. In the **Redirect URLs** field, add:

   ```
   http://localhost:3000/dashboard
   https://yourdomain.com/dashboard
   ```

## 3. Update Environment Variables

Add these to your `.env.local` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service role key for server-side operations
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## 4. Test the Integration

1. Start your development server:

   ```bash
   yarn dev
   ```

2. Navigate to `/login`
3. Click "Continue with Google"
4. You should be redirected to Google's OAuth consent screen
5. After authentication, you'll be redirected back to your dashboard

## 5. Production Setup

### Update Google OAuth Settings

1. In Google Cloud Console, add your production domain to authorized redirect URIs:

   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```

### Update Supabase Settings

1. In Supabase Dashboard, update:
   - **Site URL**: Your production domain
   - **Redirect URLs**: Your production dashboard URL

## 6. Troubleshooting

### Common Issues

1. **"redirect_uri_mismatch" error**

   - Make sure the redirect URI in Google Cloud Console exactly matches your Supabase callback URL
   - Check for trailing slashes and protocol (http vs https)

2. **"invalid_client" error**

   - Verify your Client ID and Client Secret are correct
   - Make sure the Google+ API is enabled

3. **"access_denied" error**

   - Check that your Google OAuth consent screen is properly configured
   - Ensure the app is published or add test users

4. **Redirect not working**
   - Verify the redirect URLs in Supabase match your application routes
   - Check that your domain is added to the authorized domains in Google Cloud Console

### Debug Steps

1. Check browser console for errors
2. Verify environment variables are loaded correctly
3. Test with different browsers/incognito mode
4. Check Supabase logs in the dashboard

## 7. Security Best Practices

1. **Never commit credentials** to version control
2. **Use environment variables** for all sensitive data
3. **Enable Row Level Security** on your database tables
4. **Set up proper CORS** policies
5. **Use HTTPS** in production
6. **Regularly rotate** your OAuth credentials

## 8. Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Supabase Google Provider Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 9. Example Usage

```typescript
// In your React component
import { supabase } from '@lib/config/supabase'

const handleGoogleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  })
}
```

Your Google OAuth integration is now ready! 🎉
