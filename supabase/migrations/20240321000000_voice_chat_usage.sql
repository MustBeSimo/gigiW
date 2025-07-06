-- Create subscription status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE subscription_status AS ENUM ('trial', 'subscribed', 'expired');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create voice chat usage tracking table
create table if not exists public.voice_chat_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  session_start timestamp with time zone default now(),
  session_end timestamp with time zone,
  duration_seconds integer,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create user subscription table
create table if not exists public.user_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status subscription_status default 'trial',
  total_trial_seconds integer default 0,
  trial_start_date timestamp with time zone default now(),
  subscription_start_date timestamp with time zone,
  subscription_end_date timestamp with time zone,
  stripe_customer_id text,
  stripe_subscription_id text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS on voice chat usage
alter table public.voice_chat_usage enable row level security;

-- Enable RLS on user subscriptions  
alter table public.user_subscriptions enable row level security;

-- Create RLS policies for voice_chat_usage
DO $$ BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own voice chat usage" ON public.voice_chat_usage;
    DROP POLICY IF EXISTS "Users can insert their own voice chat usage" ON public.voice_chat_usage;
    DROP POLICY IF EXISTS "Users can update their own voice chat usage" ON public.voice_chat_usage;
    
    -- Create new policies
    CREATE POLICY "Users can view their own voice chat usage" ON public.voice_chat_usage
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own voice chat usage" ON public.voice_chat_usage
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own voice chat usage" ON public.voice_chat_usage
      FOR UPDATE USING (auth.uid() = user_id);
END $$;

-- Create RLS policies for user_subscriptions
DO $$ BEGIN
    -- Drop existing policies if they exist
    DROP POLICY IF EXISTS "Users can view their own subscription" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Users can insert their own subscription" ON public.user_subscriptions;
    DROP POLICY IF EXISTS "Users can update their own subscription" ON public.user_subscriptions;
    
    -- Create new policies
    CREATE POLICY "Users can view their own subscription" ON public.user_subscriptions
      FOR SELECT USING (auth.uid() = user_id);
    
    CREATE POLICY "Users can insert their own subscription" ON public.user_subscriptions
      FOR INSERT WITH CHECK (auth.uid() = user_id);
    
    CREATE POLICY "Users can update their own subscription" ON public.user_subscriptions
      FOR UPDATE USING (auth.uid() = user_id);
END $$;

-- Create updated_at trigger for voice_chat_usage
create or replace trigger voice_chat_usage_updated_at
  before update on public.voice_chat_usage
  for each row execute function public.set_updated_at();

-- Create updated_at trigger for user_subscriptions
create or replace trigger user_subscriptions_updated_at
  before update on public.user_subscriptions
  for each row execute function public.set_updated_at();

-- Function to handle Stripe subscription updates
create or replace function public.handle_stripe_subscription_updated()
returns trigger as $$
begin
  -- Update user subscription status based on Stripe webhook
  if new.status = 'active' then
    update public.user_subscriptions
    set 
      status = 'subscribed',
      subscription_start_date = now(),
      updated_at = now()
    where stripe_subscription_id = new.id;
  elsif new.status = 'canceled' or new.status = 'unpaid' then
    update public.user_subscriptions
    set 
      status = 'expired',
      subscription_end_date = now(),
      updated_at = now()
    where stripe_subscription_id = new.id;
  end if;
  
  return new;
end;
$$ language plpgsql security definer;

-- Drop existing function if it exists (it may have different return type)
DROP FUNCTION IF EXISTS public.check_trial_eligibility(uuid);

-- Function to check trial eligibility
create or replace function public.check_trial_eligibility(user_uuid uuid)
returns boolean as $$
declare
  subscription_record record;
  trial_seconds_used integer;
begin
  -- Get user subscription record
  select * into subscription_record
  from public.user_subscriptions
  where user_id = user_uuid;
  
  -- If no subscription record exists, user is eligible for trial
  if subscription_record is null then
    return true;
  end if;
  
  -- If user has active subscription, they're eligible
  if subscription_record.status = 'subscribed' then
    return true;
  end if;
  
  -- Check if user has used up their trial (5 minutes = 300 seconds)
  if subscription_record.total_trial_seconds >= 300 then
    return false;
  end if;
  
  return true;
end;
$$ language plpgsql security definer; 