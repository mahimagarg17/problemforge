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
      <div className="mx-auto max-w-shell border-t border-line-soft px-6 py-6 text-xs leading-relaxed text-ink-faint lg:px-10">
        Problems and replies on ProblemForge are posted by its users. We
        don&apos;t verify or guarantee that anything shared here is accurate,
        safe, or right for your situation, and it isn&apos;t professional advice.
        Use your own judgement before acting on it.
      </div>
    </footer>
  );
}
