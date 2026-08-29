import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/site/Container";
import { MeTooButton } from "@/components/problems/MeTooButton";
import { Conversation } from "@/components/problems/Conversation";
import { PostedBanner } from "@/components/problems/PostedBanner";
import { CategoryTag } from "@/components/problems/CategoryTag";
import { PainDots } from "@/components/problems/PainDots";
import {
  getComments,
  getProblem,
  hasVoted,
  listProblems,
} from "@/lib/problems/data";
import { getRememberedName, hasVotedLocally } from "@/lib/problems/cookies";
import { categoryLabel, frequencyLabel, timeAgo } from "@/lib/problems/labels";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const problem = await getProblem(params.id);
  if (!problem) return { title: "Problem not found" };
  return { title: problem.title, description: problem.description.slice(0, 155) };
}

export default async function ProblemPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { posted?: string };
}) {
  const problem = await getProblem(params.id);
  if (!problem) notFound();

  const [comments, votedRemote, allProblems] = await Promise.all([
    getComments(problem.id),
    hasVoted(problem.id),
    listProblems(),
  ]);
  const others = allProblems.filter((p) => p.id !== problem.id);
  const sameCategory = others.filter((p) => p.category === problem.category);
  const related = (sameCategory.length > 0 ? sameCategory : others).slice(0, 3);
  const relatedInCategory = sameCategory.length > 0;
  const initialVoted = votedRemote || hasVotedLocally(problem.id);
  const defaultName = getRememberedName();
  const justPosted = searchParams.posted === "1";

  return (
    <Container className="py-14 sm:py-20">
      <Link
        href="/problems"
        className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
      >
        ← All problems
      </Link>

      {justPosted && (
        <div className="mx-auto max-w-2xl lg:mx-0">
          <PostedBanner category={problem.category} />
        </div>
      )}

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-x-16">
        <article className="min-w-0">
          <header
            className={
              justPosted ? "pf-new-hint -mx-3 rounded-md px-3" : "pf-rise"
            }
          >
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
              <CategoryTag category={problem.category} />
              <span aria-hidden="true" className="text-line-strong">
                ·
              </span>
              <span className="font-semibold uppercase tracking-[0.1em] text-ink-muted">
                {frequencyLabel(problem.frequency)}
              </span>
            </div>

            <h1 className="mt-3 text-balance font-display text-3xl leading-[1.15] text-ink sm:text-[2.5rem]">
              {problem.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-ink-faint">
              <span>
                by <span className="text-ink-muted">{problem.author_name}</span>
              </span>
              <span aria-hidden="true">·</span>
              <span>posted {timeAgo(problem.created_at)}</span>
              <span aria-hidden="true">·</span>
              <PainDots level={problem.pain_level} />
            </div>
          </header>

          <p className="mt-7 whitespace-pre-line text-lg leading-relaxed text-ink-soft">
            {problem.description}
          </p>

          {problem.current_workaround && (
            <div className="mt-8 border-l-2 border-line-strong pl-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                What they do about it now
              </p>
              <p className="mt-2 leading-relaxed text-ink-soft">
                {problem.current_workaround}
              </p>
            </div>
          )}

          <div className="mt-10 border-t border-line pt-8">
            <MeTooButton
              problemId={problem.id}
              initialCount={problem.me_too_count}
              initialVoted={initialVoted}
            />
          </div>

          <Conversation
            problemId={problem.id}
            initialComments={comments}
            defaultName={defaultName}
          />
        </article>

        {related.length > 0 && (
          <aside className="mt-14 lg:mt-1">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
                {relatedInCategory
                  ? `More ${categoryLabel(problem.category).toLowerCase()} problems`
                  : "More problems people posted"}
              </h2>
              <ul className="mt-5 divide-y divide-line-soft border-t border-line-soft">
                {related.map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/problems/${p.id}`}
                      className="group -mx-3 flex flex-col gap-1 rounded-md px-3 py-4 transition-colors hover:bg-line-soft/60"
                    >
                      <span className="font-display text-lg leading-snug text-ink transition-colors group-hover:text-vermillion">
                        {p.title}
                      </span>
                      <span className="text-sm text-ink-faint">
                        {p.me_too_count.toLocaleString()}{" "}
                        {p.me_too_count === 1 ? "person has" : "people have"} this
                        too
                        {p.comments_count > 0 && (
                          <>
                            {" "}
                            · {p.comments_count}{" "}
                            {p.comments_count === 1 ? "reply" : "replies"}
                          </>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </div>
    </Container>
  );
}
