-- 005_metrics.sql

create table public.app_sessions (
  id               uuid        primary key default gen_random_uuid(),
  client_id        uuid        not null,
  user_id          uuid        null,
  started_at       timestamptz not null default now(),
  ended_at         timestamptz null,
  duration_seconds int         null
);
create index app_sessions_client_id_idx  on public.app_sessions (client_id);
create index app_sessions_started_at_idx on public.app_sessions (started_at);

create table public.suggestion_interactions (
  id           uuid        primary key default gen_random_uuid(),
  client_id    uuid        not null,
  user_id      uuid        null,
  session_id   uuid        null references public.app_sessions(id) on delete set null,
  interaction  text        not null check (interaction in (
    'copied','rationale_opened','follow_up_sent',
    'quick_action_shorter','quick_action_alternatives')),
  source_tier  text        null check (source_tier in ('library','adapted','ai','ai_low')),
  char_count   int         null,
  created_at   timestamptz not null default now()
);
create index suggestion_interactions_client_id_idx  on public.suggestion_interactions (client_id);
create index suggestion_interactions_interaction_idx on public.suggestion_interactions (interaction);
create index suggestion_interactions_created_at_idx  on public.suggestion_interactions (created_at);

create table public.api_calls (
  id            uuid          primary key default gen_random_uuid(),
  client_id     uuid          not null,
  user_id       uuid          null,
  session_id    uuid          null references public.app_sessions(id) on delete set null,
  model         text          null,
  status        text          not null check (status in ('success','error','timeout')),
  error_code    text          null,
  duration_ms   int           null,
  input_tokens  int           null,
  output_tokens int           null,
  cost_usd      numeric(10,6) null,
  created_at    timestamptz   not null default now()
);
create index api_calls_status_idx     on public.api_calls (status);
create index api_calls_client_id_idx  on public.api_calls (client_id);
create index api_calls_created_at_idx on public.api_calls (created_at);

create table public.events (
  id         uuid        primary key default gen_random_uuid(),
  client_id  uuid        not null,
  user_id    uuid        null,
  session_id uuid        null references public.app_sessions(id) on delete set null,
  event      text        not null,
  properties jsonb       null,
  created_at timestamptz not null default now()
);
create index events_client_id_idx  on public.events (client_id);
create index events_event_idx      on public.events (event);
create index events_created_at_idx on public.events (created_at);

-- RLS
alter table public.app_sessions           enable row level security;
alter table public.suggestion_interactions enable row level security;
alter table public.api_calls              enable row level security;
alter table public.events                 enable row level security;

-- app_sessions: anon can insert (client creates its own session) and update (endSession patches it)
create policy "app_sessions_insert" on public.app_sessions for insert with check (true);
create policy "app_sessions_update" on public.app_sessions for update using (true);
create policy "app_sessions_select" on public.app_sessions for select using (true);

-- suggestion_interactions: anon can insert
create policy "suggestion_interactions_insert" on public.suggestion_interactions for insert with check (true);

-- api_calls: NO anon insert — server uses service role key which bypasses RLS entirely
-- No select policy for anon — dashboard reads via service role

-- events: anon can insert
create policy "events_insert" on public.events for insert with check (true);
