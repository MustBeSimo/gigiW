-- MindGleam Database Schema Deployment Script
-- 
-- This script creates all necessary tables, RLS policies, and functions
-- for the MindGleam application on Supabase
-- 
-- IMPORTANT: Review mind_gleam_global_compliance_blueprint.md before deployment
-- Sensitive health data requires proper RLS and encryption

-- ============================================================================
-- 1. HELPER FUNCTIONS
-- ============================================================================

-- Function to keep updated_at current
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- 2. PROFILES TABLE
-- ============================================================================

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  avatar_style TEXT CHECK (avatar_style IN ('friend','professional','minimal')) DEFAULT 'friend',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger for profiles
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 3. USER BALANCES TABLE
-- ============================================================================

-- Table to store remaining chat credits and voice time per user
CREATE TABLE IF NOT EXISTS public.user_balances (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 20,
  voice_time_remaining INTEGER NOT NULL DEFAULT 300, -- 5 minutes in seconds
  mood_checkins_remaining INTEGER NOT NULL DEFAULT 10,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON user_balances', policy_record.policyname);
    END LOOP;
END $$;

-- Policy for users to read their own balance
CREATE POLICY "Users can read own balance"
ON user_balances
FOR SELECT
USING (auth.uid() = user_id);

-- Policy for users to update their own balance  
CREATE POLICY "Users can update own balance"
ON user_balances
FOR UPDATE
USING (auth.uid() = user_id);

-- CRITICAL: Policy for service role to manage all balances (needed for webhooks)
CREATE POLICY "Service role can manage all balances"
ON user_balances
FOR ALL
USING (auth.role() = 'service_role');

-- Policy for inserting new balances
CREATE POLICY "Allow insert with matching user_id"
ON user_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Grant necessary permissions
GRANT ALL ON user_balances TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS set_updated_at ON public.user_balances;
CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.user_balances
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- Comment to track balance tiers
COMMENT ON COLUMN public.user_balances.balance IS 'Message credits: 20 for free trial, 200 for Plus, unlimited for Pro';

-- ============================================================================
-- 4. SUBSCRIPTION STATUS AND TABLES
-- ============================================================================

-- Create subscription status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trial', 'subscribed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Create voice chat usage tracking table
CREATE TABLE IF NOT EXISTS public.voice_chat_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create user subscription table
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  status subscription_status DEFAULT 'trial',
  total_trial_seconds INTEGER DEFAULT 0,
  trial_start_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  subscription_start_date TIMESTAMP WITH TIME ZONE,
  subscription_end_date TIMESTAMP WITH TIME ZONE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on voice chat usage
ALTER TABLE public.voice_chat_usage ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user subscriptions  
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for voice_chat_usage
DROP POLICY IF EXISTS "Users can view their own voice chat usage" ON public.voice_chat_usage;
CREATE POLICY "Users can view their own voice chat usage" ON public.voice_chat_usage
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own voice chat usage" ON public.voice_chat_usage;
CREATE POLICY "Users can insert their own voice chat usage" ON public.voice_chat_usage
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own voice chat usage" ON public.voice_chat_usage;
CREATE POLICY "Users can update their own voice chat usage" ON public.voice_chat_usage
  FOR UPDATE USING (auth.uid() = user_id);

-- Create RLS policies for user_subscriptions
DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
  FOR UPDATE USING (auth.uid() = user_id);

-- Create updated_at trigger for voice_chat_usage
DROP TRIGGER IF EXISTS voice_chat_usage_updated_at ON public.voice_chat_usage;
CREATE TRIGGER voice_chat_usage_updated_at
  BEFORE UPDATE ON public.voice_chat_usage
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Create updated_at trigger for user_subscriptions
DROP TRIGGER IF EXISTS user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER user_subscriptions_updated_at
  BEFORE UPDATE ON public.user_subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Function to handle Stripe subscription updates
CREATE OR REPLACE FUNCTION public.handle_stripe_subscription_updated()
RETURNS TRIGGER AS $$
BEGIN
  -- Update user subscription status based on Stripe webhook
  IF new.status = 'active' THEN
    UPDATE public.user_subscriptions
    SET 
      status = 'subscribed',
      subscription_start_date = now(),
      updated_at = now()
    WHERE stripe_subscription_id = new.id;
  ELSIF new.status = 'canceled' OR new.status = 'unpaid' THEN
    UPDATE public.user_subscriptions
    SET 
      status = 'expired',
      subscription_end_date = now(),
      updated_at = now()
    WHERE stripe_subscription_id = new.id;
  END IF;
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing function if it exists (it may have different return type)
DROP FUNCTION IF EXISTS public.check_trial_eligibility(UUID);

-- Function to check trial eligibility
CREATE OR REPLACE FUNCTION public.check_trial_eligibility(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  subscription_record RECORD;
  trial_seconds_used INTEGER;
BEGIN
  -- Get user subscription record
  SELECT * INTO subscription_record
  FROM public.user_subscriptions
  WHERE user_id = user_uuid;
  
  -- If no subscription record exists, user is eligible for trial
  IF subscription_record IS NULL THEN
    RETURN true;
  END IF;
  
  -- If user has active subscription, they're eligible
  IF subscription_record.status = 'subscribed' THEN
    RETURN true;
  END IF;
  
  -- Check if user has used up their trial (5 minutes = 300 seconds)
  IF subscription_record.total_trial_seconds >= 300 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. ANALYTICS EVENTS TABLE
-- ============================================================================

-- Create analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only insert their own analytics events
DROP POLICY IF EXISTS "Users can insert own analytics events" ON public.analytics_events;
CREATE POLICY "Users can insert own analytics events"
  ON public.analytics_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can only view their own analytics events
DROP POLICY IF EXISTS "Users can view own analytics events" ON public.analytics_events;
CREATE POLICY "Users can view own analytics events"
  ON public.analytics_events FOR SELECT
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON public.analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_type_idx ON public.analytics_events(event_type);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON public.analytics_events(timestamp);

-- ============================================================================
-- 6. MOOD LOGS TABLE (SENSITIVE HEALTH DATA)
-- ============================================================================

-- Create mood_logs table with full report data
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_emoji TEXT NOT NULL,
  mood_rating INTEGER NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
  mood_note TEXT,
  insight TEXT,
  cbt_technique TEXT,
  affirmation TEXT,
  action_step TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can view their own mood logs"
  ON public.mood_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can insert their own mood logs"
  ON public.mood_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can update their own mood logs"
  ON public.mood_logs FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own mood logs" ON public.mood_logs;
CREATE POLICY "Users can delete their own mood logs"
  ON public.mood_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX IF NOT EXISTS mood_logs_user_id_created_at_idx 
  ON public.mood_logs(user_id, created_at DESC);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS mood_logs_updated_at ON public.mood_logs;
CREATE TRIGGER mood_logs_updated_at
  BEFORE UPDATE ON public.mood_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============================================================================
-- 7. BREATHING LOGS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.breathing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NULL REFERENCES auth.users(id) ON DELETE SET NULL,
  pattern TEXT NOT NULL DEFAULT 'box-4-4-4-4',
  cycles_completed INTEGER NOT NULL DEFAULT 0 CHECK (cycles_completed >= 0),
  duration_ms INTEGER NOT NULL DEFAULT 0 CHECK (duration_ms >= 0),
  started_at TIMESTAMPTZ NULL,
  ended_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT NULL,
  is_guest BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.breathing_logs ENABLE ROW LEVEL SECURITY;

-- Policy: users can insert their own row (or anonymous logs marked guest)
DROP POLICY IF EXISTS "insert_own_or_guest" ON public.breathing_logs;
CREATE POLICY "insert_own_or_guest" ON public.breathing_logs
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NULL AND is_guest = true
    OR auth.uid() IS NOT NULL AND (user_id = auth.uid() OR user_id IS NULL)
  );

-- Policy: users can read their own logs only
DROP POLICY IF EXISTS "read_own" ON public.breathing_logs;
CREATE POLICY "read_own" ON public.breathing_logs
  FOR SELECT
  USING (user_id = auth.uid());

-- Optional: users can delete their own logs
DROP POLICY IF EXISTS "delete_own" ON public.breathing_logs;
CREATE POLICY "delete_own" ON public.breathing_logs
  FOR DELETE
  USING (user_id = auth.uid());

-- ============================================================================
-- 8. USER MEMORY TABLE (Smart Personalization)
-- ============================================================================

-- User Memory System
-- Stores accumulated insights about users from conversations
-- Implements automatic compaction when word limit is reached (500 words -> ~100 words)
-- 
-- COMPLIANCE NOTE: This contains sensitive user data
-- RLS is enforced to ensure user data isolation
-- See mind_gleam_global_compliance_blueprint.md Section 5

-- Table to store user context/memory
CREATE TABLE IF NOT EXISTS public.user_memory (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Current accumulated insights (short descriptive notes)
  insights TEXT DEFAULT '',
  
  -- Word count tracking for compaction trigger
  word_count INTEGER DEFAULT 0 CHECK (word_count >= 0),
  
  -- Compaction tracking
  compaction_count INTEGER DEFAULT 0,
  last_compacted_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.user_memory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own memory
DROP POLICY IF EXISTS "Users can view own memory" ON public.user_memory;
CREATE POLICY "Users can view own memory" ON public.user_memory
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own memory" ON public.user_memory;
CREATE POLICY "Users can insert own memory" ON public.user_memory
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own memory" ON public.user_memory;
CREATE POLICY "Users can update own memory" ON public.user_memory
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own memory" ON public.user_memory;
CREATE POLICY "Users can delete own memory" ON public.user_memory
  FOR DELETE USING (auth.uid() = user_id);

-- Service role access for background processing
DROP POLICY IF EXISTS "Service role can manage all memory" ON public.user_memory;
CREATE POLICY "Service role can manage all memory" ON public.user_memory
  FOR ALL USING (auth.role() = 'service_role');

-- Auto-update timestamp trigger
DROP TRIGGER IF EXISTS user_memory_updated_at ON public.user_memory;
CREATE TRIGGER user_memory_updated_at
  BEFORE UPDATE ON public.user_memory
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Index for performance
CREATE INDEX IF NOT EXISTS user_memory_user_id_idx ON public.user_memory(user_id);

-- Comments for documentation
COMMENT ON TABLE public.user_memory IS 'Stores accumulated insights about users from conversations. Auto-compacts when word_count exceeds threshold (500 words) to maintain 80% space efficiency.';
COMMENT ON COLUMN public.user_memory.insights IS 'Short descriptive notes about user preferences, patterns, and traits extracted from conversations';
COMMENT ON COLUMN public.user_memory.word_count IS 'Current word count - triggers compaction at 500 words';
COMMENT ON COLUMN public.user_memory.compaction_count IS 'Number of times insights have been compacted';

-- ============================================================================
-- DEPLOYMENT COMPLETE
-- ============================================================================

-- Verify all tables were created
SELECT 
  table_name,
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)::regclass)) AS size
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

