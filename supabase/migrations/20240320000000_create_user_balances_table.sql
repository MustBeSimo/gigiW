-- Create user_balances table to track chat credits

-- Function to keep updated_at current
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Table to store remaining chat credits and voice time per user
create table if not exists public.user_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 50,
  voice_time_remaining integer not null default 300, -- 5 minutes in seconds
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.user_balances enable row level security;

-- Create RLS policies
create policy "Users can view their own balance"
  on public.user_balances for select
  using (auth.uid() = user_id);

create policy "Users can update their own balance"
  on public.user_balances for update
  using (auth.uid() = user_id);

-- Trigger to auto-update updated_at
drop trigger if exists set_updated_at on public.user_balances;
create trigger set_updated_at
  before update on public.user_balances
  for each row execute procedure public.set_updated_at();
