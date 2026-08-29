"use client";

import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

/**
 * Reveals its children with a small fade + rise the first time they scroll
 * into view. Renders visible immediately under prefers-reduced-motion or when
 * IntersectionObserver is unavailable. Meant for below-the-fold content.
 */
export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduced || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={
        { transitionDelay: shown ? `${delay}ms` : undefined } as CSSProperties
      }
      className={cn("pf-reveal", shown && "pf-reveal-in", className)}
    >
      {children}
    </div>
  );
}
