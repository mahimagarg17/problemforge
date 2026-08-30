import { createLooseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Comment, Problem } from "./types";
import {
  localGetComments,
  localGetProblem,
  localListProblems,
} from "./local-store";
import { SEED_PROBLEMS } from "./seed";

interface ProblemRow {
  id: string;
  title: string;
  description: string;
  category: Problem["category"];
  frequency: Problem["frequency"];
  pain_level: number;
  current_workaround: string | null;
  me_too_count: number;
  comments_count: number;
  created_at: string;
  author_name?: string | null;
  is_seed?: boolean | null;
  author: { display_name: string | null; username: string | null } | null;
}

function toProblem(row: ProblemRow): Problem {
  return {
    id: row.id,
    // Prefer the immutable per-row snapshot. Fall back to the (mutable) profile
    // only for rows created before the snapshot column existed.
    author_name:
      row.author_name?.trim() ||
      row.author?.display_name ||
      row.author?.username ||
      "Someone",
    title: row.title,
    description: row.description,
    category: row.category,
    frequency: row.frequency,
    pain_level: row.pain_level,
    current_workaround: row.current_workaround,
    me_too_count: row.me_too_count,
    comments_count: row.comments_count,
    created_at: row.created_at,
    is_seed: Boolean(row.is_seed),
  };
}

const BASE_COLUMNS =
  "id, title, description, category, frequency, pain_level, current_workaround, me_too_count, comments_count, created_at, author:profiles(display_name, username)";
const PROBLEM_SELECT = `${BASE_COLUMNS}, author_name, is_seed`;

/** Retry a query without the snapshot columns if the migration has not run. */
function isMissingColumnError(error: { message?: string; code?: string } | null) {
  if (!error) return false;
  return (
    error.code === "42703" ||
    /author_name|is_seed|column .* does not exist/i.test(error.message ?? "")
  );
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Obvious test / junk content should not be surfaced on the landing page.
 * This is a floor, not a moderation system: it only catches keyboard mashing,
 * page-breaking tokens, and rows literally titled as a test.
 */
export function isLowQualityProblem(p: Problem): boolean {
  const title = p.title ?? "";
  const haystack = `${title}\n${p.description ?? ""}`;
  if (/(.)\1{11,}/.test(haystack)) return true; // same char 12+ times
  if (/\S{40,}/.test(haystack)) return true; // 40+ char unbroken token
  if (/^\s*(qa\b|test\b|testing\b|asdf|lorem ipsum)/i.test(title)) return true;
  if (title.replace(/[^A-Za-z0-9]/g, "").length < 3) return true;
  return false;
}

export async function listProblems(options: {
  category?: Problem["category"];
} = {}): Promise<Problem[]> {
  if (!isSupabaseConfigured()) {
    const all = localListProblems();
    return options.category
      ? all.filter((p) => p.category === options.category)
      : all;
  }

  try {
    const supabase = createLooseClient();
    const build = (columns: string) => {
      let q = supabase
        .from("problems")
        .select(columns)
        .order("created_at", { ascending: false })
        .limit(200);
      if (options.category) q = q.eq("category", options.category);
      return q;
    };

    let { data, error } = await build(PROBLEM_SELECT);
    if (isMissingColumnError(error)) {
      ({ data, error } = await build(BASE_COLUMNS));
    }

    if (error || !data) {
      if (error) console.error("[problemforge] listProblems error:", error);
      return localListProblems();
    }
    return (data as unknown as ProblemRow[]).map(toProblem);
  } catch (err) {
    console.error("[problemforge] listProblems failed:", err);
    return localListProblems();
  }
}

/**
 * A short list for the landing page.
 * - Real rows when the database has any (obvious junk filtered out).
 * - Empty when Supabase is configured but the board is still empty, so the
 *   homepage shows a genuine empty state instead of un-clickable seed cards.
 * - Local seed examples only in dev (no Supabase configured), as a preview.
 */
export async function listExampleProblems(limit = 4): Promise<Problem[]> {
  const problems = await listProblems();
  if (problems.length === 0 && isSupabaseConfigured()) return [];

  const source = problems.length > 0 ? problems : SEED_PROBLEMS;
  return [...source]
    .filter((p) => !isLowQualityProblem(p))
    .sort((a, b) => b.me_too_count - a.me_too_count)
    .slice(0, limit);
}

export async function getProblem(id: string): Promise<Problem | null> {
  if (!isSupabaseConfigured()) return localGetProblem(id);
  // Seed-fallback ids (e.g. "seed-pg-listings") are not valid uuids; skip the
  // query so Postgres doesn't reject them with a type error.
  if (!UUID_RE.test(id)) return null;

  try {
    const supabase = createLooseClient();
    const run = (columns: string) =>
      supabase.from("problems").select(columns).eq("id", id).maybeSingle();

    let { data, error } = await run(PROBLEM_SELECT);
    if (isMissingColumnError(error)) {
      ({ data, error } = await run(BASE_COLUMNS));
    }

    if (error || !data) {
      if (error) console.error("[problemforge] getProblem error:", error);
      return null;
    }
    return toProblem(data as unknown as ProblemRow);
  } catch (err) {
    console.error("[problemforge] getProblem failed:", err);
    return null;
  }
}

export async function getComments(problemId: string): Promise<Comment[]> {
  if (!isSupabaseConfigured()) return localGetComments(problemId);

  try {
    const supabase = createLooseClient();
    const base =
      "id, problem_id, content, created_at, author:profiles(display_name, username)";
    const run = (columns: string) =>
      supabase
        .from("problem_comments")
        .select(columns)
        .eq("problem_id", problemId)
        .order("created_at", { ascending: true });

    let { data, error } = await run(`${base}, author_name`);
    if (isMissingColumnError(error)) {
      ({ data, error } = await run(base));
    }

    if (error || !data) {
      if (error) console.error("[problemforge] getComments error:", error);
      return [];
    }
    return (
      data as unknown as {
        id: string;
        problem_id: string;
        content: string;
        created_at: string;
        author_name?: string | null;
        author: { display_name: string | null; username: string | null } | null;
      }[]
    ).map((row) => ({
      id: row.id,
      problem_id: row.problem_id,
      author_name:
        row.author_name?.trim() ||
        row.author?.display_name ||
        row.author?.username ||
        "Someone",
      content: row.content,
      created_at: row.created_at,
    }));
  } catch (err) {
    console.error("[problemforge] getComments failed:", err);
    return [];
  }
}

export async function hasVoted(problemId: string): Promise<boolean> {
  if (!isSupabaseConfigured() || !UUID_RE.test(problemId)) return false;
  try {
    const supabase = createLooseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;
    const { data } = await supabase
      .from("problem_validations")
      .select("id")
      .eq("problem_id", problemId)
      .eq("user_id", user.id)
      .maybeSingle();
    return Boolean(data);
  } catch (err) {
    console.error("[problemforge] hasVoted failed:", err);
    return false;
  }
}
