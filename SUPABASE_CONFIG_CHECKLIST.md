# ⚡ Quick Supabase OAuth Configuration Checklist

## 🎯 Immediate Action Required

Your OAuth callback is failing because the redirect URLs are not configured in Supabase.

### Step 1: Add Redirect URLs (2 minutes)

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/auth/url-configuration
2. Under **Redirect URLs**, add this URL:

```
http://localhost:3000/auth/callback
```

3. Click **Save**

### Step 2: Verify Site URL

In the same page, ensure **Site URL** is set to:

```
http://localhost:3000
```

### Step 3: Check Google Provider

1. Go to: https://app.supabase.com/project/YOUR_PROJECT/auth/providers
2. Ensure **Google** is **Enabled**
3. Verify Client ID and Client Secret are configured

## That's It!

After adding the redirect URLs:

1. Restart your dev server: `npm run dev`
2. Try logging in with Google
3. Check your terminal for detailed logs

## What to Expect

When you click "Continue with Google", you should see these logs in your **browser console**:

```
🔐 Client-side auth callback started
👤 User authenticated: { email: 'youremail@gmail.com', ... }
🔍 Checking email whitelist for: youremail@gmail.com
📧 Email whitelist check: { whitelistedEmails: [...] }
✅ Email youremail@gmail.com is whitelisted
✅ Successful login from whitelisted email: youremail@gmail.com
```

## If You Still Get Errors

The detailed logs will tell you exactly what's wrong:

- **No session found**: Redirect URL not configured or OAuth flow incomplete
- **Session error**: OAuth credentials issue or Supabase configuration
- **Email not whitelisted**: Add email to `.env.local`

Check your **browser console** (DevTools → Console) for detailed error messages.

See [SUPABASE_OAUTH_SETUP.md](./docs/SUPABASE_OAUTH_SETUP.md) for detailed setup instructions.
