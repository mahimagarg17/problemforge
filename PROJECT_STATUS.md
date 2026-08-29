# ProblemForge — PROJECT_STATUS

Snapshot for a new agent. Factual, based on code inspection on 2026-08-29.
Repo root: `/Users/mahimagarg/The_query_forum` (not a git repo).

---

## STATUS UPDATE — 2026-08-29 (persistence task)

Sections 4–8 below described the pre-persistence state and are now **partly
outdated**. Current reality:

- Persistence is **wired to Supabase** and verified end-to-end (post / me-too /
  comment persist across reload, dev-server restart, and a second browser
  session).
- `.env.local` points at a **local Supabase stack** (`npx supabase start`,
  Docker). `isSupabaseConfigured()` is now `true`, so all reads/writes go to
  Postgres via `src/lib/problems/data.ts` + `src/app/problems/actions.ts`.
  The in-memory store in `src/lib/problems/local-store.ts` is now only the
  offline fallback (used if the DB is unreachable or env is placeholders).
- `supabase/schema.sql` + `supabase/migrations/0001_mvp_anonymous.sql` are
  applied to the local DB. `supabase/config.toml` (new) enables anonymous
  sign-ins.
- Anonymous auth works: first write creates an `auth.users` row with
  `is_anonymous=true` and a `profiles` row (via `handle_new_user` trigger).
- Middleware now refreshes the session: `src/middleware.ts` calls
  `updateSession` from `src/lib/supabase/middleware.ts`.
- To move to **hosted** Supabase: swap the two `NEXT_PUBLIC_SUPABASE_*` values
  in `.env.local`, run the SQL in the hosted project, enable Anonymous
  sign-ins in the dashboard. See `SETUP.md`.

Still true: no user accounts (anonymous only), per-browser `pf_voted`/`pf_name`
cookies, seed numbers in `seed.ts` are fake starting values shown only when the
DB is empty.

---

## 1. PROJECT OVERVIEW

ProblemForge is a public web board where ordinary people post everyday problems
that don't have a good solution, and others say "I have this problem too" and
leave replies. Not a dev forum, marketplace, or job board.

**Intended flow:** land on homepage → understand the idea → see a few example
problems → "Post a problem" (name, the problem, frequency, frustration 1–5,
optional current workaround) → land on the new problem → others click "I have
this problem too" and add replies. **No login/signup by design.**

**What the app currently lets a user do (UI + wiring both present):**
post a problem, view it, browse all problems, filter by category, click/undo
"I have this problem too", add replies. All of this works **against an
in-memory store only** (see §4–§6) unless Supabase is configured, which it is
not.

---

## 2. TECH STACK (actual)

| Area | Tech |
| --- | --- |
| Framework | Next.js 14.2.x, App Router |
| Language | TypeScript 5.7 (strict), `target: es2017` |
| Styling | Tailwind CSS 3.4 (custom tokens in `tailwind.config.js`), one global CSS file with hand-written keyframes |
| UI libs | None (no component library). `clsx` + `tailwind-merge` for class merging |
| Animation libs | **None.** CSS keyframes in `src/app/globals.css` (`pf-rise`, `pf-pop`, `pf-tick`, `pf-breathe`, `pf-spin`) + `prefers-reduced-motion` reset |
| Fonts | `next/font/google`: Fraunces (display), Public Sans (body) |
| Backend | Next.js Server Actions + one diagnostic Route Handler. No standalone API |
| Database | **None active.** Supabase client code + SQL schema exist but are dormant (placeholder env). Runtime uses an in-memory JS store |
| Auth | **None for users.** Code path for Supabase anonymous sign-in exists, inactive |
| Validation | Zod (`src/lib/validations/problem.ts`) |
| Hosting/deploy | No `vercel.json` / Dockerfile / CI. `next.config.mjs` is near-empty (`reactStrictMode`) |
| Icons | `lucide-react` is in `package.json` but **not imported anywhere** (dead dependency). Icons in the app are inline SVG |

---

## 3. FRONTEND STATUS

All routes render and are styled. "DONE" below = UI complete **and** wired to
the data layer; it does **not** imply a real database.

| Route | Status | Notes / key components |
| --- | --- | --- |
| `/` | DONE (UI) | `Hero`, `ExampleProblems` (uses `ProblemRow`), `HowItWorks`, `WhyItExists`, `FinalCta`. Shows top 3 seed/store problems + a "Lately, people said" rail. Numbers come from the store (seed-based). |
| `/problems` | DONE (UI) | Server component. Category filter chips via `?category=`; list of `ProblemRow`; empty states. `loading.tsx` skeleton present. |
| `/problems/new` | DONE (UI) | `PostProblemForm` (client) → `postProblem` server action → redirect to `/problems/[id]?posted=1`. |
| `/problems/[id]` | DONE (UI) | Server component: problem detail + `MeTooButton` (client) + `Conversation` (client: reply list + optimistic form) + `PostedBanner` (client, shown when `?posted=1`). `loading.tsx` + `not-found.tsx` present. |
| `/api/health` | DONE | Route Handler. Diagnostic JSON: reports whether Supabase env is configured and, if so, tries a `problems` count query. Not used by the UI. |

Shared: `SiteHeader`, `SiteFooter`, `Container` (max-width 1200px shell),
`CategoryTag`, `Skeleton`.

Client components (only these): `MeTooButton`, `Conversation`,
`PostProblemForm`, `PostedBanner`. Everything else is a Server Component.

---

## 4. BACKEND STATUS

- **Is Supabase connected? NO.** `.env.local` contains
  `NEXT_PUBLIC_SUPABASE_URL=https://placeholder-project.supabase.co` and
  `NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-anon-key`.
  `isSupabaseConfigured()` (`src/lib/supabase/config.ts`) returns **false**
  whenever the URL/key contain `"placeholder"` → the app never calls Supabase.
- **Another database? NO.**
- **Is there an API/backend?** Yes, minimally: Next.js **Server Actions** in
  `src/app/problems/actions.ts` (`postProblem`, `toggleMeToo`, `addComment`)
  and one Route Handler `src/app/api/health/route.ts`. No REST/GraphQL layer.
- **Where is backend logic?**
  - Writes: `src/app/problems/actions.ts` (`"use server"`).
  - Reads: `src/lib/problems/data.ts` (called from Server Components).
  - Both branch on `isSupabaseConfigured()`: Supabase path vs
    `src/lib/problems/local-store.ts`.
- **Are DB queries actually executed?** No. The Supabase branches are never
  entered with current env. Only the in-memory branch runs.
- **Env vars required?** `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY` (to switch on the Supabase path),
  `NEXT_PUBLIC_SITE_URL` (used for `metadataBase`). App runs fine with none of
  them real.
- **Configured?** No — placeholders only.
- **Server/API routes?** `/api/health` only.

---

## 5. DATABASE

**Database: in-memory JS object (process memory), seeded from hardcoded data.**
No persistent database is connected or confirmed.

Store: `src/lib/problems/local-store.ts` — a `{ problems: [], comments: [] }`
object kept on `globalThis.__problemForgeStore`, initialised from
`src/lib/problems/seed.ts`. It survives dev hot-reload but **not** a server
restart, and would not be shared across serverless instances.

### Dormant SQL (exists, never applied — no Supabase project exists)

`supabase/schema.sql` defines (PostgreSQL / Supabase):

- Enums: `problem_category` (10 values), `problem_frequency` (5 values).
- Tables:
  - `profiles` (id → `auth.users`, `username` unique, `avatar_url`, timestamps)
  - `problems` (`id` uuid, `author_id` → profiles, `title` varchar(200),
    `description` text, `category`, `frequency`, `pain_level` 1–5 check,
    `current_workaround`, `me_too_count`, `comments_count`, timestamps)
  - `problem_validations` (`problem_id`, `user_id`, unique together) — the
    "me too" join table
  - `problem_comments` (`problem_id`, `author_id`, `content`,
    `is_solution_proposal`, timestamps)
  - `problem_solvers_notify` (future/unused)
- Triggers: auto-create profile on signup; maintain `me_too_count` and
  `comments_count` on validation/comment insert/delete.
- RPC: `toggle_me_too(target_problem_id uuid)` — inserts/deletes a validation
  for `auth.uid()`, returns `{ validated, me_too_count }`. Raises if not authed.
- RLS: read = public on problems/validations/comments; write = `authenticated`
  role and `auth.uid()` must match `author_id` / `user_id`.

`supabase/migrations/0001_mvp_anonymous.sql` (additive, not applied):
adds `profiles.display_name TEXT`; rewrites `handle_new_user()` to also set
`display_name` and to tolerate anonymous users (no email).

`src/types/database.types.ts` is a hand-written `Database` type (includes
`display_name`). Note: `src/lib/supabase/server.ts` exports `createLooseClient()`
returning a loosely-typed client because the installed `@supabase/postgrest-js`
is stricter than these hand-written types (insert/update payloads would
otherwise resolve to `never`).

### Reads/mutations in code

Reads (`src/lib/problems/data.ts`): `listProblems({category?})`,
`listExampleProblems(limit)`, `getProblem(id)`, `getComments(problemId)`,
`hasVoted(problemId)`.
Writes (`src/app/problems/actions.ts`): `postProblem`, `toggleMeToo`,
`addComment`. Each has a Supabase implementation and a local-store fallback.

---

## 6. DATA PERSISTENCE TEST

"Persisted" here = survives a full server restart. It does not.

| Feature | Persisted? | Where | Notes |
| --- | --- | --- | --- |
| Posting a problem | **NO** | In-memory store (`localAddProblem`) | Lives only in `globalThis` for the running process. New problem starts `me_too_count: 0`, `comments_count: 0`. Supabase insert path exists but inactive. |
| Viewing a posted problem | YES (within session) | In-memory store (`getProblem`/`localGetProblem`) | Retrievable by id as long as the process lives. |
| "I have this too" (add) | **NO** (count) / cookie (your own toggle) | `localSetMeToo` mutates store count; `pf_voted` httpOnly cookie records which ids this browser toggled | Count change is process-memory only. Cookie makes the button state survive refresh per-browser. |
| Removing "I have this too" | **NO** (count) / cookie | same as above | Toggle-off supported: decrements store count, removes id from `pf_voted`. |
| Commenting | **NO** | `localAddComment` pushes to store, bumps `comments_count` | `Conversation` also shows the reply optimistically in the client; on reload only store data remains (process-memory). |
| Category filtering | YES (functional) | n/a — it's a filter over `listProblems`, no data written | `?category=<enum>` validated against `CATEGORY_META`; unknown value → treated as "All". |
| Remembered name | Cookie | `pf_name` httpOnly cookie (1 yr) | Prefills name fields. Per-browser, not a DB. |

**Nothing is written to any persistent store today.**

---

## 7. REAL VS MOCK DATA

- **Hardcoded / seed:** `src/lib/problems/seed.ts` — 6 problems + 7 comments
  with fixed `me_too_count` (214, 331, 158, 122, 97, 143) and `comments_count`.
  Author names, titles, descriptions, workarounds all hardcoded. `created_at`
  is `Date.now() - N days` computed at module load.
- **Seeds the runtime store** on first access; the store is then mutated live
  by user actions during the process lifetime.
- **Dynamically generated:** new problem `id` (`p-<base36>-<rand>`), comment
  `id`, `created_at`, and `category` (keyword guess via `classifyCategory`),
  `title` (derived from the description via `deriveTitle`).
- **Homepage "N people" numbers:** `me_too_count` read from the store. Base
  values are seeded; increments from real clicks in the current process are
  included. The "703 people have said 'me too'…" line in `ExampleProblems` is
  `sum(me_too_count)` of the 3 shown, computed at render — so it is "live"
  relative to the seeded store, **not** from a database.
- **Fetched from a database:** nothing (Supabase path never runs).
- **Stored locally (browser):** `pf_name`, `pf_voted` cookies only. No
  `localStorage`/`IndexedDB` usage.

---

## 8. CURRENT USER FLOW (working vs visual-only)

All steps below **work functionally** for the duration of one server process;
none **persist** across a restart.

1. Homepage `/` — WORKS. Real (store-backed) example problems, category dots,
   me-too counts, reply counts, "Lately, people said" rail.
2. Browse `/problems` — WORKS. Lists store problems; category chips filter.
3. Open a problem `/problems/[id]` — WORKS. Detail, workaround block, reply list.
4. Post `/problems/new` — WORKS. Zod-validated; server action writes to store;
   redirects to the new problem with an animated `PostedBanner`
   ("Your problem is out there.").
5. "I have this problem too" — WORKS. Optimistic count + heart fill + toggle
   off; server action updates store + `pf_voted` cookie; state consistent after
   refresh (per browser).
6. Reply — WORKS. Optimistic insert with highlight/scroll; server action writes
   to store; `comments_count` bumped.
7. Category filter + empty states — WORKS.

**Visual-only / not truly implemented:** persistence, multi-user shared state,
any authentication, the Supabase anonymous-session flow (code present, never
executed), `problem_solvers_notify` (no UI at all).

---

## 9. KNOWN ISSUES / RISKS

- **No persistence.** In-memory store resets on restart; on a serverless host
  (e.g. Vercel) each instance/cold start has its own store and data effectively
  "disappears" between requests. This is the dominant issue.
- **Supabase path is unverified.** It compiles and reads correctly by
  inspection but has never run against a live project; `createLooseClient()`
  casts away types, so schema mismatches would surface only at runtime.
- **Anonymous sign-in prerequisite.** If Supabase is enabled, writes require
  "Anonymous sign-ins" turned on in the Supabase dashboard **and**
  `schema.sql` + `migrations/0001_mvp_anonymous.sql` applied. Not documented as
  done anywhere; `SETUP.md` lists the steps.
- **`hasVoted` cost.** Supabase `hasVoted` is one query per detail page; the
  feed relies on the `pf_voted` cookie instead, so on a real DB the feed's
  voted state can be wrong across devices/browsers.
- **Dead code / deps:** `lucide-react` (unused), `src/lib/supabase/client.ts`
  (unused), `src/lib/supabase/middleware.ts` `updateSession` (unused),
  `src/middleware.ts` is a no-op pass-through matching most routes.
- **`revalidate = 0`** on `/`, `/problems`, `/problems/[id]`, `/problems/new` —
  every request is dynamic (fine for now, no caching benefit).
- **`deriveTitle`** can produce awkward truncations ending in "…" for long
  run-on descriptions.
- No tests. No error boundary (`error.tsx`) on any route. `console`: no
  intentional logs; errors in server actions are swallowed and returned as
  friendly strings.
- **Cannot verify in a hosted browser here:** local screenshot tooling on
  macOS headless crops ~24px; mobile checks were done via CDP device
  emulation (no horizontal overflow found).

---

## 10. WHAT IS COMPLETE

```
[x] Homepage UI + sections
[x] Problem list UI + category filter + empty states
[x] Problem detail UI
[x] Post-a-problem form (UI + Zod validation + server action)
[x] "I have this problem too" (optimistic, toggle on/off, cookie-backed button state)
[x] Replies (optimistic add, animated) — server action wired
[x] Micro-interactions / motion + prefers-reduced-motion
[x] Category colour system, skeleton loaders, not-found
[x] Local in-memory data layer (seeded)
[x] Supabase read/write code paths (written, dormant)
[x] SQL schema + one additive migration (not applied)
[x] lint clean, build clean
[ ] Persistent database actually connected
[ ] Verified Supabase integration (live)
[ ] Anonymous auth flow exercised end-to-end
[ ] Any authentication / user identity
[ ] Shared multi-user state
[ ] Tests, error boundaries, deployment config
[ ] "Notify me if solved" (schema table only, no UI)
```

---

## 11. WHAT REMAINS TO BUILD (prioritised)

**P0 — required for the core product to actually work (persist data):**
1. Create a Supabase project; put real `NEXT_PUBLIC_SUPABASE_URL` /
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.
2. Apply `supabase/schema.sql` then `supabase/migrations/0001_mvp_anonymous.sql`
   in the Supabase SQL editor.
3. Enable **Anonymous sign-ins** in the Supabase dashboard (Auth → Providers).
4. Manually verify each write path against the live DB: `postProblem`
   (profile upsert + `problems` insert), `toggleMeToo` (`toggle_me_too` RPC),
   `addComment` (`problem_comments` insert). Fix type/RLS mismatches exposed by
   `createLooseClient()`.
5. Confirm reads (`listProblems`, `getProblem`, `getComments`, `hasVoted`) and
   the `author:profiles(display_name, username)` embed work under RLS.

**P1 — important:**
6. Make feed "voted" state correct on a real DB (batch-load the current user's
   `problem_validations` for visible problems instead of trusting the cookie).
7. Add `error.tsx` boundaries for `/problems` and `/problems/[id]`; surface real
   failure states instead of silent fallback to the local store.
8. Deployment config (Vercel project + env vars) and remove the local-store
   fallback for production, or gate it behind an explicit dev flag.
9. Decide the anonymous-identity story: session longevity, what happens when the
   anon cookie is cleared, whether to let a user edit/delete their own post.
10. Remove dead code/deps (`lucide-react`, unused supabase client/middleware).

**P2 — polish / future:**
11. Search on `/problems`; sort options (newest / most me-too / most replies).
12. "Notify me if someone solves this" using `problem_solvers_notify` (+ email).
13. Basic rate-limiting / spam protection on the three server actions.
14. Pagination on `/problems` (currently `limit(200)` / full store).
15. Tests (server action + data-layer unit tests; one e2e for the post flow).

---

## 12. FILE MAP

```
supabase/
  schema.sql                     full PG schema, RLS, triggers, toggle_me_too RPC (NOT applied)
  migrations/0001_mvp_anonymous.sql  adds profiles.display_name; anon-safe handle_new_user (NOT applied)

src/
  app/
    layout.tsx                   fonts, <SiteHeader/><SiteFooter/>, metadata
    page.tsx                     homepage; composes landing sections
    globals.css                  Tailwind + keyframes + prefers-reduced-motion
    api/health/route.ts          diagnostic JSON (Supabase configured? reachable?)
    problems/
      page.tsx                   list + category filter (?category=)
      loading.tsx                skeleton
      actions.ts                 "use server": postProblem, toggleMeToo, addComment  <-- all writes
      new/page.tsx               post form page
      [id]/page.tsx              problem detail (server)
      [id]/loading.tsx           skeleton
      [id]/not-found.tsx
  components/
    site/         SiteHeader, SiteFooter, Container
    landing/      Hero, ExampleProblems, HowItWorks, WhyItExists, FinalCta
    problems/     ProblemRow, CategoryTag, MeTooButton*, Conversation*, PostProblemForm*, PostedBanner*
    ui/           Skeleton
      (* = "use client")
  lib/
    problems/
      data.ts                    reads; Supabase-or-local branch                    <-- all reads
      local-store.ts             in-memory store (globalThis), the current "DB"
      seed.ts                    6 hardcoded problems + 7 comments
      labels.ts                  category meta/colours, frequency/pain labels, classifyCategory, deriveTitle, timeAgo
      types.ts                   Problem, Comment, input types
      cookies.ts                 pf_name / pf_voted cookie helpers
    supabase/
      config.ts                  isSupabaseConfigured()  <-- the on/off switch
      server.ts                  createClient() + createLooseClient() (SSR, cookie-based)
      anon.ts                    ensureAnonUser() — anonymous sign-in (only runs if configured)
      client.ts                  browser client — UNUSED
      middleware.ts              updateSession() — UNUSED
    validations/problem.ts       Zod: newProblemSchema, newCommentSchema
    utils.ts                     cn()
  types/database.types.ts        hand-written Supabase Database type
  middleware.ts                  no-op pass-through

Root: SETUP.md (how to connect Supabase), .env.local (placeholders),
.env.example, tailwind.config.js, next.config.mjs (minimal).
```

---

## HANDOFF SUMMARY

- ProblemForge is a no-login board for everyday problems: post, "I have this
  too", reply. Next.js 14 App Router + TS + Tailwind. UI is essentially done
  and polished; the product concept is fully represented on screen.
- **There is no database.** `.env.local` is placeholders, so
  `isSupabaseConfigured()` is false and everything runs off an in-memory,
  seed-populated store in `src/lib/problems/local-store.ts`. Restart the server
  and all posts/replies/counts are gone.
- Every read goes through `src/lib/problems/data.ts`; every write through
  `src/app/problems/actions.ts`. Both already contain a complete Supabase
  implementation behind the same `isSupabaseConfigured()` switch — it has just
  never been run against a live project.
- The SQL is ready: `supabase/schema.sql` + `supabase/migrations/0001_...sql`.
  The Supabase design uses **anonymous sign-ins** (no login UI) to satisfy RLS;
  that provider must be enabled in the dashboard. `SETUP.md` has the steps.
- Seed numbers (214, 331, …) in `seed.ts` are fake starting values; new posts
  start at 0. Homepage aggregate lines are computed from the store at render.
- Per-browser state (which problems you "me too'd", your name) is in httpOnly
  cookies `pf_voted` / `pf_name`, not a DB.
- To make the product real, do the P0 list: connect Supabase, apply the SQL,
  enable anonymous auth, then verify each write/read path against the live DB
  (watch for type/RLS issues — `createLooseClient()` hides type errors).
- Don't "fix" persistence by expanding the local store; it's a dev fallback.
- lint + build are green. No tests, no error boundaries, no deploy config.
- Dead weight you can ignore/remove: `lucide-react`, `lib/supabase/client.ts`,
  `lib/supabase/middleware.ts`, the no-op `src/middleware.ts`.
