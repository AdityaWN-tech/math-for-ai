import Link from "next/link";
import { ProgressHUD } from "@/components/gamification/ProgressHUD";

export function ArcadeHeader({ crumb }: { crumb?: { href: string; label: string } }) {
  return (
    <header className="sticky top-0 z-30 border-b border-[var(--rule-soft)] bg-[var(--header-bg)] backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <nav className="flex min-w-0 items-center gap-3 font-mono text-xs">
          <Link href="/" className="font-display text-xl text-[var(--blueprint)]">
            Math for AI
          </Link>
          <span className="text-[var(--ink-mute)]">/</span>
          <Link href="/arcade" className="hover:text-[var(--blueprint)]">
            Arcade
          </Link>
          {crumb && (
            <>
              <span className="text-[var(--ink-mute)]">/</span>
              <Link href={crumb.href} className="truncate hover:text-[var(--blueprint)]">
                {crumb.label}
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          <Link
            href="/arcade/trophies"
            className="hidden font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)] hover:text-[var(--blueprint)] sm:block"
          >
            Trophy room
          </Link>
          <ProgressHUD />
        </div>
      </div>
    </header>
  );
}
