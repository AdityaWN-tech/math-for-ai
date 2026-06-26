import Link from "next/link";
import catalog from "@/content/lessons/catalog.json";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Lessons — Math for AI",
  description: "Phase 0–1 lesson catalog",
};

export default function LessonsPage() {
  const byPhase = new Map<number, typeof catalog.lessons>();
  for (const lesson of catalog.lessons) {
    const list = byPhase.get(lesson.phaseId) ?? [];
    list.push(lesson);
    byPhase.set(lesson.phaseId, list);
  }

  const phases = [...byPhase.entries()].sort(([a], [b]) => a - b);

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

        {phases.map(([phaseId, lessons]) => (
          <section key={phaseId} className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-mute)]">
              Phase {String(phaseId).padStart(2, "0")} — {lessons[0]?.phaseName}
            </h2>
            <ul className="mt-4 divide-y divide-[var(--rule-soft)] rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)]">
              {lessons.map((lesson) => (
                <li key={lesson.id} className="flex items-center justify-between gap-4 px-4 py-3">
                  <div>
                    <p className="font-body font-medium">
                      {String(lesson.lessonNumber).padStart(2, "0")}. {lesson.title}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
                      {lesson.interactive ? "Interactive" : "Preview"}
                    </p>
                  </div>
                  <Link href={lesson.path}>
                    <Button variant={lesson.interactive ? "primary" : "secondary"} size="sm">
                      Open
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </main>
    </div>
  );
}
