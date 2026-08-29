import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-line">
      <div className="mx-auto flex max-w-shell flex-col gap-4 px-6 py-10 text-sm text-ink-muted sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p className="font-display text-base text-ink">ProblemForge</p>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link href="/problems" className="transition-colors hover:text-ink">
            Browse problems
          </Link>
          <Link href="/how-it-works" className="transition-colors hover:text-ink">
            How it works
          </Link>
          <Link href="/#why" className="transition-colors hover:text-ink">
            Why it exists
          </Link>
          <Link href="/problems/new" className="transition-colors hover:text-ink">
            Post a problem
          </Link>
        </nav>
      </div>
    </footer>
  );
}
