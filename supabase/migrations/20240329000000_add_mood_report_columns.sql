-- Create mood_logs table with full report data
CREATE TABLE IF NOT EXISTS public.mood_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_emoji text NOT NULL,
  mood_rating integer NOT NULL CHECK (mood_rating >= 1 AND mood_rating <= 10),
  mood_note text,
  insight text,
  cbt_technique text,
  affirmation text,
  action_step text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS mood_logs_user_id_created_at_idx 
  ON public.mood_logs(user_id, created_at DESC);

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS mood_logs_updated_at ON public.mood_logs;
CREATE TRIGGER mood_logs_updated_at
  BEFORE UPDATE ON public.mood_logs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at(); 