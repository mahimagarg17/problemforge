import Link from "next/link";
import type { CSSProperties } from "react";
import { Container } from "@/components/site/Container";
import { categoryColor, timeAgo } from "@/lib/problems/labels";
import type { Problem } from "@/lib/problems/types";

const step = (i: number) => ({ "--pf-i": i }) as CSSProperties;

export function Hero({
  ledger,
  hasRealData,
}: {
  ledger: Problem[];
  hasRealData: boolean;
}) {
  return (
    <section className="border-b border-line">
      <Container className="py-14 sm:py-20 lg:py-24">
        <div className="flex flex-col gap-14 lg:grid lg:grid-cols-[1.15fr_0.9fr] lg:items-center lg:gap-16">
          <div className="min-w-0 max-w-2xl">
            <p
              style={step(0)}
              className="pf-stagger mb-6 text-sm font-semibold uppercase tracking-[0.18em] text-vermillion"
            >
              Problems worth solving
            </p>
            <h1
              style={step(1)}
              className="pf-stagger text-balance font-display text-4xl leading-[1.08] text-ink sm:text-5xl lg:text-[3.5rem]"
            >
              Have a problem nobody has solved well yet?
            </h1>
            <p
              style={step(2)}
              className="text-pretty mt-6 max-w-readable text-lg leading-relaxed text-ink-muted pf-stagger"
            >
              Tell us what you&apos;re dealing with. Someone who has been there
              might know something you don&apos;t. Or someone might see the
              problem and build a better solution.
            </p>
            <div
              style={step(3)}
              className="pf-stagger mt-9 flex flex-wrap items-center gap-x-6 gap-y-3"
            >
              <Link
                href="/problems/new"
                className="group inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
              >
                Post a problem{" "}
                <span
                  aria-hidden="true"
                  className="transition-transform duration-200 group-hover:translate-x-0.5"
                >
                  →
                </span>
              </Link>
              <Link
                href="/problems"
                className="text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-vermillion"
              >
                Browse problems
              </Link>
            </div>
            <p style={step(4)} className="pf-stagger mt-8 text-sm text-ink-faint">
              Put it out there. Someone might recognize it. Someone might build
              for it.
            </p>
          </div>

          {ledger.length > 0 && (
            <aside className="min-w-0 lg:border-l lg:border-line lg:pl-10">
              <p className="mb-5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-faint">
                {hasRealData ? "Lately on the board" : "A few to give you the idea"}
              </p>
              <ul className="-my-1">
                {ledger.slice(0, 3).map((problem, i) => (
                  <li
                    key={problem.id}
                    style={step(i)}
                    className="pf-stagger border-b border-line-soft last:border-0"
                  >
                    <Link
                      href={`/problems/${problem.id}`}
                      className="group -mx-3 block rounded-md px-3 py-4 transition-colors duration-200 hover:bg-line-soft/60"
                    >
                      <span className="flex items-start gap-2.5">
                        <span
                          aria-hidden="true"
                          className="mt-2 h-[7px] w-[7px] shrink-0 rounded-full"
                          style={{
                            backgroundColor: categoryColor(problem.category),
                          }}
                        />
                        <span className="break-anywhere font-display text-lg leading-snug text-ink-soft transition-colors group-hover:text-vermillion">
                          &ldquo;{problem.title}&rdquo;
                        </span>
                      </span>
                      {hasRealData && (
                        <span className="mt-1.5 block pl-[19px] text-sm text-ink-faint">
                          {problem.me_too_count > 0
                            ? `${problem.me_too_count.toLocaleString()} ${
                                problem.me_too_count === 1
                                  ? "person has"
                                  : "people have"
                              } this too`
                            : `posted ${timeAgo(problem.created_at)}`}
                          {problem.comments_count > 0 && (
                            <>
                              {" "}
                              · {problem.comments_count}{" "}
                              {problem.comments_count === 1 ? "reply" : "replies"}
                            </>
                          )}
                        </span>
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            </aside>
          )}
        </div>
      </Container>
    </section>
  );
}
