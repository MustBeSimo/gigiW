# Supabase SQL: User Balances Table for Chat Credits

```sql
-- Ensure the trigger function for updated_at exists
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Table for tracking user chat balances
create table if not exists public.user_balances (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance integer not null default 50,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Trigger to automatically update 'updated_at' on balance changes
drop trigger if exists set_updated_at on public.user_balances;
create trigger set_updated_at
  before update on public.user_balances
  for each row execute procedure public.set_updated_at();
```

---

- Each user (referenced by Supabase `auth.users.id`) gets a row in `user_balances`.
- The `balance` column tracks their remaining chat credits (default 50 on creation).
- `created_at` and `updated_at` track when the record was created/modified.
- The trigger keeps `updated_at` fresh on every update.

Copy-paste this into the Supabase SQL editor or use as a migration file.
