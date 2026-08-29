import { painColor, painLabel } from "@/lib/problems/labels";

/** A small 5-dot frustration indicator. Decorative colour + a text label for a11y. */
export function PainDots({ level }: { level: number }) {
  const filled = Math.max(0, Math.min(5, Math.round(level)));
  return (
    <span
      className="inline-flex items-center gap-1.5"
      title={`${painLabel(level)} (${filled}/5)`}
    >
      <span aria-hidden="true" className="flex items-center gap-[3px]">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className="h-[6px] w-[6px] rounded-full"
            style={{
              backgroundColor: n <= filled ? painColor(level) : "#E5E0D8",
            }}
          />
        ))}
      </span>
      <span className="text-ink-muted">{painLabel(level).toLowerCase()}</span>
    </span>
  );
}
