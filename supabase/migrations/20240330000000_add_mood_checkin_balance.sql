-- Add mood check-in balance to user_balances table
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'user_balances' 
        AND column_name = 'mood_checkins_remaining'
    ) THEN
        ALTER TABLE public.user_balances 
        ADD COLUMN mood_checkins_remaining integer NOT NULL DEFAULT 10;
    END IF;
END $$;

-- Update existing users to have 10 mood check-ins if they don't have any set
UPDATE public.user_balances 
SET mood_checkins_remaining = 10 
WHERE mood_checkins_remaining IS NULL; 