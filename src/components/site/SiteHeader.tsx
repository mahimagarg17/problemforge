import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/80 bg-canvas/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-shell items-center justify-between px-6 lg:px-10">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight text-ink transition-colors hover:text-vermillion"
        >
          ProblemForge
        </Link>

        <nav className="flex items-center gap-4 text-sm sm:gap-6">
          <Link
            href="/problems"
            className="text-ink-muted transition-colors hover:text-ink"
          >
            <span className="sm:hidden">Browse</span>
            <span className="hidden sm:inline">Browse problems</span>
          </Link>
          <Link
            href="/how-it-works"
            className="hidden text-ink-muted transition-colors hover:text-ink sm:inline"
          >
            How it works
          </Link>
          <Link
            href="/problems/new"
            className="group inline-flex items-center gap-1.5 rounded-md bg-ink px-3 py-2 text-[13px] font-medium text-canvas transition-[transform,background-color] duration-200 hover:bg-vermillion active:scale-[0.97] sm:px-3.5 sm:text-sm"
          >
            Post a problem{" "}
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            >
              →
            </span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
