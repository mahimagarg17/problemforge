import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const isConfigured =
    Boolean(supabaseUrl) &&
    Boolean(supabaseAnonKey) &&
    !supabaseUrl?.includes("placeholder");

  let dbConnection = {
    status: "not_configured",
    message: "Supabase credentials are not set in .env.local yet.",
    latencyMs: 0,
  };

  if (isConfigured) {
    const startTime = Date.now();
    try {
      const supabase = createClient();
      const { error } = await supabase.from("problems").select("count", { count: "exact", head: true });

      const latencyMs = Date.now() - startTime;

      if (error) {
        dbConnection = {
          status: "error",
          message: `Connected to Supabase, but query returned: ${error.message} (Did you run supabase/schema.sql in the SQL Editor?)`,
          latencyMs,
        };
      } else {
        dbConnection = {
          status: "connected",
          message: "Successfully connected to Supabase and verified 'problems' table access.",
          latencyMs,
        };
      }
    } catch (err: unknown) {
      dbConnection = {
        status: "exception",
        message: err instanceof Error ? err.message : "Unknown database connection exception",
        latencyMs: Date.now() - startTime,
      };
    }
  }

  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "The Query Forum / ProblemForge Foundation",
      environment: {
        nodeEnv: process.env.NODE_ENV,
        supabaseConfigured: isConfigured,
      },
      database: dbConnection,
    },
    { status: 200 }
  );
}

