import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyItExists } from "@/components/landing/WhyItExists";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "ProblemForge is a public place for real problems that don't have a good solution yet. Here's the idea.",
};

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-line">
        <Container className="py-12 sm:py-16">
          <div className="pf-rise max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vermillion">
              How it works
            </p>
            <h1 className="mt-5 text-balance font-display text-4xl leading-[1.1] text-ink sm:text-5xl">
              A place for problems that don&apos;t have a good solution yet.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-ink-muted">
              You&apos;re dealing with something that doesn&apos;t work well, and
              you can&apos;t find a good fix. You describe it here. People who
              have the same problem can say so and share what they know, and
              someone might see a reason to build something better.
            </p>
          </div>
        </Container>
      </section>

      <HowItWorks />
      <WhyItExists />

      <section>
        <Container className="py-14 sm:py-20">
          <div className="max-w-2xl">
            <h2 className="text-balance font-display text-2xl text-ink sm:text-3xl">
              That&apos;s the whole thing.
            </h2>
            <p className="mt-3 text-lg text-ink-muted">
              No account, no email. It takes about a minute.
            </p>
            <Link
              href="/problems/new"
              className="group mt-7 inline-flex items-center gap-2 rounded-md bg-ink px-6 py-3.5 text-sm font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.98]"
            >
              Post a problem{" "}
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
