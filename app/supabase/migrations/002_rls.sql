-- Enable RLS on all tables
alter table public.products enable row level security;
alter table public.foundations enable row level security;
alter table public.patterns enable row level security;
alter table public.copy_entries enable row level security;
alter table public.sessions enable row level security;
alter table public.session_messages enable row level security;
alter table public.budget_usage enable row level security;

-- Products: public read on active products
create policy "products_select" on public.products
  for select using (is_active = true);

-- Foundations: public read
create policy "foundations_select" on public.foundations
  for select using (true);

-- Patterns: public read
create policy "patterns_select" on public.patterns
  for select using (true);

-- Copy entries: public read on active entries
create policy "copy_entries_select" on public.copy_entries
  for select using (status = 'active');

-- Sessions: public read and insert
create policy "sessions_select" on public.sessions
  for select using (true);

create policy "sessions_insert" on public.sessions
  for insert with check (true);

-- Session messages: public read and insert
create policy "session_messages_select" on public.session_messages
  for select using (true);

create policy "session_messages_insert" on public.session_messages
  for insert with check (true);

-- Budget usage: public read; writes only via SECURITY DEFINER RPC
create policy "budget_usage_select" on public.budget_usage
  for select using (true);

-- Atomic budget increment (runs as postgres, bypasses RLS)
create or replace function public.increment_budget_cost(amount numeric)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.budget_usage
  set cost_usd = cost_usd + amount,
      updated_at = now()
  where id = 1;
end;
$$;

grant execute on function public.increment_budget_cost(numeric) to anon;
grant execute on function public.increment_budget_cost(numeric) to authenticated;
