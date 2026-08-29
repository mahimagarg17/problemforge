import { Container } from "@/components/site/Container";
import { Skeleton } from "@/components/ui/Skeleton";

export default function LoadingProblem() {
  return (
    <Container className="py-14 sm:py-20">
      <span className="sr-only" role="status">
        Loading problem
      </span>

      <Skeleton className="h-4 w-28" />

      <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,42rem)_1fr] lg:gap-x-16">
        <div>
          <Skeleton className="h-3 w-52" />
          <Skeleton className="mt-4 h-9 w-full" />
          <Skeleton className="mt-2 h-9 w-3/4" />

          <div className="mt-8 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="mt-10 border-t border-line pt-8">
            <Skeleton className="h-11 w-52 rounded-md" />
          </div>

          <div className="mt-12 space-y-8">
            <Skeleton className="h-6 w-32" />
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 hidden lg:mt-1 lg:block">
          <Skeleton className="h-3 w-40" />
          <div className="mt-5 space-y-5 border-t border-line-soft pt-5">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-5 w-full" />
                <Skeleton className="h-3 w-24" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </Container>
  );
}
