-- Create analytics events table
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  event_type text not null,
  metadata jsonb,
  timestamp timestamp with time zone default now(),
  created_at timestamp with time zone default now()
);

-- Add RLS policies
alter table public.analytics_events enable row level security;

-- Users can only insert their own analytics events
create policy "Users can insert own analytics events"
  on public.analytics_events for insert
  with check (auth.uid() = user_id);

-- Users can only view their own analytics events
create policy "Users can view own analytics events"
  on public.analytics_events for select
  using (auth.uid() = user_id);

-- Create index for faster queries
create index analytics_events_user_id_idx on public.analytics_events(user_id);
create index analytics_events_event_type_idx on public.analytics_events(event_type);
create index analytics_events_timestamp_idx on public.analytics_events(timestamp); 