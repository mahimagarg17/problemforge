import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { ProblemRow } from "@/components/problems/ProblemRow";
import { listProblems } from "@/lib/problems/data";
import { readVotedIds } from "@/lib/problems/cookies";
import {
  CATEGORY_FILTERS,
  CATEGORY_META,
  categoryColor,
  categoryLabel,
} from "@/lib/problems/labels";
import type { ProblemCategory } from "@/lib/problems/types";

export const metadata: Metadata = {
  title: "Browse problems",
  description: "Real problems people haven't found a good solution to.",
};

export const revalidate = 0;

function isCategory(value: string | undefined): value is ProblemCategory {
  return Boolean(value && value in CATEGORY_META);
}

export default async function ProblemsPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const active = isCategory(searchParams.category)
    ? searchParams.category
    : undefined;

  const [problems, voted] = await Promise.all([
    listProblems(active ? { category: active } : {}),
    readVotedIds(),
  ]);

  return (
    <Container className="py-14 sm:py-20">
      <div className="pf-rise flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-readable">
          <h1 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
            Problems people are dealing with
          </h1>
          <p className="mt-3 text-lg leading-relaxed text-ink-muted">
            Read through them. If one sounds familiar, say so and add what you
            know.
          </p>
          {problems.length > 0 && (
            <p className="mt-2 text-sm text-ink-faint">
              {problems.length} {problems.length === 1 ? "problem" : "problems"}
              {active ? ` in ${categoryLabel(active).toLowerCase()}` : ""}
            </p>
          )}
          {/* Honest disclosure while any founder-seeded starters are on the board. */}
          {problems.some((p) => p.is_seed) && (
            <p className="mt-4 text-sm text-ink-muted">
              Early days. A few starter problems (marked{" "}
              <span className="font-semibold uppercase tracking-[0.1em] text-ink-faint">
                Starter
              </span>
              ) show what belongs here. The rest are from people like you. Add
              yours.
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

      <div className="mt-10 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-x-12">
        <nav
          aria-label="Filter by category"
          className="lg:sticky lg:top-24 lg:self-start"
        >
          <p className="mb-3 hidden text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint lg:block">
            Category
          </p>
          <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
            <FilterChip href="/problems" isActive={!active}>
              All problems
            </FilterChip>
            {CATEGORY_FILTERS.map((filter) => (
              <FilterChip
                key={filter.value}
                href={`/problems?category=${filter.value}`}
                isActive={active === filter.value}
                dot={categoryColor(filter.value)}
              >
                {filter.label}
              </FilterChip>
            ))}
          </div>
        </nav>

        <div className="mt-10 lg:mt-0">
          {problems.length === 0 ? (
            <div className="pf-rise border-t border-line pt-12">
              <p className="font-display text-2xl text-ink">Nothing here yet.</p>
              <p className="mt-2 max-w-md text-ink-muted">
                {active
                  ? `No one has posted a ${categoryLabel(active).toLowerCase()} problem yet. If something has been bugging you, this is the place.`
                  : "No one has posted a problem yet. If something has been bugging you and you can't find a good fix, put it here."}
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
          )}
        </div>
      </div>
    </Container>
  );
}

function FilterChip({
  href,
  isActive,
  dot,
  children,
}: {
  href: string;
  isActive: boolean;
  dot?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm transition-[transform,background-color,border-color,color] duration-200 active:scale-95 lg:w-full lg:justify-start " +
        (isActive
          ? "border-ink bg-ink text-canvas"
          : "border-line-strong text-ink-muted hover:border-ink hover:text-ink")
      }
    >
      {dot && (
        <span
          aria-hidden="true"
          className="h-[7px] w-[7px] shrink-0 rounded-full"
          style={{ backgroundColor: isActive ? "currentColor" : dot }}
        />
      )}
      {children}
    </Link>
  );
}
