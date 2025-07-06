-- Create profiles table if it doesn't exist
create table if not exists public.profiles (
  id uuid references auth.users(id) primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now()),
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add avatar_style column to profiles table if it doesn't exist
DO $$ BEGIN
    ALTER TABLE public.profiles 
      ADD COLUMN avatar_style text CHECK (avatar_style IN ('friend','professional','minimal')) DEFAULT 'friend';
EXCEPTION
    WHEN duplicate_column THEN null;
END $$;

-- Create mood_logs table if it doesn't exist
create table if not exists public.mood_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  mood_emoji text,
  mood_rating integer check (mood_rating >= 0 and mood_rating <= 10),
  mood_note text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on mood_logs
alter table public.mood_logs enable row level security;

-- Enable RLS on profiles
alter table public.profiles enable row level security;

-- Create RLS policies for mood_logs
DO $$ BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own mood logs" ON public.mood_logs;
    DROP POLICY IF EXISTS "Users can insert their own mood logs" ON public.mood_logs;
    DROP POLICY IF EXISTS "Users can update their own mood logs" ON public.mood_logs;
    DROP POLICY IF EXISTS "Users can delete their own mood logs" ON public.mood_logs;
    
    -- Create new policies
    CREATE POLICY "Users can view their own mood logs" ON public.mood_logs
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own mood logs" ON public.mood_logs
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own mood logs" ON public.mood_logs
      FOR UPDATE USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can delete their own mood logs" ON public.mood_logs
      FOR DELETE USING (auth.uid() = user_id);
END $$;

-- Create RLS policies for profiles
DO $$ BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
    
    -- Create new policies
    CREATE POLICY "Users can view own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
    
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
END $$;

-- Create updated_at trigger for mood_logs
create or replace trigger mood_logs_updated_at
  before update on public.mood_logs
  for each row execute function public.set_updated_at();

-- Create updated_at trigger for profiles
create or replace trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create index for better performance
create index if not exists mood_logs_user_id_created_at_idx on mood_logs (user_id, created_at desc); 