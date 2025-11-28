# Quick Deploy Instructions

## 🚀 Deploy Your Schema to Supabase NOW

### Method 1: Direct SQL (Fastest - 2 minutes)

1. **Open Supabase SQL Editor:**
   - Click here: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/sql/new

2. **Copy & Paste:**
   - Open the file: `supabase/deploy_schema.sql`
   - Select ALL (Cmd+A)
   - Copy (Cmd+C)
   - Paste into the SQL Editor (Cmd+V)

3. **Run:**
   - Click the **RUN** button (or press Cmd+Enter)
   - Wait ~10 seconds for completion

4. **Verify:**
   - Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/editor
   - You should see 7 tables in the public schema

### Method 2: Using Supabase CLI

```bash
# Install CLI (if needed)
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref dovkdtfoejhsezdvctgy

# Push migrations
supabase db push
```

## 📝 Update Your App Configuration

You need to add these to your `.env.local` file:

```bash
# Add these values to .env.local
NEXT_PUBLIC_SUPABASE_URL=https://dovkdtfoejhsezdvctgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmtkdGZvZWpoc2V6ZHZjdGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjM2MDIsImV4cCI6MjA3OTg5OTYwMn0.U7WdJ1v6VAXhjEgOziimVHjY7Vts17coj_LSTb0e6Sc
```

**⚠️ You also need the SERVICE_ROLE_KEY:**
- Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/settings/api
- Copy the `service_role` secret key
- Add it to `.env.local`:
  ```
  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
  ```

## ✅ Test Your Connection

```bash
# Start your dev server
npm run dev

# Open browser
open http://localhost:3000
```

Try to:
1. Sign up with an email
2. Log in
3. Check that profile is created

## 🔒 Compliance Check

Before going to production:

- [ ] Review `mind_gleam_global_compliance_blueprint.md`
- [ ] Ensure RLS is enabled on all tables ✅ (done automatically)
- [ ] Verify mood_logs (sensitive health data) is protected ✅ (done automatically)
- [ ] Add disclaimer banners to UI
- [ ] Test user data isolation (users can only see their own data)

## 🎯 What the Schema Includes

1. **profiles** - User profile information
2. **user_balances** - Chat credits, voice minutes, mood check-ins
3. **user_subscriptions** - Subscription status & Stripe integration
4. **voice_chat_usage** - Voice session tracking
5. **analytics_events** - App usage analytics
6. **mood_logs** - 🔒 Sensitive mental health data (RLS enforced)
7. **breathing_logs** - Breathing exercise tracking
8. **user_memory** - 🧠 Smart memory system for personalization

All tables have Row Level Security (RLS) enabled for privacy compliance.

### 🧠 Smart Memory System (NEW)

The `user_memory` table enables personalized AI responses by:
- Extracting insights from conversations (preferences, patterns, traits)
- Storing compact notes about each user
- Auto-compacting when reaching 500 words (reduces to ~100 words)
- Users can view/clear their memory via API (`/api/memory`)

## Need Help?

- Full guide: See `DEPLOYMENT_GUIDE.md`
- Supabase Dashboard: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy
- Compliance: See `mind_gleam_global_compliance_blueprint.md`

