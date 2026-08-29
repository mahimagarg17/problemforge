import type { LooseSupabaseClient } from "./server";

/**
 * There is no login in this product. To satisfy the existing row-level
 * security policies (which expect an authenticated user) we use Supabase
 * anonymous sign-ins: a real auth user with no email or password, created
 * silently on first write. RLS stays fully in force.
 *
 * Requires "Anonymous sign-ins" to be enabled in the Supabase dashboard
 * (Authentication -> Providers -> Anonymous). See SETUP.md.
 */
export async function ensureAnonUser(supabase: LooseSupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) return user;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error || !data.user) {
    throw new Error(
      error?.message ??
        "Could not start an anonymous session. Enable anonymous sign-ins in Supabase.",
    );
  }
  return data.user;
}
