import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { ProblemRow } from "@/components/problems/ProblemRow";
import { listMyProblems } from "@/lib/problems/data";
import { readVotedIds } from "@/lib/problems/cookies";

export const metadata: Metadata = {
  title: "My problems",
  description: "Problems you've posted from this browser.",
  robots: { index: false, follow: true },
};

export const revalidate = 0;

export default async function MyProblemsPage() {
  const [problems, voted] = await Promise.all([
    listMyProblems(),
    readVotedIds(),
  ]);

  return (
    <Container className="py-14 sm:py-20">
      <div className="pf-rise flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-readable">
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            Problems you&apos;ve posted
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-muted">
            Come back here to see if anyone responded. There&apos;s no
            account &mdash; this is just whatever this browser has posted.
          </p>
          {problems.length > 0 && (
            <p className="mt-2 text-sm text-ink-faint">
              {problems.length} {problems.length === 1 ? "problem" : "problems"}
            </p>
          )}
        </div>
        <Link
          href="/problems/new"
          className="group inline-flex shrink-0 items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
        >
          Post a problem{" "}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
      </div>

      <div className="mt-10">
        {problems.length === 0 ? (
          <div className="pf-rise border-t border-line pt-12">
            <p className="font-display text-2xl text-ink">
              Nothing here yet.
            </p>
            <p className="mt-2 max-w-md text-ink-muted">
              Problems you post from this browser will show up here, with
              replies and &ldquo;I have this too&rdquo; counts, so you can
              check back without digging for the link.
            </p>
            <Link
              href="/problems/new"
              className="group mt-6 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
            >
              Post a problem{" "}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        ) : (
          <>
            <div className="divide-y divide-line border-t border-line">
              {problems.map((problem, i) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  initialVoted={voted.has(problem.id)}
                  index={i}
                />
              ))}
            </div>
            <p className="mt-10 max-w-md text-sm text-ink-faint">
              This list is tied to this browser, not an account. Clearing
              cookies or switching devices will lose it.
            </p>
          </>
        )}
      </div>
    </Container>
  );
}
