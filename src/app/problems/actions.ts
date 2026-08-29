"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createLooseClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { ensureAnonUser } from "@/lib/supabase/anon";
import { newCommentSchema, newProblemSchema } from "@/lib/validations/problem";
import { classifyCategory, deriveTitle } from "@/lib/problems/labels";
import {
  COOKIE_MAX_AGE,
  NAME_COOKIE,
  VOTED_COOKIE,
  readVotedIds,
} from "@/lib/problems/cookies";
import {
  localAddComment,
  localAddProblem,
  localSetMeToo,
} from "@/lib/problems/local-store";

export interface FormState {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string>;
}

function flattenFieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

function rememberName(name: string) {
  cookies().set(NAME_COOKIE, name, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

function writeVoted(ids: Set<string>) {
  cookies().set(VOTED_COOKIE, [...ids].join(","), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function postProblem(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const parsed = newProblemSchema.safeParse({
    name: formData.get("name"),
    problem: formData.get("problem"),
    frequency: formData.get("frequency"),
    pain_level: formData.get("pain_level"),
    workaround: formData.get("workaround") ?? "",
  });

  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const input = parsed.data;
  const workaround = input.workaround?.trim() ? input.workaround.trim() : null;
  let newId: string;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createLooseClient();
      const user = await ensureAnonUser(supabase);

      await supabase
        .from("profiles")
        .update({ display_name: input.name })
        .eq("id", user.id);

      const { data, error } = await supabase
        .from("problems")
        .insert({
          author_id: user.id,
          title: deriveTitle(input.problem),
          description: input.problem,
          category: classifyCategory(`${input.problem} ${workaround ?? ""}`),
          frequency: input.frequency,
          pain_level: input.pain_level,
          current_workaround: workaround,
        })
        .select("id")
        .single();

      if (error || !data) {
        console.error("[problemforge] postProblem insert error:", error);
        return {
          ok: false,
          error: "Could not save that right now. Please try again in a moment.",
        };
      }
      newId = data.id;
    } catch (err) {
      console.error("[problemforge] postProblem failed:", err);
      return {
        ok: false,
        error: "Could not save that right now. Please try again in a moment.",
      };
    }
  } else {
    newId = localAddProblem({ ...input, workaround: workaround ?? undefined }).id;
  }

  rememberName(input.name);
  revalidatePath("/");
  revalidatePath("/problems");
  redirect(`/problems/${newId}?posted=1`);
}

export interface MeTooResult {
  ok: boolean;
  voted: boolean;
  count: number;
  error?: string;
}

export async function toggleMeToo(problemId: string): Promise<MeTooResult> {
  const voted = readVotedIds();
  const wasVoted = voted.has(problemId);

  if (isSupabaseConfigured()) {
    try {
      const supabase = createLooseClient();
      await ensureAnonUser(supabase);
      const { data, error } = await supabase.rpc("toggle_me_too", {
        target_problem_id: problemId,
      });
      if (error || !data) {
        console.error("[problemforge] toggleMeToo rpc error:", error);
        return {
          ok: false,
          voted: wasVoted,
          count: 0,
          error: "Could not update that. Please try again.",
        };
      }
      const result = data as unknown as { validated: boolean; me_too_count: number };
      if (result.validated) voted.add(problemId);
      else voted.delete(problemId);
      writeVoted(voted);
      revalidatePath(`/problems/${problemId}`);
      revalidatePath("/problems");
      return { ok: true, voted: result.validated, count: result.me_too_count };
    } catch (err) {
      console.error("[problemforge] toggleMeToo failed:", err);
      return { ok: false, voted: wasVoted, count: 0, error: "Could not update that. Please try again." };
    }
  }

  const delta: 1 | -1 = wasVoted ? -1 : 1;
  const count = localSetMeToo(problemId, delta);
  if (wasVoted) voted.delete(problemId);
  else voted.add(problemId);
  writeVoted(voted);
  revalidatePath(`/problems/${problemId}`);
  revalidatePath("/problems");
  return { ok: true, voted: !wasVoted, count };
}

export async function addComment(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const problemId = String(formData.get("problem_id") ?? "");
  const parsed = newCommentSchema.safeParse({
    name: formData.get("name"),
    content: formData.get("content"),
  });

  if (!problemId) {
    return { ok: false, error: "Missing problem reference." };
  }
  if (!parsed.success) {
    return { ok: false, fieldErrors: flattenFieldErrors(parsed.error) };
  }

  const input = parsed.data;

  if (isSupabaseConfigured()) {
    try {
      const supabase = createLooseClient();
      const user = await ensureAnonUser(supabase);
      await supabase
        .from("profiles")
        .update({ display_name: input.name })
        .eq("id", user.id);
      const { error } = await supabase.from("problem_comments").insert({
        problem_id: problemId,
        author_id: user.id,
        content: input.content,
      });
      if (error) {
        console.error("[problemforge] addComment insert error:", error);
        return { ok: false, error: "That comment did not save. Please try again." };
      }
    } catch (err) {
      console.error("[problemforge] addComment failed:", err);
      return { ok: false, error: "That comment did not save. Please try again." };
    }
  } else {
    const added = localAddComment(problemId, input);
    if (!added) return { ok: false, error: "That problem no longer exists." };
  }

  rememberName(input.name);
  revalidatePath(`/problems/${problemId}`);
  return { ok: true };
}
