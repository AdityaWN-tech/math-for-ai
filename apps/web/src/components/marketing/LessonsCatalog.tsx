"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { getCompletedCount, isLessonComplete } from "@/lib/progress";
import type { LessonCatalogEntry } from "@/lib/lesson-types";

interface LessonsCatalogProps {
  phases: [number, LessonCatalogEntry[]][];
}

export function LessonsCatalog({ phases }: LessonsCatalogProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [totalDone, setTotalDone] = useState(0);

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const [, lessons] of phases) {
      for (const l of lessons) {
        map[l.id] = isLessonComplete(l.id);
      }
    }
    setCompleted(map);
    setTotalDone(getCompletedCount());
  }, [phases]);

  return (
    <>
      <p className="mt-2 font-mono text-sm text-[var(--ink-mute)]">
        {totalDone} lesson{totalDone === 1 ? "" : "s"} completed locally
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
                    {completed[lesson.id] && (
                      <span className="ml-2 font-mono text-[10px] text-[var(--blueprint)]">✓ done</span>
                    )}
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
    </>
  );
}
