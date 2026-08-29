import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl?.includes("placeholder") &&
    !supabaseAnonKey?.includes("placeholder");

  let database: Record<string, unknown> = {
    status: "not_configured",
    message:
      "NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set.",
    latencyMs: 0,
  };

  if (isConfigured) {
    const startTime = Date.now();
    try {
      const supabase = createClient();

      // Reach the `problems` table and ask for an exact row count.
      // `head: true` returns no rows (just the count), so this succeeds
      // on an empty table. `select("*")` here means "any columns" - the
      // count comes from the `count` option, not from a column literally
      // named "count".
      const { error, count } = await supabase
        .from("problems")
        .select("*", { count: "exact", head: true });

      const latencyMs = Date.now() - startTime;

      if (error) {
        database = {
          status: "error",
          message: `Supabase returned an error: ${error.message}`,
          code: error.code ?? null,
          hint: error.hint ?? null,
          latencyMs,
        };
      } else {
        // Reached the table successfully. Zero rows is a healthy empty
        // database, not an error.
        database = {
          status: "connected",
          message: `Connected. 'problems' table is reachable (${count ?? 0} row${count === 1 ? "" : "s"}).`,
          rowCount: count ?? 0,
          latencyMs,
        };
      }
    } catch (err: unknown) {
      database = {
        status: "error",
        detail: "exception",
        message:
          err instanceof Error
            ? err.message
            : "Unknown exception while querying Supabase.",
        latencyMs: Date.now() - startTime,
      };
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "ProblemForge",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        supabaseConfigured: isConfigured,
      },
      database,
    },
    { status: 200 },
  );
}
