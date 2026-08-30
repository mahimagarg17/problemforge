-- ==============================================================================
-- ProblemForge migration 0002: immutable author-name snapshot + starter flag
--
-- Run this ONCE in the hosted Supabase SQL editor BEFORE deploying the matching
-- app build. Additive and idempotent: it only ADDS columns and BACKFILLS them.
-- No table, type, policy, grant, or RLS change. Nothing is dropped or deleted.
--
-- Why:
--  * Author name was read from profiles.display_name via a join. That column is
--    a single mutable field per user, so posting/commenting again with a new
--    name rewrote the byline on ALL of that user's past content. These columns
--    freeze the name onto each row at write time.
--  * is_seed marks the 10 founder starter problems so the UI can label them
--    honestly ("Starter") without a count-based guess.
-- ==============================================================================

-- 1. New columns (nullable; the app coalesces a null back to the old join).
alter table public.problems
  add column if not exists author_name text;

alter table public.problems
  add column if not exists is_seed boolean not null default false;

alter table public.problem_comments
  add column if not exists author_name text;

-- 2. Backfill existing rows with a best-effort snapshot of the CURRENT name.
--    (This is the most faithful value available now; new rows write their own.)
update public.problems p
set author_name = coalesce(nullif(btrim(pr.display_name), ''), pr.username, 'Someone')
from public.profiles pr
where p.author_id = pr.id
  and p.author_name is null;

update public.problems
set author_name = 'Someone'
where author_name is null;

update public.problem_comments c
set author_name = coalesce(nullif(btrim(pr.display_name), ''), pr.username, 'Someone')
from public.profiles pr
where c.author_id = pr.id
  and c.author_name is null;

update public.problem_comments
set author_name = 'Someone'
where author_name is null;

-- 3. Flag the 10 founder starter problems and restore their intended byline.
--    (Their shared seed profile's display_name was overwritten by a later post,
--    which is exactly the bug this migration fixes.)
update public.problems
set is_seed = true,
    author_name = 'ProblemForge'
where title in (
  'I waste twenty minutes every evening deciding what to cook',
  'I never know whether a rental listing is actually trustworthy',
  'Chasing housemates for their share of the bills without sounding annoying',
  'Finding a plumber or electrician who shows up on time and quotes an honest price',
  'No way to know if a parking lot is full before I have already driven there',
  'Seniors throw away expensive textbooks while juniors buy them new',
  'Recurring status meetings I cannot skip without looking checked out',
  'A doctor''s handwriting is unreadable when I try to reorder the medicine later',
  'Return pickups get rescheduled two or three times and I have to wait home for a courier who never comes',
  'Group trips fall apart because nobody wants to be the one who books'
);

-- 4. Let PostgREST see the new columns immediately.
notify pgrst, 'reload schema';

-- Verify (optional):
--   select title, author_name, is_seed from public.problems order by created_at;
--   select count(*) from public.problems where author_name is null;      -- expect 0
--   select count(*) from public.problem_comments where author_name is null; -- expect 0
