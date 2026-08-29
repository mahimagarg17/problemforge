import { Container } from "@/components/site/Container";
import { Reveal } from "@/components/site/Reveal";

export function WhyItExists() {
  return (
    <section id="why" className="scroll-mt-20 border-b border-line bg-paper">
      <Container className="py-16 sm:py-24">
        <Reveal>
          <div className="grid gap-10 lg:grid-cols-[1fr_0.8fr] lg:items-start lg:gap-16">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-vermillion">
                Why it exists
              </p>
              <p className="mt-6 text-balance font-display text-3xl leading-[1.15] text-ink sm:text-4xl lg:text-[2.75rem]">
                Good solutions start with real problems.
              </p>
            </div>

            <div className="max-w-readable space-y-4 text-lg leading-relaxed text-ink-muted lg:pt-2">
              <p>
                Most useful products begin with someone noticing that something
                doesn&apos;t work as well as it should.
              </p>
              <p>ProblemForge makes those problems easier to find.</p>
              <p className="text-ink">
                Maybe someone has the answer. Maybe someone can improve it. Maybe
                someone builds something new.
              </p>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
