import Link from "next/link";
import { Container } from "@/components/site/Container";

export default function ProblemNotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="pf-rise font-display text-3xl text-ink">
        We couldn&apos;t find that one
      </p>
      <p className="mx-auto mt-3 max-w-sm text-ink-muted">
        The problem you&apos;re looking for may have been removed, or the link is
        wrong.
      </p>
      <Link
        href="/problems"
        className="group mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-5 py-3 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
      >
        See all problems{" "}
        <span
          aria-hidden="true"
          className="transition-transform duration-200 group-hover:translate-x-0.5"
        >
          →
        </span>
      </Link>
    </Container>
  );
}
