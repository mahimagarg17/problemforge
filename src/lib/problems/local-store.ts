import type { Comment, NewCommentInput, NewProblemInput, Problem } from "./types";
import { SEED_COMMENTS, SEED_PROBLEMS } from "./seed";
import { deriveTitle } from "./labels";

/**
 * In-memory store used when Supabase is not configured, so the whole flow
 * (post, recognise, comment) can be tried locally without any setup.
 * State lives on globalThis so it survives dev-server hot reloads.
 */
interface Store {
  problems: Problem[];
  comments: Comment[];
}

const globalForStore = globalThis as unknown as { __problemForgeStore?: Store };

function createStore(): Store {
  return {
    problems: SEED_PROBLEMS.map((p) => ({ ...p })),
    comments: SEED_COMMENTS.map((c) => ({ ...c })),
  };
}

const store: Store = globalForStore.__problemForgeStore ?? createStore();
if (!globalForStore.__problemForgeStore) {
  globalForStore.__problemForgeStore = store;
}

function randomId(): string {
  return `p-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function localListProblems(): Problem[] {
  return [...store.problems].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );
}

export function localGetProblem(id: string): Problem | null {
  return store.problems.find((p) => p.id === id) ?? null;
}

export function localGetComments(problemId: string): Comment[] {
  return store.comments
    .filter((c) => c.problem_id === problemId)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
}

export function localAddProblem(input: NewProblemInput): Problem {
  const problem: Problem = {
    id: randomId(),
    author_name: input.name.trim(),
    title: deriveTitle(input.problem),
    description: input.problem.trim(),
    category: input.category,
    frequency: input.frequency,
    pain_level: input.pain_level,
    current_workaround: input.workaround?.trim() ? input.workaround.trim() : null,
    me_too_count: 0,
    comments_count: 0,
    created_at: new Date().toISOString(),
    is_seed: false,
  };
  store.problems.unshift(problem);
  return problem;
}

export function localSetMeToo(id: string, delta: 1 | -1): number {
  const problem = store.problems.find((p) => p.id === id);
  if (!problem) return 0;
  problem.me_too_count = Math.max(0, problem.me_too_count + delta);
  return problem.me_too_count;
}

export function localAddComment(problemId: string, input: NewCommentInput): Comment | null {
  const problem = store.problems.find((p) => p.id === problemId);
  if (!problem) return null;
  const comment: Comment = {
    id: `c-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    problem_id: problemId,
    author_name: input.name.trim(),
    content: input.content.trim(),
    created_at: new Date().toISOString(),
  };
  store.comments.push(comment);
  problem.comments_count += 1;
  return comment;
}
