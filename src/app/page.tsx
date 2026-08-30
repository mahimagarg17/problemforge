import { Hero } from "@/components/landing/Hero";
import { ExampleProblems } from "@/components/landing/ExampleProblems";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { WhyItExists } from "@/components/landing/WhyItExists";
import { FinalCta } from "@/components/landing/FinalCta";
import {
  isLowQualityProblem,
  listExampleProblems,
  listProblems,
} from "@/lib/problems/data";
import { readVotedIds } from "@/lib/problems/cookies";

export const revalidate = 0;

export default async function HomePage() {
  const [examples, recent] = await Promise.all([
    listExampleProblems(3),
    listProblems(),
  ]);
  const votedIds = readVotedIds();
  const hasRealData = recent.length > 0;

  // Newest few for the hero rail, minus obvious test / junk rows. Falls back to
  // the seed examples when the database is still empty.
  const cleanRecent = recent.filter((p) => !isLowQualityProblem(p));
  const ledger = (cleanRecent.length > 0 ? cleanRecent : examples).slice(0, 3);

  return (
    <>
      <Hero ledger={ledger} hasRealData={hasRealData} />
      <ExampleProblems
        problems={examples}
        votedIds={votedIds}
        hasRealData={hasRealData}
      />
      <HowItWorks />
      <WhyItExists />
      <FinalCta />
    </>
  );
}
