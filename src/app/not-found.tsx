import Link from "next/link";
import { Container } from "@/components/site/Container";

export default function NotFound() {
  return (
    <Container className="py-24 text-center sm:py-32">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vermillion">
        Page not found
      </p>
      <h1 className="pf-rise mt-4 font-display text-3xl text-ink sm:text-4xl">
        That page isn&apos;t here
      </h1>
      <p className="mx-auto mt-3 max-w-sm text-ink-muted">
        The link may be old or mistyped. The board is still the best place to
        start.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-5 gap-y-3">
        <Link
          href="/problems"
          className="group inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
        >
          Browse problems{" "}
          <span
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          >
            →
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-ink underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-vermillion"
        >
          Go home
        </Link>
      </div>
    </Container>
  );
}
