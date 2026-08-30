import { cn } from "@/lib/utils";

/**
 * Small "N characters left" indicator for a text field. Stays hidden until the
 * field is `showAt` full (default 60%), then turns muted as the limit nears and
 * vermillion once it is passed.
 */
export function CharCounter({
  id,
  current,
  max,
  showAt = 0.6,
  className,
}: {
  id?: string;
  current: number;
  max: number;
  showAt?: number;
  className?: string;
}) {
  const remaining = max - current;
  const over = remaining < 0;
  const close = !over && remaining <= 150;

  if (current < max * showAt) return null;

  return (
    <span
      id={id}
      className={cn(
        "mt-1.5 block text-right text-xs tabular-nums",
        over
          ? "font-medium text-vermillion-dark"
          : close
            ? "text-ink-muted"
            : "text-ink-faint",
        className,
      )}
    >
      {over
        ? `${Math.abs(remaining).toLocaleString()} over the ${max.toLocaleString()} limit`
        : `${remaining.toLocaleString()} characters left`}
    </span>
  );
}
