# 🚀 Deploy Your Schema RIGHT NOW (3 minutes)

## Step 1: Open Supabase SQL Editor

**Click this link** to open your SQL editor:
👉 https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/sql/new

## Step 2: Copy the Schema

1. Open the file: `supabase/deploy_schema.sql` in your code editor
2. Select ALL the text (Cmd+A or Ctrl+A)
3. Copy it (Cmd+C or Ctrl+C)

## Step 3: Paste and Run

1. In the Supabase SQL Editor (from Step 1)
2. Paste the schema (Cmd+V or Ctrl+V)
3. Click the **RUN** button (or press Cmd+Enter)
4. Wait ~10-15 seconds ⏳

You should see: ✅ "Success. No rows returned"

## Step 4: Verify Tables Were Created

**Click this link** to see your tables:
👉 https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/editor

You should see 7 new tables:
- ✅ profiles
- ✅ user_balances
- ✅ user_subscriptions
- ✅ voice_chat_usage
- ✅ analytics_events
- ✅ mood_logs (sensitive data)
- ✅ breathing_logs

## Step 5: Update Your .env.local File

Create or update `.env.local` in your project root with:

```env
NEXT_PUBLIC_SUPABASE_URL=https://dovkdtfoejhsezdvctgy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvdmtkdGZvZWpoc2V6ZHZjdGd5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjM2MDIsImV4cCI6MjA3OTg5OTYwMn0.U7WdJ1v6VAXhjEgOziimVHjY7Vts17coj_LSTb0e6Sc
```

**IMPORTANT**: You also need the service role key:

1. Go to: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/settings/api
2. Scroll to "Project API keys"
3. Copy the **service_role** key (⚠️ Keep it secret!)
4. Add to `.env.local`:

```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## Step 6: Test Your Connection

Run in your terminal:

```bash
npm run dev
```

Then try:
- Sign up with a test email
- Log in
- Check if your profile is created

## 🎉 Done!

Your database is now deployed and ready to use.

## Next Steps

1. Verify RLS policies: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/auth/policies
2. Review compliance: Read `mind_gleam_global_compliance_blueprint.md`
3. Set up Stripe webhooks (for subscriptions)
4. Configure authentication providers

## Troubleshooting

### Problem: "relation does not exist"
**Solution**: The schema wasn't deployed. Go back to Step 1 and run the SQL.

### Problem: "permission denied"
**Solution**: Check that RLS policies were created (they should be automatic from the schema).

### Problem: Can't see tables
**Solution**: Make sure you're looking in the `public` schema, not `auth` or `storage`.

## Need Help?

- Full documentation: See `DEPLOYMENT_GUIDE.md`
- Supabase Dashboard: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy
- SQL Editor: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/sql

---

**🔒 Security Note**: Never commit your `.env.local` file to Git. It's already in `.gitignore`.

