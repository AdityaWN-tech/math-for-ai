import Link from "next/link";
import catalog from "@/content/lessons/catalog.json";
import { LessonsCatalog } from "@/components/marketing/LessonsCatalog";
import { Button } from "@/components/ui/button";
import type { LessonCatalogEntry } from "@/lib/lesson-types";

export const metadata = {
  title: "Lessons — Math for AI",
  description: "Phase 0–1 lesson catalog",
};

export default function LessonsPage() {
  const byPhase = new Map<number, LessonCatalogEntry[]>();
  for (const lesson of catalog.lessons) {
    const list = byPhase.get(lesson.phaseId) ?? [];
    list.push(lesson);
    byPhase.set(lesson.phaseId, list);
  }

  const phases = [...byPhase.entries()].sort(([a], [b]) => a - b) as [number, LessonCatalogEntry[]][];

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      <header className="mx-auto flex max-w-4xl items-center justify-between px-6 py-6">
        <Link href="/" className="font-display text-2xl text-[var(--blueprint)]">
          Math for AI
        </Link>
        <Link href="/demo">
          <Button size="sm">Start demo</Button>
        </Link>
      </header>

      <main className="mx-auto max-w-4xl px-6 pb-16">
        <h1 className="font-body text-3xl font-semibold">Lesson catalog</h1>
        <p className="mt-2 font-body text-[var(--ink-soft)]">
          Compiled from{" "}
          <a
            href="https://github.com/rohitg00/ai-engineering-from-scratch"
            className="text-[var(--blueprint)] underline"
            target="_blank"
            rel="noreferrer"
          >
            ai-engineering-from-scratch
          </a>
          . Interactive lessons include code + deploy gates.
        </p>

        <LessonsCatalog phases={phases} />
      </main>
    </div>
  );
}
