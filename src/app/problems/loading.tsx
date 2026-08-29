import { Container } from "@/components/site/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LoadingProblems() {
  return (
    <Container className="py-14 sm:py-20">
      <span className="sr-only" role="status">
        Loading problems
      </span>

      <Skeleton className="h-9 w-72 max-w-full" />
      <Skeleton className="mt-4 h-5 w-96 max-w-full" />

      <div className="mt-10 lg:grid lg:grid-cols-[15rem_1fr] lg:gap-x-12">
        <div className="flex flex-wrap gap-2 lg:flex-col lg:gap-1.5">
          {[72, 64, 60, 80, 56, 68, 76].map((w, i) => (
            <Skeleton
              key={i}
              className="h-8 rounded-full lg:w-full"
              style={{ width: w }}
            />
          ))}
        </div>

        <div className="mt-10 divide-y divide-line border-t border-line lg:mt-0">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="py-8">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="mt-3 h-6 w-full max-w-xl" />
              <Skeleton className="mt-2 h-6 w-2/3 max-w-md" />
              <Skeleton className="mt-4 h-8 w-44 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
}
