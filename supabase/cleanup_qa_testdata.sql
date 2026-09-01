-- ==============================================================================
-- ProblemForge: remove QA test data injected during the QA passes
--
-- DO NOT run this automatically. Review the SELECTs first, then run the DELETEs
-- only with explicit approval. Every row targeted here was created by the
-- automated QA browser sessions and is identified by an unmistakable "QA"
-- marker in the title / content, plus a specific id list.
--
-- Genuine user content, the 10 founder starter problems, and genuine Me Too
-- validations are NOT matched by any clause below.
-- ==============================================================================

-- ---- 1. PREVIEW: the 7 QA test problems -------------------------------------
select id, title, created_at
from public.problems
where id in (
  '1b250294-85f9-4622-9ede-0bd1cb23eae1',  -- "QA race-condition test: ..."
  '2d8674ea-6b2c-43b1-9f7f-479e15f7ce43',  -- "QA layout+banner test ... WWWWW..."
  'acf2e9f3-ce21-41ad-b9b2-14249e0fe269',  -- "QA author-instability test: posted as QA-Author-One"
  '03259546-29cc-4ec4-b347-a4cec22c4b7a',  -- "QA-postdup-1788110080886 ..." (dup 1)
  '0d50134e-e6b8-472b-8fb2-ab5b3170b7bb',  -- "QA-postdup-1788110080886 ..." (dup 2)
  'ecead81d-54de-48c8-9942-8e4d0dd1daf4',  -- "QA session-stability test problem: ..."
  'd8c77a06-4087-4868-a26a-9e7cec4d94af'   -- "QA test: I keep losing track of which streaming service ..."
)
order by created_at;
-- Safety cross-check: every one of these also matches the title pattern.
-- select id, title from public.problems
-- where title ~* '^\s*qa[\s:+-]' or title ilike 'QA-postdup-%';

-- ---- 2. PREVIEW: the 5 QA test comments (all on one starter problem) --------
select id, problem_id, author_name, left(content, 80) as content_head, created_at
from public.problem_comments
where content ilike 'QA-comment-%'
   or content ilike 'QA-dupcomment-%'
   or content ilike 'QA author-instability%'
order by created_at;

-- ==============================================================================
-- ---- 3. DELETES (run only after approval) ---------------------------------
-- Order: comments first is not required (problems cascade to their comments and
-- validations via ON DELETE CASCADE), but the QA comments live on a starter
-- problem we are KEEPING, so they must be deleted explicitly.
-- The comments_count / me_too_count triggers keep the starter problem's counters
-- correct automatically.
-- ==============================================================================

-- 3a. Remove the 5 QA comments from the "Group trips" starter problem.
-- delete from public.problem_comments
-- where content ilike 'QA-comment-%'
--    or content ilike 'QA-dupcomment-%'
--    or content ilike 'QA author-instability%';

-- 3b. Remove the 7 QA problems (cascades to their own comments + validations).
-- delete from public.problems
-- where id in (
--   '1b250294-85f9-4622-9ede-0bd1cb23eae1',
--   '2d8674ea-6b2c-43b1-9f7f-479e15f7ce43',
--   'acf2e9f3-ce21-41ad-b9b2-14249e0fe269',
--   '03259546-29cc-4ec4-b347-a4cec22c4b7a',
--   '0d50134e-e6b8-472b-8fb2-ab5b3170b7bb',
--   'ecead81d-54de-48c8-9942-8e4d0dd1daf4',
--   'd8c77a06-4087-4868-a26a-9e7cec4d94af'
-- );

-- ---- 4. VERIFY after delete ------------------------------------------------
-- select count(*) from public.problems;                       -- expect 21
-- select count(*) from public.problem_comments;               -- expect 7
-- select title, comments_count from public.problems
--   where title = 'Group trips fall apart because nobody wants to be the one who books';  -- expect 0


-- ==============================================================================
-- ---- 5. SECOND QA PASS (post-deploy) test data ----------------------------
-- Created by the live verification run after the hardening deploy. All titled
-- "QA2 ...". 5 problems + 1 comment on the "what to cook" starter.
-- ==============================================================================

-- preview
select id, title, created_at from public.problems
where id in (
  'a64d7222-bf49-4b74-a2de-2ab1159dc5f6',  -- "QA2 clean post ..."
  'e148c9d0-0974-4a5f-b6f8-b838c9b24b74',  -- "QA2 interaction target ..." (has QA2 comments + votes)
  'e164171e-5f71-4bc5-aa63-a34e7b5395cc',  -- "QA2 long+xss ..." (1000-char token test)
  '6b62f944-f8d8-47dc-b13f-7a98537841a2',  -- "QA2 author-persistence ..."
  'd72ab6ae-066f-48ec-8a53-1fc1b1753491'   -- "QA2 dup-post ..."
)
order by created_at;

select id, author_name, left(content,60) from public.problem_comments
where content ilike 'QA2 %' or author_name in ('QA2-Persist-Two','QA2 Commenter','QA2 DupCmt','QA2 LongCmt');

-- deletes (run after approval)
-- delete from public.problem_comments
-- where content ilike 'QA2 %'
--    or author_name in ('QA2-Persist-Two','QA2 Commenter','QA2 DupCmt','QA2 LongCmt');
--
-- delete from public.problems
-- where id in (
--   'a64d7222-bf49-4b74-a2de-2ab1159dc5f6',
--   'e148c9d0-0974-4a5f-b6f8-b838c9b24b74',
--   'e164171e-5f71-4bc5-aa63-a34e7b5395cc',
--   '6b62f944-f8d8-47dc-b13f-7a98537841a2',
--   'd72ab6ae-066f-48ec-8a53-1fc1b1753491'
-- );
--
-- After: board back to 21 problems; "what to cook" starter keeps only
-- Vibhor's genuine "Make a weekly schedule and stik to it".
-- (Confirmed done: QA2 rows are no longer on production.)


-- ==============================================================================
-- ---- 6. THIRD QA PASS: author-identity verification ---------------------
-- 9 problems, all titled "QA3-B<n>-...". Replies + one Me Too on QA3 rows
-- cascade with the problem delete. ONE QA3 reply was left on the founder
-- starter "Group trips fall apart..." (428a814c) and must be deleted
-- explicitly - the starter itself stays.
-- Every QA3 comment body starts with "QA3-". No genuine content matches.
-- ==============================================================================

-- preview
select id, title, created_at from public.problems
where id in (
  '2391a7ba-0e2a-4a9e-b693-4b8560ebdf2e',  -- QA3-B1 "John"
  '614ee0c1-e979-4ab3-ad8c-e6e2dfb26cfb',  -- QA3-B1 "Shifali"
  '8e944941-5279-4848-88ba-2a859d63fe01',  -- QA3-B2 "Nisha"  (1 reply + 1 me too)
  '951b9d02-0b6c-4d69-a317-e7bd90e537d6',  -- QA3-B3 "Nisha"  (1 me too)
  '861d4cdd-15f8-4646-98f8-1d29617f8dea',  -- QA3-B4 "Nisha"  (3 replies)
  '360e7cca-ee11-4e4f-a127-963467797dca',  -- QA3-B5 "John"   (1 reply)
  'd65f90d6-2b91-4191-94a8-f055a5ddfe80',  -- QA3-B5 "Vibhor"
  '060b978f-6b1e-45f3-a1b4-9193be651a9c',  -- QA3-B5 "Shifali"
  'd20c76c1-05f1-4dd1-b2a3-598df917cdf9'   -- QA3-B5 "Nisha"
)
order by created_at;

select id, problem_id, author_name, left(content, 50)
from public.problem_comments
where content like 'QA3-%'
order by created_at;

-- deletes (run after approval)
-- delete from public.problem_comments where content like 'QA3-%';
--
-- delete from public.problems where id in (
--   '2391a7ba-0e2a-4a9e-b693-4b8560ebdf2e',
--   '614ee0c1-e979-4ab3-ad8c-e6e2dfb26cfb',
--   '8e944941-5279-4848-88ba-2a859d63fe01',
--   '951b9d02-0b6c-4d69-a317-e7bd90e537d6',
--   '861d4cdd-15f8-4646-98f8-1d29617f8dea',
--   '360e7cca-ee11-4e4f-a127-963467797dca',
--   'd65f90d6-2b91-4191-94a8-f055a5ddfe80',
--   '060b978f-6b1e-45f3-a1b4-9193be651a9c',
--   'd20c76c1-05f1-4dd1-b2a3-598df917cdf9'
-- );
--
-- After: board back to 21 problems; the "Group trips" starter back to 0 replies.


-- ==============================================================================
-- ---- 7. FOURTH QA PASS: reply-notifications regression -----------------
-- 2 problems, all titled "QA4 ...". Replies contain "QA4". Created to confirm
-- the notifications change did not break the no-email post / reply / Me Too /
-- author-snapshot flows. Cascade deletes their own replies + validations.
-- ==============================================================================

select id, title, created_at from public.problems
where id in (
  'b7deb444-151f-41a3-8c28-3c5e641a57f2',  -- QA4 no-email post
  '24940487-77c0-4d3a-9fb8-58c48d439968'   -- QA4 snapshot-regression (Nisha)
)
order by created_at;

select id, problem_id, author_name, left(content,50)
from public.problem_comments where content like 'QA4 %' order by created_at;

-- deletes (run after approval)
-- delete from public.problem_comments where content like 'QA4 %';
-- delete from public.problems where id in (
--   'b7deb444-151f-41a3-8c28-3c5e641a57f2',
--   '24940487-77c0-4d3a-9fb8-58c48d439968'
-- );
