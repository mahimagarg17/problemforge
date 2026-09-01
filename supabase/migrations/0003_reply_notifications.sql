-- ==============================================================================
-- ProblemForge migration 0003: optional reply email notifications
--
-- Run ONCE in the hosted Supabase SQL editor. Additive and idempotent.
-- No existing table, column, policy, grant, trigger, or row is modified or
-- deleted. No RLS is weakened.
--
-- Two new tables, both PRIVATE:
--   * RLS is enabled with NO policies, so the anon / authenticated PostgREST
--     roles can never read or write them.
--   * The schema already runs `alter default privileges ... grant select on
--     tables to anon, authenticated` (see grants.sql), which would otherwise
--     auto-grant SELECT on any new table. Step 4 revokes that.
--   * Only the service role (used strictly server-side, bypasses RLS) touches
--     these tables.
-- ==============================================================================

create extension if not exists "pgcrypto";

-- 1. The problem author's optional notify email. One per problem. PRIVATE.
create table if not exists public.problem_notification_subscriptions (
  id                uuid primary key default gen_random_uuid(),
  problem_id        uuid not null references public.problems(id) on delete cascade,
  subscriber_id     uuid references public.profiles(id) on delete set null,
  email             text not null,
  unsubscribe_token uuid not null default gen_random_uuid(),
  created_at        timestamptz not null default timezone('utc'::text, now()),
  updated_at        timestamptz not null default timezone('utc'::text, now()),
  unique (problem_id)
);
create index if not exists idx_pns_problem
  on public.problem_notification_subscriptions (problem_id);
create unique index if not exists idx_pns_unsub_token
  on public.problem_notification_subscriptions (unsubscribe_token);

-- 2. One ledger row per reply. `comment_id` UNIQUE is the idempotency key. PRIVATE.
create table if not exists public.reply_notifications (
  id         uuid primary key default gen_random_uuid(),
  comment_id uuid not null references public.problem_comments(id) on delete cascade,
  problem_id uuid not null references public.problems(id) on delete cascade,
  status     text not null default 'pending'
             check (status in ('pending', 'sent', 'failed', 'skipped')),
  attempts   integer not null default 0,
  error      text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  unique (comment_id)
);
create index if not exists idx_rn_problem on public.reply_notifications (problem_id);
create index if not exists idx_rn_status  on public.reply_notifications (status);

-- 3. RLS ON, ZERO policies -> no anon / authenticated access via PostgREST.
alter table public.problem_notification_subscriptions enable row level security;
alter table public.reply_notifications              enable row level security;

-- 4. Undo the schema-wide default SELECT grant for these two tables.
revoke all on public.problem_notification_subscriptions from anon, authenticated;
revoke all on public.reply_notifications              from anon, authenticated;

-- 5. The server (service role) needs full access; it bypasses RLS anyway, but
--    make the table privileges explicit so nothing depends on defaults.
grant all on public.problem_notification_subscriptions to service_role;
grant all on public.reply_notifications              to service_role;

-- 6. Let PostgREST pick up the new tables.
notify pgrst, 'reload schema';

-- Verify (optional):
--   select tablename, rowsecurity from pg_tables
--     where tablename in ('problem_notification_subscriptions','reply_notifications');
--   -- expect rowsecurity = true, and no rows in pg_policies for either table.
