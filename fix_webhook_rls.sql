-- SIMPLE FIX FOR STRIPE WEBHOOK RLS ISSUES
-- Run this in your Supabase SQL Editor

-- Step 1: Drop ALL existing policies for user_balances
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
        RAISE NOTICE 'Dropped policy: %', policy_record.policyname;
    END LOOP;
END $$;

-- Step 2: Ensure RLS is enabled
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Step 3: Create new policies
CREATE POLICY "Users can read own balance"
ON user_balances
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own balance"
ON user_balances
FOR UPDATE
USING (auth.uid() = user_id);

-- CRITICAL: This policy allows webhooks to work
CREATE POLICY "Service role can manage all balances"
ON user_balances
FOR ALL
USING (auth.role() = 'service_role');

CREATE POLICY "Allow insert with matching user_id"
ON user_balances
FOR INSERT
WITH CHECK (auth.uid() = user_id OR auth.role() = 'service_role');

-- Step 4: Grant permissions to service role
GRANT ALL ON user_balances TO service_role;
GRANT USAGE ON SCHEMA public TO service_role;

-- Step 5: Verify policies were created
SELECT 
    policyname,
    cmd as policy_type,
    qual as condition
FROM pg_policies 
WHERE tablename = 'user_balances' 
AND schemaname = 'public'
ORDER BY policyname; 