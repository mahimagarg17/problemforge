import type { ProblemCategory } from "@/lib/problems/types";
import {
  categoryColor,
  categoryLabel,
  categoryTextColor,
} from "@/lib/problems/labels";
import { cn } from "@/lib/utils";

export function CategoryTag({
  category,
  className,
}: {
  category: ProblemCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-ink-muted",
        className,
      )}
      style={{ color: categoryTextColor(category) }}
    >
      <span
        aria-hidden="true"
        className="h-[7px] w-[7px] shrink-0 rounded-full"
        style={{ backgroundColor: categoryColor(category) }}
      />
      {categoryLabel(category)}
    </span>
  );
}
