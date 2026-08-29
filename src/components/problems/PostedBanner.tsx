"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function Check() {
  return (
    <span className="pf-pop flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-moss text-canvas">
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}

export function PostedBanner({ category }: { category: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    // Clean the ?posted=1 from the URL so a refresh doesn't replay the state.
    const timer = window.setTimeout(() => {
      router.replace(pathname, { scroll: false });
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [router, pathname]);

  if (!visible) return null;

  return (
    <div
      role="status"
      className="pf-rise mt-6 flex items-start gap-4 rounded-md border border-moss-line bg-moss-wash px-5 py-4"
    >
      <Check />
      <div className="flex-1">
        <p className="font-display text-lg text-ink">Your problem is out there.</p>
        <p className="mt-1 text-sm text-ink-muted">
          Now other people can recognize it, share what they know, or start
          building. Check back in a bit.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <Link
            href={`/problems?category=${category}`}
            className="font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-vermillion"
          >
            Browse similar problems
          </Link>
          <Link
            href="/problems/new"
            className="text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
          >
            Post another
          </Link>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setVisible(false)}
        aria-label="Dismiss"
        className="shrink-0 rounded p-1 text-ink-faint transition-colors hover:text-ink"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M18 6 6 18M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
