# ProblemForge setup

## Run it locally (no database)

```bash
npm install
npm run dev
```

Open http://localhost:3000. With no Supabase keys set, the app uses a local
in-memory store seeded with a handful of example problems. You can post a
problem, click "I have this problem too", and leave replies. Data resets when
the dev server restarts. This mode is only for local development.

## Local Supabase (Docker) — currently active

`.env.local` is wired to a local Supabase stack. To run it:

```bash
npx supabase start          # boots Postgres + Auth + PostgREST in Docker
npm run dev
```

The schema and migration were already applied to this local DB. If you ever
reset it (`npx supabase db reset` wipes data), re-apply them:

```bash
docker exec -i supabase_db_The_query_forum psql -U postgres -d postgres < supabase/schema.sql
docker exec -i supabase_db_The_query_forum psql -U postgres -d postgres < supabase/migrations/0001_mvp_anonymous.sql
```

Anonymous sign-ins are enabled in `supabase/config.toml`
(`[auth] enable_anonymous_sign_ins = true`). Studio UI: http://127.0.0.1:54323.
`npx supabase stop` stops it; data is kept for next start.

## Connect a hosted Supabase project (production)

1. Create a free project at https://supabase.com.

2. Copy `.env.example` to `.env.local` and fill in:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<your-project>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<your anon key>
   ```

3. In the Supabase SQL editor, run the schema and then the MVP migration:

   - `supabase/schema.sql`
   - `supabase/migrations/0001_mvp_anonymous.sql`

4. Enable anonymous sign-ins: Supabase dashboard -> Authentication ->
   Providers -> Anonymous -> enable.

   There is no login in ProblemForge. To keep the existing row-level
   security policies intact, the app creates a throwaway anonymous auth user
   the first time someone posts or replies. Nothing is asked of the visitor.

5. Restart `npm run dev`. New posts and replies now persist to Supabase, and
   "I have this problem too" runs through the existing `toggle_me_too`
   function so counts stay correct.

## What talks to what

| Concern              | File                                   |
| -------------------- | -------------------------------------- |
| Reads (lists, detail)| `src/lib/problems/data.ts`             |
| Writes (post, reply, me-too) | `src/app/problems/actions.ts`  |
| Local fallback store | `src/lib/problems/local-store.ts`      |
| Anonymous session    | `src/lib/supabase/anon.ts`             |
| Validation           | `src/lib/validations/problem.ts`       |
