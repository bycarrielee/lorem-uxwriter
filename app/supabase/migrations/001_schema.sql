-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Foundations
create type foundation_type as enum ('voice', 'style', 'accessibility', 'localisation', 'terminology');
create type content_scope as enum ('global', 'product');

create table public.foundations (
  id uuid primary key default uuid_generate_v4(),
  type foundation_type not null,
  scope content_scope not null,
  product_id uuid references public.products(id) on delete cascade,
  content text not null,
  updated_at timestamptz not null default now(),
  constraint foundations_global_no_product check (
    (scope = 'global' and product_id is null) or
    (scope = 'product' and product_id is not null)
  )
);

-- Patterns
create type element_type as enum ('buttons', 'errors', 'forms', 'alerts', 'modals', 'content', 'states', 'links', 'push-notifications', 'release-notes');

create table public.patterns (
  id uuid primary key default uuid_generate_v4(),
  element_type element_type not null,
  scope content_scope not null,
  product_id uuid references public.products(id) on delete cascade,
  content text not null,
  updated_at timestamptz not null default now(),
  constraint patterns_global_no_product check (
    (scope = 'global' and product_id is null) or
    (scope = 'product' and product_id is not null)
  )
);

-- Copy entries
create type copy_tone as enum ('neutral', 'friendly', 'serious', 'empathetic', 'urgent', 'positive', 'cautionary');
create type journey_stage as enum ('onboarding', 'task-completion', 'error-recovery', 'success', 'decision-point', 'information');
create type copy_status as enum ('active', 'deprecated', 'draft', 'review');
create type source_type as enum ('library_match', 'adapted', 'ai_generated', 'ai_generated_low_confidence');

create table public.copy_entries (
  id uuid primary key default uuid_generate_v4(),
  element_type element_type not null,
  scope content_scope not null,
  product_id uuid references public.products(id) on delete cascade,
  copy jsonb not null,
  context text not null,
  rationale text not null,
  tags text[] not null default '{}',
  tone copy_tone,
  journey_stage journey_stage,
  status copy_status not null default 'active',
  usage_examples text[] not null default '{}',
  alternatives jsonb not null default '[]',
  character_count integer,
  accessibility_notes text,
  validated_by_research boolean not null default false,
  added_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint copy_entries_global_no_product check (
    (scope = 'global' and product_id is null) or
    (scope = 'product' and product_id is not null)
  )
);

-- Sessions (no user_id — app is open access)
create table public.sessions (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  name text,
  created_at timestamptz not null default now()
);

-- Session messages
create table public.session_messages (
  id uuid primary key default uuid_generate_v4(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  role text not null check (role in ('user', 'assistant')),
  content jsonb not null,
  source_type source_type,
  copy_entry_ids uuid[] not null default '{}',
  created_at timestamptz not null default now()
);

-- Budget usage (single row, tracks cumulative Anthropic API spend)
create table public.budget_usage (
  id int primary key,
  cost_usd numeric(10,6) not null default 0,
  updated_at timestamptz not null default now()
);

insert into public.budget_usage (id, cost_usd) values (1, 0);
