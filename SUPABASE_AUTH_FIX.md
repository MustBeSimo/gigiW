# Fix Google Auth Redirect Issue

## Problem
After Google auth, users are redirected to:
`https://dovkdtfoejhsezdvctgy.supabase.co/?code=...`

Instead of your app.

## Solution: Update Supabase Auth Settings

### Step 1: Set Site URL

1. Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/auth/url-configuration

2. Set **Site URL** to your production URL:
   ```
   https://gigi-website-kssc5e8tf-simoleoitas-projects.vercel.app
   ```

3. Or if you have a custom domain, use that instead.

### Step 2: Add Redirect URLs

In the same page, add these **Redirect URLs**:

```
https://gigi-website-kssc5e8tf-simoleoitas-projects.vercel.app/api/auth/callback
https://gigi-website-kssc5e8tf-simoleoitas-projects.vercel.app/*
http://localhost:3000/api/auth/callback
http://localhost:3000/*
```

Click **Save** after adding each one.

### Step 3: Update Vercel Environment Variable

Add this to Vercel environment variables:

```
NEXT_PUBLIC_APP_URL=https://gigi-website-kssc5e8tf-simoleoitas-projects.vercel.app
```

### Step 4: Redeploy

After making these changes, redeploy:

```bash
vercel --prod
```

## Quick Links

- **Supabase Auth Config**: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/auth/url-configuration
- **Vercel Env Vars**: https://vercel.com/simoleoitas-projects/gigi-website/settings/environment-variables

## Test After Fix

1. Go to your app
2. Click "Sign in with Google"
3. Should redirect back to your app, not Supabase

---

**Note**: If you get a custom domain later, update these URLs again!

