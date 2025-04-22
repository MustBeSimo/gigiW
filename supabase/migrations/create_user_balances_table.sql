-- Supabase migration: create user_balances table to track chat credits

-- Function to keep updated_at current
echo 'Creating set_updated_at trigger function';
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Table to store remaining chat credits per user
create table if not exists public.user_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 50,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Trigger to auto-update updated_at
drop trigger if exists set_updated_at on public.user_balances;
create trigger set_updated_at
  before update on public.user_balances
  for each row execute procedure public.set_updated_at();
