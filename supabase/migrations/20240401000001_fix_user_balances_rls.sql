-- Fix RLS policies for user_balances table to allow service role access
-- This is needed for Stripe webhooks to work properly

-- First, get all existing policies and drop them
DO $$
DECLARE
    policy_record RECORD;
BEGIN
    -- Drop all existing policies for user_balances table
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'user_balances' 
        AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY %I ON user_balances', policy_record.policyname);
    END LOOP;
END $$;

-- Ensure RLS is enabled
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

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

-- Policy for inserting new balances (needed for user registration and webhooks)
CREATE POLICY "Allow insert with matching user_id"
ON user_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Grant necessary permissions to service role
GRANT ALL ON user_balances TO service_role;
GRANT USAGE ON SCHEMA public TO service_role; 