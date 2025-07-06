-- Update user_balances table to reflect new Free Trial pricing

-- Update the default balance for new users to 20 messages (instead of 50)
alter table public.user_balances 
alter column balance set default 20;

-- Update existing free users to the new balance (optional - only if needed)
-- This will only affect users who haven't used their messages yet
update public.user_balances 
set balance = 20 
where balance = 50 and user_id in (
  select user_id from public.user_balances 
  where balance = 50 
  and not exists (
    select 1 from public.subscriptions 
    where user_id = user_balances.user_id 
    and status = 'active'
  )
);

-- Add a comment to track the change
comment on column public.user_balances.balance is 'Message credits: 20 for free trial, 200 for Plus, unlimited for Pro'; 