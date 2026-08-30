import Link from "next/link";
import type { CSSProperties } from "react";
import { MeTooButton } from "./MeTooButton";
import { CategoryTag } from "./CategoryTag";
import { categoryColor, frequencyLabel } from "@/lib/problems/labels";
import type { Problem } from "@/lib/problems/types";

export function ProblemRow({
  problem,
  initialVoted,
  index = 0,
}: {
  problem: Problem;
  initialVoted: boolean;
  index?: number;
}) {
  return (
    <div
      style={{ "--pf-i": Math.min(index, 6) } as CSSProperties}
      className="group pf-stagger relative -mx-4 rounded-md px-4 py-7 transition-colors duration-200 hover:bg-line-soft/60 sm:py-8"
    >
      <span
        aria-hidden="true"
        className="absolute inset-y-4 left-0 w-[3px] origin-top scale-y-0 rounded-full opacity-0 transition-all duration-200 ease-out group-hover:scale-y-100 group-hover:opacity-100"
        style={{ backgroundColor: categoryColor(problem.category) }}
      />

      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs">
        <span className="font-semibold uppercase tracking-[0.1em] text-ink-muted">
          {frequencyLabel(problem.frequency)}
        </span>
        <span aria-hidden="true" className="text-line-strong">
          ·
        </span>
        <CategoryTag
          category={problem.category}
          className="text-[11px] font-medium tracking-[0.1em] opacity-90"
        />
        {problem.is_seed && (
          <>
            <span aria-hidden="true" className="text-line-strong">
              ·
            </span>
            <span className="rounded-full border border-line-strong px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.1em] text-ink-faint">
              Starter
            </span>
          </>
        )}
      </div>

      <h3 className="mt-3 text-pretty break-anywhere font-display text-xl leading-snug text-ink sm:text-[1.55rem]">
        <Link
          href={`/problems/${problem.id}`}
          className="transition-[color,transform] duration-200 after:absolute after:inset-0 group-hover:text-vermillion"
        >
          {problem.title}
          <span
            aria-hidden="true"
            className="ml-1.5 inline-block -translate-x-1 text-ink-faint opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:text-vermillion group-hover:opacity-100"
          >
            →
          </span>
        </Link>
      </h3>

      <div className="relative z-10 mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        <MeTooButton
          compact
          problemId={problem.id}
          initialCount={problem.me_too_count}
          initialVoted={initialVoted}
        />
        {problem.comments_count > 0 && (
          <Link
            href={`/problems/${problem.id}#replies`}
            className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            {problem.comments_count}{" "}
            {problem.comments_count === 1 ? "conversation" : "conversations"}
          </Link>
        )}
      </div>
    </div>
  );
}
