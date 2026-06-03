# Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **⚠️ Amendment (2026-05-26): No authentication.** The app is open — anyone with the URL can use it. No login, no signup, no `.gov.sg` restriction.
> - **Skip entirely:** Task 5 (auth helpers), Task 6 (middleware), Task 7 (auth callback), Task 8 (signup page), Task 9 (login page)
> - **Task 3 (schema):** Remove `profiles` and `user_product_access` tables. Remove `user_id` from `sessions`.
> - **Task 4 (RLS):** Replace auth-based policies with public read on `products`, `foundations`, `patterns`, `copy_entries`. Public insert/select on `sessions` and `session_messages`. Keep `budget_usage` with public select and the SECURITY DEFINER RPC.
> - **Task 10 (app shell):** Remove sign-out button and user email display. No auth check in layout.
> - **Task 12 (tests):** Remove `auth.test.ts` — no auth helpers to test.
> - **Project location:** `lorem-webapp/app/` (subfolder inside the existing prototype directory).

**Goal:** Stand up a Next.js + Supabase project with database schema and open access — ready for the agent service and UI to be built on top.

  

**Architecture:** Next.js 14 App Router with TypeScript. Supabase handles PostgreSQL, Auth, and row-level security. All protected routes are guarded by a Next.js middleware that checks the Supabase session. Auth callback creates a `profiles` row for every new user.

  

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Supabase JS v2, Vitest

  

---

  

## File structure

  

```

/

├── src/

│ ├── app/

│ │ ├── (auth)/

│ │ │ ├── login/

│ │ │ │ └── page.tsx ← login form

│ │ │ ├── signup/

│ │ │ │ └── page.tsx ← signup form with .gov.sg validation

│ │ │ └── layout.tsx ← unauthenticated shell

│ │ ├── (app)/

│ │ │ ├── editor/

│ │ │ │ └── page.tsx ← shell; agent functionality added in Plan 2

│ │ │ ├── library/

│ │ │ │ └── page.tsx ← shell; search and browse added in Plan 4

│ │ │ ├── admin/

│ │ │ │ └── page.tsx ← shell; full panel added in Plan 3

│ │ │ └── layout.tsx ← authenticated app shell + sidebar

│ │ ├── auth/

│ │ │ └── callback/

│ │ │ └── route.ts ← Supabase auth callback + profile creation

│ │ └── layout.tsx ← root layout

│ ├── lib/

│ │ ├── supabase/

│ │ │ ├── client.ts ← browser Supabase client (singleton)

│ │ │ ├── server.ts ← server Supabase client (per-request)

│ │ │ └── types.ts ← generated DB types

│ │ └── auth.ts ← domain validation, role helpers

│ └── middleware.ts ← route protection

├── supabase/

│ ├── migrations/

│ │ ├── 001_schema.sql ← all tables

│ │ └── 002_rls.sql ← all RLS policies

│ └── seed.sql ← products + global foundations + global patterns

├── tests/

│ └── lib/

│ └── auth.test.ts ← unit tests for domain validation + role helpers

├── .env.local.example

├── vitest.config.ts

└── package.json

```

  

---

  

## Task 1: Initialise project

  

**Files:**

- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `vitest.config.ts`, `src/app/layout.tsx`

  

- [ ] **Step 1: Bootstrap Next.js project**

  

```bash

npx create-next-app@latest . \

--typescript \

--tailwind \

--eslint \

--app \

--src-dir \

--no-import-alias

```

  

- [ ] **Step 2: Install dependencies**

  

```bash

npm install @supabase/supabase-js @supabase/ssr

npm install -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/jest-dom

```

  

- [ ] **Step 3: Configure Vitest**

  

Create `vitest.config.ts`:

```typescript

import { defineConfig } from 'vitest/config'

import react from '@vitejs/plugin-react'

  

export default defineConfig({

plugins: [react()],

test: {

environment: 'jsdom',

setupFiles: ['./tests/setup.ts'],

globals: true,

},

})

```

  

Create `tests/setup.ts`:

```typescript

import '@testing-library/jest-dom'

```

  

- [ ] **Step 4: Create environment variable template**

  

Create `.env.local.example`:

```

NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co

NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

ANTHROPIC_API_KEY=your-anthropic-key

```

  

Copy to `.env.local` and add real values from your Supabase project dashboard.

  

- [ ] **Step 5: Add `.env.local` to `.gitignore`**

  

```bash

echo ".env.local" >> .gitignore

```

  

- [ ] **Step 6: Verify project starts**

  

```bash

npm run dev

```

  

Expected: Next.js default page at `http://localhost:3000`

  

- [ ] **Step 7: Commit**

  

```bash

git add .

git commit -m "feat: initialise Next.js project with Supabase and Vitest"

```

  

---

  

## Task 2: Supabase clients

  

**Files:**

- Create: `src/lib/supabase/client.ts`

- Create: `src/lib/supabase/server.ts`

  

- [ ] **Step 1: Create browser client**

  

Create `src/lib/supabase/client.ts`:

```typescript

import { createBrowserClient } from '@supabase/ssr'

  

export function createClient() {

return createBrowserClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

)

}

```

  

- [ ] **Step 2: Create server client**

  

Create `src/lib/supabase/server.ts`:

```typescript

import { createServerClient } from '@supabase/ssr'

import { cookies } from 'next/headers'

  

export async function createClient() {

const cookieStore = await cookies()

  

return createServerClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

{

cookies: {

getAll() {

return cookieStore.getAll()

},

setAll(cookiesToSet) {

try {

cookiesToSet.forEach(({ name, value, options }) =>

cookieStore.set(name, value, options)

)

} catch {}

},

},

}

)

}

```

  

- [ ] **Step 3: Commit**

  

```bash

git add src/lib/supabase/

git commit -m "feat: add Supabase browser and server clients"

```

  

---

  

## Task 3: Database schema

  

**Files:**

- Create: `supabase/migrations/001_schema.sql`

  

- [ ] **Step 1: Install Supabase CLI**

  

```bash

npm install -D supabase

npx supabase init

```

  

- [ ] **Step 2: Write schema migration**

  

Create `supabase/migrations/001_schema.sql`:

```sql

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

create type element_type as enum ('buttons', 'errors', 'forms', 'alerts', 'modals', 'navigation', 'content', 'states');

  

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

  

-- Profiles (extends auth.users)

create type user_role as enum ('practitioner', 'admin');

  

create table public.profiles (

id uuid primary key references auth.users(id) on delete cascade,

display_name text,

agency text,

role user_role not null default 'practitioner',

access_all_products boolean not null default true,

created_at timestamptz not null default now()

);

  

-- Product access restrictions

create table public.user_product_access (

user_id uuid not null references public.profiles(id) on delete cascade,

product_id uuid not null references public.products(id) on delete cascade,

primary key (user_id, product_id)

);

  

-- Sessions

create table public.sessions (

id uuid primary key default uuid_generate_v4(),

user_id uuid not null references public.profiles(id) on delete cascade,

product_id uuid references public.products(id) on delete set null,

is_shared boolean not null default false,

share_token uuid unique,

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

```

  

- [ ] **Step 3: Apply migration to local Supabase (optional local dev)**

  

```bash

npx supabase start

npx supabase db push

```

  

Or apply directly in Supabase dashboard SQL editor if using hosted Supabase.

  

- [ ] **Step 4: Generate TypeScript types**

  

```bash

npx supabase gen types typescript --project-id your-project-id > src/lib/supabase/types.ts

```

  

Replace `your-project-id` with your Supabase project ID from the dashboard URL.

  

- [ ] **Step 5: Commit**

  

```bash

git add supabase/ src/lib/supabase/types.ts

git commit -m "feat: add database schema migration and generated types"

```

  

---

  

## Task 4: Row-level security policies

  

**Files:**

- Create: `supabase/migrations/002_rls.sql`

  

- [ ] **Step 1: Write RLS policies**

  

Create `supabase/migrations/002_rls.sql`:

```sql

-- Enable RLS on all tables

alter table public.products enable row level security;

alter table public.foundations enable row level security;

alter table public.patterns enable row level security;

alter table public.copy_entries enable row level security;

alter table public.profiles enable row level security;

alter table public.user_product_access enable row level security;

alter table public.sessions enable row level security;

alter table public.session_messages enable row level security;

  

-- Helper: is current user an admin?

create or replace function public.is_admin()

returns boolean as $$

select exists (

select 1 from public.profiles

where id = auth.uid() and role = 'admin'

);

$$ language sql security definer stable;

  

-- Helper: can current user access a given product?

create or replace function public.can_access_product(p_product_id uuid)

returns boolean as $$

select exists (

select 1 from public.profiles

where id = auth.uid()

and (

access_all_products = true

or exists (

select 1 from public.user_product_access

where user_id = auth.uid() and product_id = p_product_id

)

)

);

$$ language sql security definer stable;

  

-- Products: anyone authenticated can read active products they can access

create policy "products_select" on public.products

for select using (

auth.uid() is not null

and is_active = true

and public.can_access_product(id)

);

  

create policy "products_admin_all" on public.products

for all using (public.is_admin());

  

-- Foundations: authenticated users can read, admins can write

create policy "foundations_select" on public.foundations

for select using (

auth.uid() is not null

and (scope = 'global' or public.can_access_product(product_id))

);

  

create policy "foundations_admin_all" on public.foundations

for all using (public.is_admin());

  

-- Patterns: same as foundations

create policy "patterns_select" on public.patterns

for select using (

auth.uid() is not null

and (scope = 'global' or public.can_access_product(product_id))

);

  

create policy "patterns_admin_all" on public.patterns

for all using (public.is_admin());

  

-- Copy entries: active entries readable by authenticated users with product access

create policy "copy_entries_select" on public.copy_entries

for select using (

auth.uid() is not null

and status = 'active'

and (scope = 'global' or public.can_access_product(product_id))

);

  

create policy "copy_entries_admin_all" on public.copy_entries

for all using (public.is_admin());

  

-- Profiles: users can read and update their own profile; admins can read all

create policy "profiles_select_own" on public.profiles

for select using (auth.uid() = id or public.is_admin());

  

create policy "profiles_update_own" on public.profiles

for update using (auth.uid() = id)

with check (

-- users cannot promote themselves to admin

role = (select role from public.profiles where id = auth.uid())

);

  

create policy "profiles_admin_all" on public.profiles

for all using (public.is_admin());

  

-- User product access: users see their own restrictions; admins see all

create policy "user_product_access_select" on public.user_product_access

for select using (user_id = auth.uid() or public.is_admin());

  

create policy "user_product_access_admin_all" on public.user_product_access

for all using (public.is_admin());

  

-- Sessions: users see their own sessions + shared sessions; admins see all

create policy "sessions_select" on public.sessions

for select using (

user_id = auth.uid()

or is_shared = true

or public.is_admin()

);

  

create policy "sessions_insert_own" on public.sessions

for insert with check (user_id = auth.uid());

  

create policy "sessions_update_own" on public.sessions

for update using (user_id = auth.uid());

  

create policy "sessions_admin_all" on public.sessions

for all using (public.is_admin());

  

-- Session messages: accessible if the parent session is accessible

create policy "session_messages_select" on public.session_messages

for select using (

exists (

select 1 from public.sessions s

where s.id = session_id

and (s.user_id = auth.uid() or s.is_shared = true or public.is_admin())

)

);

  

create policy "session_messages_insert" on public.session_messages

for insert with check (

exists (

select 1 from public.sessions s

where s.id = session_id and s.user_id = auth.uid()

)

);

```

  

- [ ] **Step 2: Apply to Supabase**

  

Apply in Supabase dashboard SQL editor or via:

```bash

npx supabase db push

```

  

- [ ] **Step 3: Commit**

  

```bash

git add supabase/migrations/002_rls.sql

git commit -m "feat: add row-level security policies"

```

  

---

  

## Task 5: Auth helper and domain validation

  

**Files:**

- Create: `src/lib/auth.ts`

- Create: `tests/lib/auth.test.ts`

  

- [ ] **Step 1: Write failing tests**

  

Create `tests/lib/auth.test.ts`:

```typescript

import { describe, it, expect } from 'vitest'

import { isAllowedEmail, isGovSgEmail, getUserRole } from '@/lib/auth'

  

describe('isGovSgEmail', () => {

it('returns true for .gov.sg email', () => {

expect(isGovSgEmail('user@agency.gov.sg')).toBe(true)

})

  

it('returns true for direct gov.sg email', () => {

expect(isGovSgEmail('user@gov.sg')).toBe(true)

})

  

it('returns false for non-gov.sg email', () => {

expect(isGovSgEmail('user@gmail.com')).toBe(false)

})

  

it('returns false for spoofed domain', () => {

expect(isGovSgEmail('user@gov.sg.evil.com')).toBe(false)

})

  

it('is case-insensitive', () => {

expect(isGovSgEmail('User@Agency.GOV.SG')).toBe(true)

})

})

  

describe('isAllowedEmail', () => {

it('allows .gov.sg emails', () => {

expect(isAllowedEmail('user@agency.gov.sg')).toBe(true)

})

  

it('blocks non-.gov.sg emails from self-registering', () => {

expect(isAllowedEmail('contractor@gmail.com')).toBe(false)

})

})

  

describe('getUserRole', () => {

it('returns role from profile', () => {

expect(getUserRole({ role: 'admin' } as any)).toBe('admin')

})

  

it('returns practitioner as default when no profile', () => {

expect(getUserRole(null)).toBe('practitioner')

})

})

```

  

- [ ] **Step 2: Run tests to verify they fail**

  

```bash

npx vitest run tests/lib/auth.test.ts

```

  

Expected: FAIL — `Cannot find module '@/lib/auth'`

  

- [ ] **Step 3: Implement auth helpers**

  

Create `src/lib/auth.ts`:

```typescript

import type { Database } from './supabase/types'

  

type Profile = Database['public']['Tables']['profiles']['Row']

type UserRole = Database['public']['Enums']['user_role']

  

export function isGovSgEmail(email: string): boolean {

const lower = email.toLowerCase()

return lower.endsWith('.gov.sg') || lower.endsWith('@gov.sg')

}

  

export function isAllowedEmail(email: string): boolean {

return isGovSgEmail(email)

}

  

export function getUserRole(profile: Profile | null): UserRole {

return profile?.role ?? 'practitioner'

}

  

export function isAdmin(profile: Profile | null): boolean {

return profile?.role === 'admin'

}

  

export function canAccessProduct(

profile: Profile | null,

productId: string,

accessList: string[]

): boolean {

if (!profile) return false

if (profile.access_all_products) return true

return accessList.includes(productId)

}

```

  

- [ ] **Step 4: Run tests to verify they pass**

  

```bash

npx vitest run tests/lib/auth.test.ts

```

  

Expected: PASS — 7 tests passing

  

- [ ] **Step 5: Commit**

  

```bash

git add src/lib/auth.ts tests/lib/auth.test.ts

git commit -m "feat: add auth helpers and domain validation"

```

  

---

  

## Task 6: Route protection middleware

  

**Files:**

- Create: `src/middleware.ts`

  

- [ ] **Step 1: Write middleware**

  

Create `src/middleware.ts`:

```typescript

import { createServerClient } from '@supabase/ssr'

import { NextResponse, type NextRequest } from 'next/server'

  

export async function middleware(request: NextRequest) {

let supabaseResponse = NextResponse.next({ request })

  

const supabase = createServerClient(

process.env.NEXT_PUBLIC_SUPABASE_URL!,

process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,

{

cookies: {

getAll() {

return request.cookies.getAll()

},

setAll(cookiesToSet) {

cookiesToSet.forEach(({ name, value }) =>

request.cookies.set(name, value)

)

supabaseResponse = NextResponse.next({ request })

cookiesToSet.forEach(({ name, value, options }) =>

supabaseResponse.cookies.set(name, value, options)

)

},

},

}

)

  

const { data: { user } } = await supabase.auth.getUser()

  

const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||

request.nextUrl.pathname.startsWith('/signup')

  

// Redirect unauthenticated users to login

if (!user && !isAuthRoute) {

const url = request.nextUrl.clone()

url.pathname = '/login'

return NextResponse.redirect(url)

}

  

// Redirect authenticated users away from auth pages

if (user && isAuthRoute) {

const url = request.nextUrl.clone()

url.pathname = '/editor'

return NextResponse.redirect(url)

}

  

return supabaseResponse

}

  

export const config = {

matcher: [

'/((?!_next/static|_next/image|favicon.ico|auth/callback).*)',

],

}

```

  

- [ ] **Step 2: Verify redirect works**

  

Start dev server with `npm run dev`. Visit `http://localhost:3000` — should redirect to `/login`. (Login page doesn't exist yet, you'll get a 404. That's expected at this stage.)

  

- [ ] **Step 3: Commit**

  

```bash

git add src/middleware.ts

git commit -m "feat: add route protection middleware"

```

  

---

  

## Task 7: Auth callback route and profile creation

  

**Files:**

- Create: `src/app/auth/callback/route.ts`

  

- [ ] **Step 1: Write callback route**

  

Create `src/app/auth/callback/route.ts`:

```typescript

import { createClient } from '@/lib/supabase/server'

import { NextResponse } from 'next/server'

  

export async function GET(request: Request) {

const { searchParams, origin } = new URL(request.url)

const code = searchParams.get('code')

const next = searchParams.get('next') ?? '/editor'

  

if (code) {

const supabase = await createClient()

const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  

if (!error && data.user) {

// Create profile if it doesn't exist

await supabase

.from('profiles')

.upsert(

{

id: data.user.id,

display_name: data.user.user_metadata?.full_name ?? null,

agency: null,

role: 'practitioner',

access_all_products: true,

},

{ onConflict: 'id', ignoreDuplicates: true }

)

  

return NextResponse.redirect(`${origin}${next}`)

}

}

  

return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)

}

```

  

- [ ] **Step 2: Commit**

  

```bash

git add src/app/auth/callback/route.ts

git commit -m "feat: add auth callback route with profile creation"

```

  

---

  

## Task 8: Signup page

  

**Files:**

- Create: `src/app/(auth)/signup/page.tsx`

- Create: `src/app/(auth)/layout.tsx`

  

- [ ] **Step 1: Create auth layout**

  

Create `src/app/(auth)/layout.tsx`:

```typescript

export default function AuthLayout({

children,

}: {

children: React.ReactNode

}) {

return (

<main className="min-h-screen flex items-center justify-center bg-gray-50">

<div className="w-full max-w-md">

{children}

</div>

</main>

)

}

```

  

- [ ] **Step 2: Create signup page**

  

Create `src/app/(auth)/signup/page.tsx`:

```typescript

'use client'

  

import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { isAllowedEmail } from '@/lib/auth'

import Link from 'next/link'

  

export default function SignupPage() {

const [email, setEmail] = useState('')

const [password, setPassword] = useState('')

const [displayName, setDisplayName] = useState('')

const [error, setError] = useState<string | null>(null)

const [success, setSuccess] = useState(false)

const [loading, setLoading] = useState(false)

  

async function handleSignup(e: React.FormEvent) {

e.preventDefault()

setError(null)

  

if (!isAllowedEmail(email)) {

setError('Sign-up requires a .gov.sg email address. If you need access with another email, ask an admin to invite you.')

return

}

  

setLoading(true)

const supabase = createClient()

  

const { error: signUpError } = await supabase.auth.signUp({

email,

password,

options: {

data: { full_name: displayName },

emailRedirectTo: `${window.location.origin}/auth/callback`,

},

})

  

setLoading(false)

  

if (signUpError) {

setError(signUpError.message)

return

}

  

setSuccess(true)

}

  

if (success) {

return (

<div className="bg-white rounded-xl border border-gray-200 p-8 text-center">

<h1 className="text-xl font-semibold text-gray-900 mb-2">Check your email</h1>

<p className="text-gray-500 text-sm">

We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account.

</p>

</div>

)

}

  

return (

<div className="bg-white rounded-xl border border-gray-200 p-8">

<h1 className="text-xl font-semibold text-gray-900 mb-1">Create account</h1>

<p className="text-gray-500 text-sm mb-6">Requires a .gov.sg email address</p>

  

<form onSubmit={handleSignup} className="space-y-4">

<div>

<label className="block text-sm font-medium text-gray-700 mb-1">

Name

</label>

<input

type="text"

value={displayName}

onChange={e => setDisplayName(e.target.value)}

className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

placeholder="Your name"

required

/>

</div>

  

<div>

<label className="block text-sm font-medium text-gray-700 mb-1">

Email

</label>

<input

type="email"

value={email}

onChange={e => setEmail(e.target.value)}

className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

placeholder="you@agency.gov.sg"

required

/>

</div>

  

<div>

<label className="block text-sm font-medium text-gray-700 mb-1">

Password

</label>

<input

type="password"

value={password}

onChange={e => setPassword(e.target.value)}

className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

placeholder="At least 8 characters"

minLength={8}

required

/>

</div>

  

{error && (

<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>

)}

  

<button

type="submit"

disabled={loading}

className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"

>

{loading ? 'Creating account...' : 'Create account'}

</button>

</form>

  

<p className="text-sm text-gray-500 text-center mt-4">

Already have an account?{' '}

<Link href="/login" className="text-blue-600 hover:underline">Log in</Link>

</p>

</div>

)

}

```

  

- [ ] **Step 3: Verify signup works end-to-end**

  

```bash

npm run dev

```

  

1. Visit `http://localhost:3000/signup`

2. Try signing up with `test@gmail.com` — expect error: "Sign-up requires a .gov.sg email address"

3. Sign up with a real `.gov.sg` email — expect confirmation screen

4. Check your inbox for the confirmation link

  

- [ ] **Step 4: Commit**

  

```bash

git add src/app/(auth)/

git commit -m "feat: add signup page with .gov.sg email validation"

```

  

---

  

## Task 9: Login page

  

**Files:**

- Create: `src/app/(auth)/login/page.tsx`

  

- [ ] **Step 1: Create login page**

  

Create `src/app/(auth)/login/page.tsx`:

```typescript

'use client'

  

import { useState } from 'react'

import { createClient } from '@/lib/supabase/client'

import { useRouter } from 'next/navigation'

import Link from 'next/link'

  

export default function LoginPage() {

const [email, setEmail] = useState('')

const [password, setPassword] = useState('')

const [error, setError] = useState<string | null>(null)

const [loading, setLoading] = useState(false)

const router = useRouter()

  

async function handleLogin(e: React.FormEvent) {

e.preventDefault()

setError(null)

setLoading(true)

  

const supabase = createClient()

const { error: signInError } = await supabase.auth.signInWithPassword({

email,

password,

})

  

setLoading(false)

  

if (signInError) {

setError('Incorrect email or password.')

return

}

  

router.push('/editor')

router.refresh()

}

  

return (

<div className="bg-white rounded-xl border border-gray-200 p-8">

<h1 className="text-xl font-semibold text-gray-900 mb-1">Log in</h1>

<p className="text-gray-500 text-sm mb-6">AI UX Writer</p>

  

<form onSubmit={handleLogin} className="space-y-4">

<div>

<label className="block text-sm font-medium text-gray-700 mb-1">

Email

</label>

<input

type="email"

value={email}

onChange={e => setEmail(e.target.value)}

className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

placeholder="you@agency.gov.sg"

required

/>

</div>

  

<div>

<label className="block text-sm font-medium text-gray-700 mb-1">

Password

</label>

<input

type="password"

value={password}

onChange={e => setPassword(e.target.value)}

className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"

required

/>

</div>

  

{error && (

<p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>

)}

  

<button

type="submit"

disabled={loading}

className="w-full bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-700 disabled:opacity-50"

>

{loading ? 'Logging in...' : 'Log in'}

</button>

</form>

  

<p className="text-sm text-gray-500 text-center mt-4">

No account?{' '}

<Link href="/signup" className="text-blue-600 hover:underline">Sign up</Link>

</p>

</div>

)

}

```

  

- [ ] **Step 2: Verify login works**

  

```bash

npm run dev

```

  

1. Visit `http://localhost:3000/login`

2. Log in with the account you confirmed in Task 8

3. Should redirect to `/editor` (404 is fine — page not built yet)

4. Revisit `/login` — should redirect to `/editor`

  

- [ ] **Step 3: Commit**

  

```bash

git add src/app/(auth)/login/page.tsx

git commit -m "feat: add login page"

```

  

---

  

## Task 10: App shell with sidebar

  

**Files:**

- Create: `src/app/(app)/layout.tsx`

- Create: `src/app/(app)/editor/page.tsx`

- Create: `src/app/(app)/library/page.tsx`

- Create: `src/app/(app)/admin/page.tsx`

  

- [ ] **Step 1: Create app layout with sidebar**

  

Create `src/app/(app)/layout.tsx`:

```typescript

import { createClient } from '@/lib/supabase/server'

import { redirect } from 'next/navigation'

import { isAdmin } from '@/lib/auth'

import Link from 'next/link'

  

export default async function AppLayout({

children,

}: {

children: React.ReactNode

}) {

const supabase = await createClient()

const { data: { user } } = await supabase.auth.getUser()

  

if (!user) redirect('/login')

  

const { data: profile } = await supabase

.from('profiles')

.select('*')

.eq('id', user.id)

.single()

  

async function signOut() {

'use server'

const supabase = await createClient()

await supabase.auth.signOut()

redirect('/login')

}

  

return (

<div className="flex min-h-screen bg-gray-50">

{/* Sidebar */}

<aside className="w-56 bg-white border-r border-gray-200 flex flex-col">

<div className="flex items-center gap-2.5 px-4 py-4 border-b border-gray-200">

<div className="w-7 h-7 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">

<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>

</div>

<div>

<div className="text-gray-900 font-semibold text-sm leading-tight">Lorem</div>

<div className="text-gray-400 text-xs">AI UX Writer</div>

</div>

</div>

  

<nav className="flex-1 p-3 space-y-1">

<Link

href="/editor"

className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"

>

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>

Editor

</Link>

<Link

href="/library"

className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"

>

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>

Library

</Link>

{isAdmin(profile) && (

<Link

href="/admin"

className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100"

>

<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>

Admin

</Link>

)}

</nav>

  

<div className="p-3 border-t border-gray-100">

<div className="px-3 py-1 text-xs text-gray-400 truncate">

{user.email}

</div>

<form action={signOut}>

<button

type="submit"

className="w-full text-left px-3 py-2 text-sm text-gray-500 rounded-lg hover:bg-gray-100"

>

Sign out

</button>

</form>

</div>

</aside>

  

{/* Main content */}

<main className="flex-1 overflow-auto">

{children}

</main>

</div>

)

}

```

  

- [ ] **Step 2: Create page shells**

  

Create `src/app/(app)/editor/page.tsx`:

```typescript

export default function EditorPage() {

return (

<div className="flex h-full">

{/* Left panel */}

<div className="w-96 flex-shrink-0 border-r border-gray-200 flex flex-col bg-gray-50">

<div className="px-5 py-4 border-b border-gray-200">

<h1 className="text-sm font-semibold text-gray-900">New session</h1>

</div>

<div className="flex-1 flex items-center justify-center p-6">

<p className="text-sm text-gray-400 text-center">

Select a product and element type, then describe what you need.

</p>

</div>

</div>

  

{/* Right panel */}

<div className="flex-1 flex items-center justify-center p-8">

<div className="text-center max-w-xs">

<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">

<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>

</div>

<p className="text-sm text-gray-500 font-medium mb-1">Suggestions appear here</p>

<p className="text-xs text-gray-400 leading-relaxed">

The agent checks the approved library first, then applies writing guidelines.

</p>

</div>

</div>

</div>

)

}

```

  

Create `src/app/(app)/library/page.tsx`:

```typescript

export default function LibraryPage() {

return (

<div className="flex flex-col h-full">

<div className="border-b border-gray-200 px-6 py-4">

<h1 className="text-base font-semibold text-gray-900">Copy library</h1>

<p className="text-xs text-gray-500 mt-0.5">Approved copy strings across all products</p>

</div>

<div className="flex-1 flex items-center justify-center">

<div className="text-center max-w-xs">

<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">

<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>

</div>

<p className="text-sm text-gray-500 font-medium mb-1">No entries yet</p>

<p className="text-xs text-gray-400 leading-relaxed">

Library entries added by admins will appear here.

</p>

</div>

</div>

</div>

)

}

```

  

Create `src/app/(app)/admin/page.tsx`:

```typescript

export default function AdminPage() {

return (

<div className="flex flex-col h-full">

<div className="border-b border-gray-200 px-6 py-4">

<h1 className="text-base font-semibold text-gray-900">Admin</h1>

</div>

<div className="flex-1 flex items-center justify-center">

<div className="text-center max-w-xs">

<div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-3">

<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>

</div>

<p className="text-sm text-gray-500 font-medium mb-1">Admin panel</p>

<p className="text-xs text-gray-400 leading-relaxed">

Manage the copy library, writing guidelines, products, and users.

</p>

</div>

</div>

</div>

)

}

```

  

- [ ] **Step 3: Verify full auth flow end-to-end**

  

```bash

npm run dev

```

  

1. Visit `http://localhost:3000` — redirects to `/login` ✓

2. Log in — redirects to `/editor` with sidebar visible ✓

3. Sidebar shows Editor + Library links ✓

4. Admin link hidden for non-admin users ✓

5. Sign out returns to `/login` ✓

  

- [ ] **Step 4: Commit**

  

```bash

git add src/app/(app)/

git commit -m "feat: add app shell with sidebar and placeholder pages"

```

  

---

  

## Task 11: Seed data

  

**Files:**

- Create: `supabase/seed.sql`

  

- [ ] **Step 1: Write seed data**

  

Create `supabase/seed.sql`:

```sql

-- Products

insert into public.products (name, slug, description) values

('MyLegacy', 'mylegacy', 'End-of-life planning service'),

('SupportGoWhere', 'sgw', 'Social support finder for citizens');

  

-- Global foundations (voice)

insert into public.foundations (type, scope, content) values

('voice', 'global', '# Voice guidelines

  

## Voice attributes

  

1. **Clear, not bureaucratic** — Use conversational plain language. No jargon. Write like you speak to a person, not a committee.

2. **Helpful, not condescending** — Be supportive without over-explaining. Trust users.

3. **Direct but empathetic** — Be clear about rules and requirements, but acknowledge when something is difficult.

4. **Transparent, not evasive** — Be upfront about requirements, timelines, and decisions.

  

## Tone by context

  

- **Success:** Confirming, brief. "Your application has been submitted."

- **Neutral:** Clear, direct. "Select a date to continue."

- **Guidance:** Helpful, specific. "Your NRIC number is on the front of your card."

- **Warning:** Clear, no panic. "Your session will close in 2 minutes."

- **Error:** Specific, solution-focused. "Enter a valid Singapore phone number (e.g. 9123 4567)."

- **Rejection:** Direct, factual, actionable. "You do not meet the income criteria. You may appeal within 30 days."

- **Destructive action:** Serious, precise. "This will permanently delete your draft. You cannot undo this."

  

## Writing principles

  

- Be concise — shorter is better, one idea per sentence

- Be specific — not vague or generic

- Be positive — focus on what users can do, not what they cannot

- Be direct — get to the point immediately');

  

-- Global foundations (accessibility)

insert into public.foundations (type, scope, content) values

('accessibility', 'global', '# Accessibility guidelines

  

## Plain language (WCAG 3.1.5)

  

- Flesch-Kincaid reading level ≤ 8

- Sentences ≤ 15 words

- Prefer common words over technical terms

- Define acronyms on first use

  

## Button and link text

  

- Describe the action or destination — never "Click here" or "Read more"

- Text must make sense out of context (screen reader users navigate by links)

- Button: verb phrase. "Download report", not "Report"

  

## Form labels

  

- Every input must have a visible label

- Error messages must identify the field and explain how to fix it

- Do not use placeholder text as a substitute for labels

  

## WCAG 2.1 Level AA

  

- Colour is not the only way to convey meaning

- All content is keyboard-navigable

- Focus indicators are visible');

  

-- Global foundations (style)

insert into public.foundations (type, scope, content) values

('style', 'global', '# Style guide

  

## Capitalisation

- Sentence case by default: "Save and continue", not "Save And Continue"

- Proper nouns and official scheme names use their official capitalisation

  

## Dates

- Format: 19 April 2026 (not 19/04/2026 or Apr 19)

  

## Numbers

- Spell out one to nine; use numerals for 10 and above

- Currency: S$1,234.56

  

## Punctuation

- Oxford comma: "voice, style, and accessibility"

- Curly apostrophes: you''re, it''s

- No ampersands except in official names

  

## Active voice

- Default to active voice: "Submit your application" not "Your application should be submitted"

- Use passive voice only when the actor is unknown or irrelevant

  

## Contractions

- Use common positive contractions: you''re, it''s, we''ve

- Avoid negative contractions in critical contexts: "You are not eligible" not "You aren''t eligible"');

  

-- Global foundations (localisation)

insert into public.foundations (type, scope, content) values

('localisation', 'global', '# Localisation guidelines

  

## Text expansion allowance

  

Leave space for translations to be longer:

- Chinese: text can be ~25% shorter

- Malay: text can be ~15% longer

- Tamil: text can be ~40% longer

  

Design UI to accommodate the longest variant.

  

## Frontloading

  

Put the most important information first — translated text may be truncated in tight spaces.

  

## Avoid

  

- Idioms and puns (do not translate well)

- Culturally specific references

- Embedding UI element labels inside sentences

  

## Icons

  

Always pair icons with text labels. Icon meanings vary across cultures.

  

## Resources

  

Official translations: https://www.translatedterms.gov.sg');

  

-- Global foundations (terminology)

insert into public.foundations (type, scope, content) values

('terminology', 'global', '# Government terminology

  

Always use the official names. These are legal names — incorrect usage is a factual error.

  

## Common agencies

  

- Central Provident Fund Board (CPF Board) — not "CPF" alone or "CPF Board"

- Ministry of Social and Family Development (MSF)

- Ministry of Health (MOH)

- Housing & Development Board (HDB)

- Inland Revenue Authority of Singapore (IRAS)

- Immigration & Checkpoints Authority (ICA)

  

## Common schemes (use exact names)

  

- Baby Bonus Cash Gift — not "Baby Bonus Scheme"

- ComLink+ Progress Package for Debt Clearance — not "ComLink Package"

- Workfare Income Supplement (WIS) — not "Workfare Scheme"

- MediShield Life — not "MediShield" (discontinued)

- Silver Support Scheme

  

## NRIC/FIN

  

- NRIC number — not "IC number" or "identity card number"

- Use "NRIC/FIN" when referring to both Singapore citizens/PRs and foreign nationals');

  

-- Global patterns (buttons)

insert into public.patterns (element_type, scope, content) values

('buttons', 'global', '# Button copy guidelines

  

## Rules

  

1. Start with a verb: "Save", "Submit", "Download", not "Saving", "Submission"

2. Sentence case: "Save and continue", not "Save And Continue"

3. Be specific: "Submit grant application" beats "Submit"

4. Keep it short: 1–4 words for primary actions, up to 6 for complex flows

5. No punctuation at the end

  

## Primary buttons (one per page)

Use for the main forward action. Examples:

- "Continue"

- "Submit application"

- "Create account"

- "Confirm and pay"

  

## Secondary buttons

- "Cancel"

- "Go back"

- "Save draft"

  

## Destructive buttons

Be explicit about consequences:

- "Delete account" not "Remove"

- "Withdraw application" not "Cancel"

  

## Common patterns

- Multi-step form progress: "Save and continue"

- Final submission: "Submit [thing]"

- Notification opt-in: "Get notified"

- File actions: "Download [filetype]", "Upload document"');

  

-- Global patterns (errors)

insert into public.patterns (element_type, scope, content) values

('errors', 'global', '# Error message guidelines

  

## Structure

  

1. **What went wrong** — specific, not generic ("Enter a valid NRIC number", not "Invalid input")

2. **Why** — only if not obvious and genuinely helpful

3. **How to fix** — actionable next step

  

## Rules

  

- Never blame the user: "The date entered is not valid" not "You entered an invalid date"

- Be specific: name the field, name the requirement

- Avoid technical language: no error codes, stack traces, or system messages visible to users

- Use plain language: Flesch-Kincaid ≤ 8

  

## Patterns by error type

  

**Format errors:**

"Enter a valid [field name] (e.g. [example])"

Example: "Enter a valid phone number (e.g. 9123 4567)"

  

**Required field:**

"Enter your [field name]"

Example: "Enter your date of birth"

  

**Out of range:**

"[Field] must be [constraint]"

Example: "Date must be in the past"

  

**System errors:**

"Something went wrong. Try again or contact [support]."

Never expose system details.');

  

-- Global patterns (modals)

insert into public.patterns (element_type, scope, content) values

('modals', 'global', '# Modal copy guidelines

  

## Structure

  

Every modal needs:

1. **Header** — short, describes the situation (not a question unless confirmation modal)

2. **Body** — one clear paragraph, what the user needs to know

3. **Primary action button** — specific verb, what happens next

4. **Secondary action** (optional) — "Cancel" or "Go back"

  

## Rules

  

- Header: 3–6 words, sentence case, no punctuation

- Body: ≤ 2 sentences, plain language

- Primary button: specific ("Delete account", not "OK" or "Confirm")

- Never use "Yes/No" as button labels — they have no meaning out of context

  

## Patterns by type

  

**Confirmation (destructive):**

Header: "Delete [thing]?"

Body: "This cannot be undone."

Primary: "Delete [thing]" (red/destructive styling)

Secondary: "Cancel"

  

**Session timeout:**

Header: "Your session is about to end" (warning) or "Your [form] has been closed" (post-timeout)

Body: Explain what happened and what to do next

Primary: "Continue session" or "Back to [service]"

  

**Information:**

Header: States the situation

Body: What the user needs to know

Primary: "OK" or specific action if there is one');

  

-- Seed one copy entry as an example

insert into public.copy_entries (

element_type, scope, copy, context, rationale, tags, tone, journey_stage, status

) values (

'modals',

'global',

'{"header": "Your form has been closed", "body": "It looks like you''ve left, so we closed the form to protect your privacy.", "primary_button": "Back to service"}',

'Session timeout modal — appears after user has been inactive for 15–30 minutes on a form or authenticated page.',

'Frames timeout as a privacy feature, not a system failure. "It looks like you''ve left" is gentler than "You were inactive". "Back to service" is specific about the destination.',

ARRAY['timeout', 'session', 'inactivity', 'privacy', 'error-recovery'],

'empathetic',

'error-recovery',

'active'

);

```

  

- [ ] **Step 2: Apply seed data**

  

In Supabase dashboard, run the SQL from `supabase/seed.sql` in the SQL editor. Or via CLI:

```bash

npx supabase db reset # applies migrations + seed

```

  

- [ ] **Step 3: Verify seed data in Supabase dashboard**

  

Check Table Editor:

- `products`: 2 rows (MyLegacy, SupportGoWhere) ✓

- `foundations`: 5 rows (voice, accessibility, style, localisation, terminology — all global) ✓

- `patterns`: 3 rows (buttons, errors, modals — all global) ✓

- `copy_entries`: 1 row (inactivity-timeout modal) ✓

  

- [ ] **Step 4: Commit**

  

```bash

git add supabase/seed.sql

git commit -m "feat: add seed data for products, global foundations, patterns, and one copy entry"

```

  

---

  

## Task 12: Run all tests

  

- [ ] **Step 1: Run full test suite**

  

```bash

npx vitest run

```

  

Expected output:

```

✓ tests/lib/auth.test.ts (7 tests)

  

Test Files 1 passed (1)

Tests 7 passed (7)

```

  

- [ ] **Step 2: Final end-to-end check**

  

```bash

npm run dev

```

  

Verify:

1. `http://localhost:3000` → redirects to `/login` ✓

2. `/signup` with `bad@gmail.com` → domain error shown ✓

3. `/signup` with `.gov.sg` email → confirmation email sent ✓

4. Confirm email → redirected to `/editor` ✓

5. `/editor` shows app shell with sidebar ✓

6. Admin link hidden ✓

7. Sign out → returns to `/login` ✓

8. Direct visit to `/editor` when logged out → redirects to `/login` ✓

  

- [ ] **Step 3: Final commit**

  

```bash

git add .

git commit -m "chore: plan 1 complete — foundation, auth, schema, seed data"

```

  

---

  

## Self-review

  

**Spec coverage check:**

  

| Spec section | Covered by |

|---|---|

| Supabase (PostgreSQL) | Task 3 — full schema migration |

| Supabase Auth | Tasks 7, 8, 9 |

| `.gov.sg` self-serve signup | Task 8 — domain validation |

| Admin invite | ⚠️ Not covered — Supabase admin invite API not implemented. Added as note below. |

| `profiles` table + role | Task 3 (schema) + Task 7 (callback creates profile) |

| `user_product_access` | Task 3 (schema) + Task 4 (RLS) |

| Route protection | Task 6 — middleware |

| App shell + sidebar | Task 10 |

| Admin link hidden from practitioners | Task 10 |

| Editor, Library, Admin page shells | Task 10 |

| Seed data (products, foundations, patterns) | Task 11 |

  

**Gap: Admin invite not implemented in this plan.** The Supabase `admin.createUser()` API requires the service role key and must run server-side. This belongs in Plan 3 (Admin panel) alongside the Users & Usage section — add it there.

  

**Placeholder scan:** None found. All steps contain complete code.

  

**Type consistency:** `Profile` type from `Database['public']['Tables']['profiles']['Row']` used consistently across `auth.ts` and `layout.tsx`. `createClient()` return type is consistent between `client.ts` and `server.ts` usages.