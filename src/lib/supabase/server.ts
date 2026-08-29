import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { Database } from "@/types/database.types";

/**
 * The installed postgrest-js is stricter than these hand-written database
 * types, which makes insert/update payloads resolve to `never`. Reads are
 * unaffected. This alias is used where we write, so the schema stays the
 * single source of truth without fighting generics.
 */
export type LooseSupabaseClient = SupabaseClient<any, any, any>;

export function createLooseClient(): LooseSupabaseClient {
  return createClient() as unknown as LooseSupabaseClient;
}

export function createClient() {
  const cookieStore = cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: "", ...options });
          } catch {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing user sessions.
          }
        },
      },
    }
  );
}

