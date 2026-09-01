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

## Reply notifications (optional email)

When someone posts a problem they can optionally leave an email. When another
person replies, ProblemForge sends that address one email. No account, no
verification, no login. The email is stored in a private, RLS-sealed table
that only the server (service role) can read; it never appears in any public
query, on the problem page, or in a comment.

To turn it on:

1. Run `supabase/migrations/0003_reply_notifications.sql` in the hosted
   Supabase SQL editor (additive, idempotent — creates two private tables).

2. Set `SUPABASE_SERVICE_ROLE_KEY` (Project Settings -> API -> `service_role`,
   the "secret" key). SERVER ONLY — never `NEXT_PUBLIC_`, never in the repo.
   With just this set, emails are *captured* but not sent (recorded as
   `skipped: not_configured`). The "notify me" field appears on the form.

3. Create a Resend account (https://resend.com). Add and **verify the domain**
   `problemforge.co` — Resend gives you the DNS records to add:
   - `MX` on `send.problemforge.co` -> `feedback-smtp.<region>.amazonses.com`
   - `TXT` (SPF) on `send.problemforge.co` -> `v=spf1 include:amazonses.com ~all`
   - `TXT` (DKIM) on `resend._domainkey.problemforge.co` -> the key Resend shows
   - optional `TXT` (DMARC) on `_dmarc.problemforge.co` -> `v=DMARC1; p=none;`
   `notifications@problemforge.co` is a *sender identity only* — no mailbox
   needs to exist.

4. Set `RESEND_API_KEY` and `EMAIL_FROM="ProblemForge <notifications@problemforge.co>"`
   (optionally `EMAIL_REPLY_TO`). Real emails now send.

5. Set `NEXT_PUBLIC_SITE_URL=https://problemforge.co` so the "View reply" and
   unsubscribe links point at the real domain.

Failure isolation: a reply is saved and returns success independently of the
email. Provider errors are logged and recorded (`reply_notifications.status`),
never surfaced to the user. Each reply emails at most once (`comment_id` is
UNIQUE in `reply_notifications`).

## What talks to what

| Concern              | File                                   |
| -------------------- | -------------------------------------- |
| Reads (lists, detail)| `src/lib/problems/data.ts`             |
| Writes (post, reply, me-too) | `src/app/problems/actions.ts`  |
| Local fallback store | `src/lib/problems/local-store.ts`      |
| Anonymous session    | `src/lib/supabase/anon.ts`             |
| Validation           | `src/lib/validations/problem.ts`       |
| Reply notifications  | `src/lib/notifications/*`              |
| Service-role client  | `src/lib/supabase/admin.ts` (server only) |
| Unsubscribe          | `src/app/unsubscribe/route.ts`         |
