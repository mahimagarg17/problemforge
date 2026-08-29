import Link from "next/link";
import { Container } from "@/components/site/Container";
import { ProblemRow } from "@/components/problems/ProblemRow";
import type { Problem } from "@/lib/problems/types";

export function ExampleProblems({
  problems,
  votedIds,
  hasRealData,
}: {
  problems: Problem[];
  votedIds: Set<string>;
  hasRealData: boolean;
}) {
  if (problems.length === 0) return null;

  const totalPeople = problems.reduce((sum, p) => sum + p.me_too_count, 0);

  return (
    <section className="border-b border-line">
      <Container className="py-14 sm:py-20">
        <div className="lg:grid lg:grid-cols-[minmax(0,19rem)_1fr] lg:gap-x-16">
          <div className="lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-balance font-display text-3xl leading-tight text-ink sm:text-4xl">
              Someone else might be dealing with it too.
            </h2>
            <p className="mt-4 max-w-readable text-lg leading-relaxed text-ink-muted">
              Some problems are more common than you&apos;d think. Find people who
              have the same one, share what you know, or spot something worth
              building.
            </p>
            {hasRealData && totalPeople > 0 && (
              <p className="mt-4 text-sm text-ink-faint">
                {totalPeople.toLocaleString()} people have said &ldquo;me
                too&rdquo; to the ones here.
              </p>
            )}
          </div>

          <div className="mt-10 lg:mt-0">
            <div className="divide-y divide-line border-t border-line">
              {problems.map((problem, i) => (
                <ProblemRow
                  key={problem.id}
                  problem={problem}
                  initialVoted={votedIds.has(problem.id)}
                  index={i}
                />
              ))}
            </div>
            <div className="mt-8">
              <Link
                href="/problems"
                className="group inline-flex items-center gap-1.5 text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-vermillion"
              >
                See everything people have posted
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
