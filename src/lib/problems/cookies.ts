import { cookies } from "next/headers";

export const NAME_COOKIE = "pf_name";
export const VOTED_COOKIE = "pf_voted";
export const COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Prefill the name field with whatever this browser used last time. */
export function getRememberedName(): string {
  return cookies().get(NAME_COOKIE)?.value ?? "";
}

export function readVotedIds(): Set<string> {
  const raw = cookies().get(VOTED_COOKIE)?.value ?? "";
  return new Set(raw.split(",").filter(Boolean));
}

export function hasVotedLocally(problemId: string): boolean {
  return readVotedIds().has(problemId);
}
