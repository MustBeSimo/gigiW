# Supabase Database Schema

This directory contains all database migrations and schema definitions for MindGleam.

## 📁 Directory Structure

```
supabase/
├── migrations/          # Individual migration files (chronological order)
├── deploy_schema.sql   # Complete schema for fresh deployment
├── config.toml         # Supabase project configuration
└── README.md          # This file
```

## 🗄️ Database Schema Overview

### Tables

1. **profiles** - User profile information
   - Basic user data (name, email, avatar)
   - Avatar style preferences
   - RLS: Users can only access their own profile

2. **user_balances** - Credit tracking
   - Chat message credits (20 free, 200+ for paid)
   - Voice time remaining (seconds)
   - Mood check-in credits
   - RLS: Users can only see/update their own balance
   - Service role can manage all (for webhooks)

3. **user_subscriptions** - Subscription management
   - Subscription status (trial, subscribed, expired)
   - Stripe customer/subscription IDs
   - Trial usage tracking
   - RLS: Users can only see their own subscription

4. **voice_chat_usage** - Voice session tracking
   - Session start/end times
   - Duration in seconds
   - RLS: Users can only see their own sessions

5. **analytics_events** - App usage analytics
   - Event type and metadata
   - User-specific events
   - RLS: Users can only insert/view their own events

6. **mood_logs** - 🔒 Sensitive mental health data
   - Mood ratings, emojis, notes
   - CBT insights and techniques
   - Affirmations and action steps
   - ⚠️ GDPR/HIPAA considerations apply
   - RLS: Strict user isolation enforced

7. **breathing_logs** - Breathing exercise tracking
   - Pattern type and cycles completed
   - Duration tracking
   - Supports guest (anonymous) usage
   - RLS: Users see only their own logs

### Functions

- `set_updated_at()` - Auto-update timestamp trigger
- `handle_stripe_subscription_updated()` - Webhook handler
- `check_trial_eligibility(uuid)` - Trial status checker

### Security

All tables have Row Level Security (RLS) enabled with policies that:
- Users can only access their own data
- Service role (webhooks) can manage data where needed
- Guest access is explicitly controlled (breathing_logs)

## 🚀 Deployment

### Quick Deploy (Recommended)

1. **Open SQL Editor**: 
   https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/sql/new

2. **Copy & Run**: 
   Copy all contents of `deploy_schema.sql` and run it

3. **Verify**: 
   https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/editor

See `../DEPLOY_NOW.md` for detailed step-by-step instructions.

### Using Supabase CLI

```bash
# Login
supabase login

# Link project
supabase link --project-ref dovkdtfoejhsezdvctgy

# Push migrations
supabase db push
```

## 🧪 Testing

After deployment, verify your connection:

```bash
npm run verify-db
```

This will check:
- ✅ Connection to Supabase
- ✅ All tables exist
- ✅ Environment variables are set
- ✅ RLS policies are enabled

## 🔒 Compliance & Privacy

**IMPORTANT**: This app handles sensitive mental health data.

Before production deployment:

1. **Review Compliance Blueprint**
   - Read: `../mind_gleam_global_compliance_blueprint.md`
   - Ensure all disclaimers are in place
   - Verify crisis resources are accessible

2. **Verify RLS Policies**
   - Check: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy/auth/policies
   - Test user data isolation
   - Ensure service role access is limited

3. **Data Protection**
   - `mood_logs` contains sensitive health information
   - Encryption at rest: ✅ (Supabase default)
   - Encryption in transit: ✅ (TLS 1.3)
   - User consent: ⚠️ Must be implemented in UI

4. **Privacy Requirements**
   - GDPR: Right to access, correction, deletion
   - CCPA: Do not sell/share data
   - APP (Australia): Sensitive data consent

See Section 5 of the compliance blueprint for full requirements.

## 📊 Migration History

| Date       | Migration                              | Description                          |
|------------|----------------------------------------|--------------------------------------|
| 2024-03-20 | `create_user_balances_table.sql`      | Initial balance tracking             |
| 2024-03-21 | `voice_chat_usage.sql`                | Voice session & subscription tracking|
| 2024-03-22 | `analytics_events.sql`                | App analytics                        |
| 2024-03-28 | `mood_logs_and_avatar_style.sql`      | Mood logging (sensitive data)        |
| 2024-03-29 | `add_mood_report_columns.sql`         | Enhanced mood insights               |
| 2024-03-30 | `add_mood_checkin_balance.sql`        | Mood check-in credits                |
| 2024-04-01 | `update_free_trial_balance.sql`       | Adjust free tier limits              |
| 2024-04-01 | `fix_user_balances_rls.sql`           | Fix RLS for webhooks                 |
| 2025-08-28 | `breathing_logs.sql`                  | Breathing exercise tracking          |

## 🔧 Maintenance

### Adding a New Migration

1. Create a new file in `migrations/`:
   ```
   YYYYMMDD_description.sql
   ```

2. Write your migration (include RLS policies)

3. Update `deploy_schema.sql` to include the changes

4. Test locally with Supabase CLI:
   ```bash
   supabase db reset
   ```

5. Deploy to production

### Backing Up Data

```bash
# Using Supabase CLI
supabase db dump -f backup.sql

# Or via dashboard
# Settings > Database > Backups
```

### Monitoring

- **Dashboard**: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy
- **Logs**: Auth logs, API logs, Database logs
- **Performance**: Query performance, table sizes

## 📚 Resources

- **Supabase Docs**: https://supabase.com/docs
- **RLS Guide**: https://supabase.com/docs/guides/auth/row-level-security
- **Project Dashboard**: https://supabase.com/dashboard/project/dovkdtfoejhsezdvctgy
- **Compliance Blueprint**: `../mind_gleam_global_compliance_blueprint.md`

## 🆘 Support

### Common Issues

**"relation does not exist"**
- Schema not deployed
- Run `deploy_schema.sql`

**"permission denied"**
- RLS policy issue
- Check auth context
- Verify user is authenticated

**"service_role key not found"**
- Missing environment variable
- Get from: Settings > API
- Add to `.env.local`

### Getting Help

1. Check deployment guides in project root
2. Review Supabase dashboard logs
3. Verify RLS policies
4. Test with `npm run verify-db`

---

**Last Updated**: November 2025  
**Schema Version**: 1.0  
**Supabase Project**: dovkdtfoejhsezdvctgy

