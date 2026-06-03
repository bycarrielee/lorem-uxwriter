-- 008_budget_usage.sql
-- Single-row accumulator for shared Anthropic API budget tracking

create table if not exists public.budget_usage (
  id          int           primary key default 1,
  cost_usd    numeric(10,6) not null default 0,
  updated_at  timestamptz   not null default now()
);

-- Constraint: only one row ever (skip if already exists)
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'budget_usage_single_row'
    and conrelid = 'public.budget_usage'::regclass
  ) then
    alter table public.budget_usage add constraint budget_usage_single_row check (id = 1);
  end if;
end;
$$;

-- Seed the single row (no-op if already present)
insert into public.budget_usage (id, cost_usd)
values (1, 0)
on conflict (id) do nothing;

-- Atomic upsert-increment — called server-side via service role only
create or replace function public.increment_budget_cost(amount numeric)
returns void
language plpgsql
security definer
as $$
begin
  insert into public.budget_usage (id, cost_usd, updated_at)
  values (1, amount, now())
  on conflict (id)
  do update set
    cost_usd   = budget_usage.cost_usd + excluded.cost_usd,
    updated_at = now();
end;
$$;

-- RLS: no anon access — all operations via service role key (bypasses RLS)
alter table public.budget_usage enable row level security;
