import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Service-role Supabase client. SERVER ONLY.
 *
 * Bypasses Row Level Security, so it is the only thing that can read the
 * private `problem_notification_subscriptions` / `reply_notifications` tables.
 * `SUPABASE_SERVICE_ROLE_KEY` must never be exposed to the browser (no
 * NEXT_PUBLIC_ prefix, never imported into a client component).
 *
 * Returns null when the key is not configured, so callers degrade gracefully
 * instead of throwing.
 */
export function createAdminClient(): SupabaseClient<any, any, any> | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key || url.includes("placeholder")) return null;

  return createSupabaseClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: { headers: { "X-Client-Info": "problemforge-notifications" } },
  });
}
