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
  author: { display_name: string | null; username: string | null } | null;
}

function toProblem(row: ProblemRow): Problem {
  return {
    id: row.id,
    author_name: row.author?.display_name || row.author?.username || "Someone",
    title: row.title,
    description: row.description,
    category: row.category,
    frequency: row.frequency,
    pain_level: row.pain_level,
    current_workaround: row.current_workaround,
    me_too_count: row.me_too_count,
    comments_count: row.comments_count,
    created_at: row.created_at,
  };
}

const PROBLEM_SELECT =
  "id, title, description, category, frequency, pain_level, current_workaround, me_too_count, comments_count, created_at, author:profiles(display_name, username)";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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
    let query = supabase
      .from("problems")
      .select(PROBLEM_SELECT)
      .order("created_at", { ascending: false })
      .limit(200);

    if (options.category) query = query.eq("category", options.category);

    const { data, error } = await query;

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
 * - Real rows when the database has any.
 * - Empty when Supabase is configured but the board is still empty, so the
 *   homepage shows a genuine empty state instead of un-clickable seed cards.
 * - Local seed examples only in dev (no Supabase configured), as a preview.
 */
export async function listExampleProblems(limit = 4): Promise<Problem[]> {
  const problems = await listProblems();
  if (problems.length === 0 && isSupabaseConfigured()) return [];

  const source = problems.length > 0 ? problems : SEED_PROBLEMS;
  return [...source]
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
    const { data, error } = await supabase
      .from("problems")
      .select(PROBLEM_SELECT)
      .eq("id", id)
      .maybeSingle();

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
    const { data, error } = await supabase
      .from("problem_comments")
      .select("id, problem_id, content, created_at, author:profiles(display_name, username)")
      .eq("problem_id", problemId)
      .order("created_at", { ascending: true });

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
        author: { display_name: string | null; username: string | null } | null;
      }[]
    ).map((row) => ({
      id: row.id,
      problem_id: row.problem_id,
      author_name: row.author?.display_name || row.author?.username || "Someone",
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
