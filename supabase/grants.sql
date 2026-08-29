-- ==============================================================================
-- ProblemForge: API role privileges (anon / authenticated)
--
-- Run this ONCE in the hosted Supabase SQL editor.
--
-- Why it is needed: schema.sql was applied as raw SQL. That enables RLS and
-- creates the policies, but it does NOT grant the table-level privileges the
-- PostgREST API roles (`anon`, `authenticated`) require. The result is
-- "permission denied for table problems" (SQLSTATE 42501) even though every
-- RLS policy is correct.
--
-- This is a privilege change, not a schema change. No tables, columns, types,
-- policies, or functions are altered. RLS stays fully in force: these grants
-- only let a role *attempt* an operation; the existing policies still decide
-- which rows it can actually read or write.
-- ==============================================================================

grant usage on schema public to anon, authenticated;

-- Public read access (matches every "viewable by everyone" SELECT policy).
grant select on
  public.profiles,
  public.problems,
  public.problem_validations,
  public.problem_comments
to anon, authenticated;

-- Writes are limited to signed-in users (incl. anonymous sign-ins) by RLS.
grant insert, update on public.profiles to authenticated;
grant insert, update, delete on public.problems to authenticated;
grant insert, delete on public.problem_validations to authenticated;
grant insert, update, delete on public.problem_comments to authenticated;
grant select, insert, delete on public.problem_solvers_notify to authenticated;

-- The atomic "me too" toggle is called over RPC by signed-in users.
grant execute on function public.toggle_me_too(uuid) to authenticated;

-- Cover anything added later to this schema.
alter default privileges in schema public
  grant select on tables to anon, authenticated;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;

-- Make PostgREST apply the new privileges immediately.
notify pgrst, 'reload schema';
