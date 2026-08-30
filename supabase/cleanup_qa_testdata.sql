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
