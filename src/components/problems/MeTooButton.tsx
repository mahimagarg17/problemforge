"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toggleMeToo } from "@/app/problems/actions";
import { cn } from "@/lib/utils";

function MeTooIcon({ voted }: { voted: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {voted ? <path d="M20 6 9 17l-5-5" /> : <path d="M12 5v14M5 12h14" />}
    </svg>
  );
}

export function MeTooButton({
  problemId,
  initialCount,
  initialVoted,
  compact = false,
}: {
  problemId: string;
  initialCount: number;
  initialVoted: boolean;
  compact?: boolean;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const changed = useRef(false);
  // Synchronous guard: a double-click / double-tap fires two click events in
  // the same tick, before `pending` has flipped. This blocks the second one.
  const inFlight = useRef(false);

  useEffect(() => {
    if (voted !== initialVoted) changed.current = true;
  }, [voted, initialVoted]);

  function handleClick() {
    if (inFlight.current || pending) return;
    inFlight.current = true;
    setError(null);

    const prevVoted = voted;
    const prevCount = count;
    const nextVoted = !prevVoted;
    changed.current = true;

    // Optimistic hint only. The server response below is the source of truth.
    setVoted(nextVoted);
    setCount(Math.max(0, prevCount + (nextVoted ? 1 : -1)));

    startTransition(async () => {
      try {
        const result = await toggleMeToo(problemId);
        if (!result.ok) {
          setVoted(prevVoted);
          setCount(prevCount);
          setError(
            result.error ?? "That didn't go through. Try again in a moment.",
          );
          return;
        }
        // Authoritative values from the database.
        setVoted(result.voted);
        setCount(result.count);
      } finally {
        inFlight.current = false;
      }
    });
  }

  const label = voted
    ? compact
      ? "You have this too"
      : "You have this problem too"
    : compact
      ? "I have this too"
      : "I have this problem too";

  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1.5", !compact && "gap-x-4")}>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={voted}
        aria-busy={pending}
        className={cn(
          "group/metoo inline-flex items-center gap-2 rounded-md border font-medium",
          "transition-[transform,background-color,border-color,color] duration-200 ease-out",
          "active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-80",
          compact ? "px-3 py-1.5 text-xs" : "px-5 py-3 text-sm",
          voted
            ? "border-vermillion bg-vermillion text-canvas"
            : "border-line-strong bg-paper text-ink hover:border-ink hover:bg-canvas",
        )}
      >
        <span key={voted ? "on" : "off"} className={cn(changed.current && "pf-pop")}>
          <MeTooIcon voted={voted} />
        </span>
        <span>{label}</span>
      </button>

      <p className="text-sm text-ink-muted" aria-live="polite">
        <span
          key={count}
          className={cn("inline-block font-medium text-ink", changed.current && "pf-tick")}
        >
          {count.toLocaleString()}
        </span>{" "}
        {count === 1 ? "person" : "people"}
        {!compact && (voted ? ", including you" : " so far")}
      </p>

      {voted && !compact && !error && (
        <p className="pf-rise w-full text-sm text-moss">You&apos;re not the only one.</p>
      )}

      {error && (
        <p role="status" className="pf-rise w-full text-sm text-vermillion-dark">
          {error}
        </p>
      )}
    </div>
  );
}
