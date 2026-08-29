import Link from "next/link";
import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";

export function FinalCta() {
  return (
    <section className="border-t border-line">
      <Container className="py-16 sm:py-24">
        <Reveal>
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vermillion">
              Your turn
            </p>
            <h2 className="mt-5 text-balance font-display text-3xl leading-tight text-ink sm:text-[2.75rem]">
              What&apos;s something that should be easier?
            </h2>
            <p className="mt-4 text-lg text-ink-muted">
              Put the problem out there. You never know who might have the
              answer.
            </p>
            <Link
              href="/problems/new"
              className="group mt-8 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
            >
              Post a problem{" "}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
            <p className="mt-4 text-sm text-ink-faint">
              No account, no email. It takes about a minute.
            </p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
