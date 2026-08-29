import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";

const STEPS = [
  {
    number: "01",
    title: "You have a problem.",
    body: "Something isn't working, and the solutions you've tried aren't good enough.",
  },
  {
    number: "02",
    title: "Put it out there.",
    body: "Describe the problem so other people can understand what you're dealing with.",
  },
  {
    number: "03",
    title: "Someone might know. Someone might build.",
    body: "People who have faced the same problem can share what they know. Someone else might see a reason to build something better.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-b border-line">
      <Container className="py-14 sm:py-20">
        <h2 className="font-display text-3xl leading-tight text-ink sm:text-4xl">
          How it works
        </h2>

        <ol className="mt-10 grid gap-10 sm:mt-14 sm:grid-cols-3 sm:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.number}>
              <Reveal delay={i * 90}>
                <div className="flex items-center gap-3">
                  <span className="font-display text-2xl text-vermillion">
                    {step.number}
                  </span>
                  {i < STEPS.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="hidden h-px flex-1 bg-line-strong sm:block"
                    />
                  )}
                </div>
                <h3 className="mt-3 font-display text-xl text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 max-w-sm leading-relaxed text-ink-muted">
                  {step.body}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
