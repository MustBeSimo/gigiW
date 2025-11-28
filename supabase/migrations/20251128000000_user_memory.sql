-- User Memory System
-- Stores accumulated insights about users from conversations
-- Implements automatic compaction when word limit is reached
-- 
-- COMPLIANCE NOTE: This contains sensitive user data
-- RLS is enforced to ensure user data isolation
-- See mind_gleam_global_compliance_blueprint.md Section 5

-- Table to store user context/memory
-- One row per user with accumulated insights
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

-- Comment for documentation
COMMENT ON TABLE public.user_memory IS 'Stores accumulated insights about users from conversations. Auto-compacts when word_count exceeds threshold (500 words) to maintain 80% space efficiency.';
COMMENT ON COLUMN public.user_memory.insights IS 'Short descriptive notes about user preferences, patterns, and traits extracted from conversations';
COMMENT ON COLUMN public.user_memory.word_count IS 'Current word count - triggers compaction at 500 words';
COMMENT ON COLUMN public.user_memory.compaction_count IS 'Number of times insights have been compacted';

