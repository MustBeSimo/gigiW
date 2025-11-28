# MindGleam Supabase Deployment Guide

This guide will help you deploy your database schema to Supabase.

## Prerequisites

- Supabase account with a project created
- Access to your Supabase project dashboard
- Project URL and API keys

## Your Supabase Project Details

- **Project URL**: `https://dovkdtfoejhsezdvctgy.supabase.co`
- **Project Reference**: `dovkdtfoejhsezdvctgy`

## Step 1: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update `.env.local` with your credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://dovkdtfoejhsezdvctgy.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmtkdGZvZWpoc2V6ZHZjdGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjM2MDIsImV4cCI6MjA3OTg5OTYwMn0.U7WdJ1v6VAXhjEgOziimVHjY7Vts17coj_LSTb0e6Sc
   SUPABASE_SERVICE_ROLE_KEY=<get-from-supabase-dashboard>
   ```

   **To get your Service Role Key:**
   - Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/settings/api
   - Copy the `service_role` key (NOT the anon key)

## Step 2: Deploy Database Schema

You have **two options** for deploying the schema:

### Option A: Using Supabase Dashboard (Recommended for first-time deployment)

1. Log in to your Supabase dashboard
2. Navigate to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/editor
3. Click on the **SQL Editor** tab
4. Click **New Query**
5. Copy the entire contents of `supabase/deploy_schema.sql`
6. Paste it into the SQL Editor
7. Click **Run** to execute the schema

### Option B: Using Supabase CLI

1. Install Supabase CLI if not already installed:
   ```bash
   npm install -g supabase
   ```

2. Link your project:
   ```bash
   supabase link --project-ref dovkdtfoejhsezdvctgy
   ```

3. Deploy the schema:
   ```bash
   supabase db push
   ```

## Step 3: Verify Deployment

After deployment, verify that all tables were created:

1. Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/editor
2. Check that the following tables exist in the `public` schema:
   - ✅ `profiles`
   - ✅ `user_balances`
   - ✅ `user_subscriptions`
   - ✅ `voice_chat_usage`
   - ✅ `analytics_events`
   - ✅ `mood_logs` (sensitive data - ensure RLS is enabled)
   - ✅ `breathing_logs`

3. Verify Row Level Security (RLS) is enabled on all tables:
   - Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/auth/policies
   - Confirm each table has policies listed

## Step 4: Test the Connection

Run the test script to verify your app can connect to Supabase:

```bash
npm run dev
```

Then open your browser and test:
- User registration
- Login
- Profile creation
- Mood logging (sensitive data - verify it's properly protected)

## Compliance Checklist

Before deploying to production, ensure compliance with:

- ✅ Review `mind_gleam_global_compliance_blueprint.md`
- ✅ RLS (Row Level Security) is enabled on all tables
- ✅ Sensitive health data (mood_logs) has proper policies
- ✅ Service role keys are NOT exposed in client code
- ✅ Disclaimer banners are displayed in the app
- ✅ Crisis resources are geo-aware and accessible

## Common Issues

### Issue: "relation does not exist"
**Solution**: Make sure you ran the schema deployment in the correct order. The `deploy_schema.sql` file handles this automatically.

### Issue: "permission denied for table"
**Solution**: Check that RLS policies are correctly set up and that you're using the correct auth context.

### Issue: "function does not exist"
**Solution**: Ensure the helper functions (like `set_updated_at()`) were created first.

## Security Notes

⚠️ **IMPORTANT - Compliance Requirements:**

1. **Never commit** `.env.local` to version control
2. The **anon key** is safe to use in client-side code
3. The **service_role key** must ONLY be used server-side
4. **Mood logs** contain sensitive health data - ensure proper RLS
5. Review Section 5 of `mind_gleam_global_compliance_blueprint.md` for privacy requirements

## Next Steps

After successful deployment:

1. Set up Stripe webhooks for subscription management
2. Configure authentication providers (Google, Apple, etc.)
3. Set up storage buckets for user avatars
4. Configure email templates for auth flows
5. Set up monitoring and logging
6. Review and test all RLS policies

## Support

For issues or questions:
- Supabase Docs: https://supabase.com/docs
- Project Dashboard: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy
- Review `mind_gleam_global_compliance_blueprint.md` for compliance questions

