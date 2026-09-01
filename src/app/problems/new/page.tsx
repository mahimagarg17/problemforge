import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { PostProblemForm } from "@/components/problems/PostProblemForm";
import { getRememberedName } from "@/lib/problems/cookies";

export const metadata: Metadata = {
  title: "Post a problem",
  description:
    "Describe a problem you haven't found a good solution to. You don't need to know how to fix it.",
};

export const revalidate = 0;

const TIPS = [
  {
    title: "You don't need a fix.",
    body: "Just explain the problem clearly. Someone else can take it from there.",
  },
  {
    title: "Be concrete.",
    body: "What actually happens, and when? A real example helps people recognize it.",
  },
  {
    title: "Say what you've tried.",
    body: "Even if it barely helps. It tells people where the gap is.",
  },
];

export default function NewProblemPage() {
  const defaultName = getRememberedName();
  // The optional "notify me" field only makes sense when the server can
  // actually store it (service role configured).
  const notificationsAvailable = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);

  return (
    <Container className="py-14 sm:py-20">
      <Link
        href="/"
        className="text-sm text-ink-muted underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-ink"
      >
        ← Back
      </Link>

      <div className="pf-rise mt-6 max-w-2xl">
        <h1 className="text-balance font-display text-3xl leading-tight text-ink sm:text-4xl">
          Tell us about a problem that doesn&apos;t have a good solution.
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-ink-muted">
          Describe what happens, why it bothers you, and what you&apos;ve tried.
          You don&apos;t need to know how to fix it.
        </p>
      </div>

      <div className="mt-12 lg:grid lg:grid-cols-[minmax(0,36rem)_1fr] lg:gap-x-16">
        <PostProblemForm
          defaultName={defaultName}
          notificationsAvailable={notificationsAvailable}
        />

        <aside className="mt-14 hidden lg:mt-0 lg:block">
          <div className="lg:sticky lg:top-24">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint">
              A good problem post
            </p>
            <ul className="mt-5 space-y-6 border-t border-line-soft pt-5">
              {TIPS.map((tip) => (
                <li key={tip.title}>
                  <p className="font-display text-lg text-ink">{tip.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {tip.body}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </Container>
  );
}
