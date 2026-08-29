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

      // A plain GET (not a HEAD). A HEAD request has no body, so a failing
      // HEAD gives back an error object with an empty message and no code,
      // which hides the real problem. A GET returns PostgREST's error JSON,
      // and returns `[]` (no error) when the table is simply empty.
      const { data, error, count } = await supabase
        .from("problems")
        .select("id", { count: "exact" })
        .limit(1);

      const latencyMs = Date.now() - startTime;

      if (error) {
        database = {
          status: "error",
          message: error.message || "Supabase returned an error with no message.",
          code: error.code ?? null,
          details: error.details ?? null,
          hint: error.hint ?? null,
          raw: JSON.stringify(error, Object.getOwnPropertyNames(error ?? {})),
          latencyMs,
        };
      } else {
        // Reached the table. Zero rows is a healthy empty database.
        const rowCount = count ?? data?.length ?? 0;
        database = {
          status: "connected",
          message: `Connected. 'problems' table is readable (${rowCount} row${rowCount === 1 ? "" : "s"}).`,
          rowCount,
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
        raw: JSON.stringify(err, Object.getOwnPropertyNames(err ?? {})),
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
