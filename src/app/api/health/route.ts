import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const isProd = process.env.NODE_ENV === "production";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl?.includes("placeholder") &&
    !supabaseAnonKey?.includes("placeholder");

  let database: Record<string, unknown> = { status: "not_configured" };

  if (isConfigured) {
    const startTime = Date.now();
    try {
      const supabase = createClient();
      const { data, error, count } = await supabase
        .from("problems")
        .select("id", { count: "exact" })
        .limit(1);

      const latencyMs = Date.now() - startTime;

      if (error) {
        // Full detail goes to the server logs, never to the response body.
        console.error("[problemforge] /api/health query error:", error);
        database = isProd
          ? { status: "error", latencyMs }
          : {
              status: "error",
              latencyMs,
              message: error.message || null,
              code: error.code ?? null,
              hint: error.hint ?? null,
            };
      } else {
        const rowCount = count ?? data?.length ?? 0;
        database = isProd
          ? { status: "connected", latencyMs }
          : {
              status: "connected",
              latencyMs,
              message: `Readable (${rowCount} row${rowCount === 1 ? "" : "s"}).`,
              rowCount,
            };
      }
    } catch (err) {
      console.error("[problemforge] /api/health exception:", err);
      database = isProd
        ? { status: "error", latencyMs: Date.now() - startTime }
        : {
            status: "error",
            detail: "exception",
            message: err instanceof Error ? err.message : "Unknown exception.",
            latencyMs: Date.now() - startTime,
          };
    }
  }

  return NextResponse.json(
    {
      status: database.status === "error" ? "degraded" : "ok",
      timestamp: new Date().toISOString(),
      service: "ProblemForge",
      supabaseConfigured: isConfigured,
      database,
    },
    { status: 200 },
  );
}
