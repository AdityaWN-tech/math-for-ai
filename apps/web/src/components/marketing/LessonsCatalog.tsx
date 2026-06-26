"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { badgeById, levelFromXp } from "@/lib/gamification";
import { getCompletedCount, getProgressSummary, isLessonComplete } from "@/lib/progress";
import type { LessonCatalogEntry } from "@/lib/lesson-types";

interface LessonsCatalogProps {
  phases: [number, LessonCatalogEntry[]][];
  lessonCount: number;
  interactiveCount: number;
}

export function LessonsCatalog({ phases, lessonCount, interactiveCount }: LessonsCatalogProps) {
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [totalDone, setTotalDone] = useState(0);
  const [summary, setSummary] = useState({ xp: 0, streakDays: 0, badges: [] as string[], completed: 0 });

  useEffect(() => {
    const map: Record<string, boolean> = {};
    for (const [, lessons] of phases) {
      for (const l of lessons) {
        map[l.id] = isLessonComplete(l.id);
      }
    }
    setCompleted(map);
    setTotalDone(getCompletedCount());
    setSummary(getProgressSummary());

    const refresh = () => {
      setTotalDone(getCompletedCount());
      setSummary(getProgressSummary());
    };
    window.addEventListener("m4ai:progress", refresh);
    return () => window.removeEventListener("m4ai:progress", refresh);
  }, [phases]);

  return (
    <>
      <div className="mt-4 flex flex-wrap gap-3 font-mono text-xs text-[var(--ink-mute)]">
        <span className="rounded border border-[var(--rule-soft)] px-2 py-1">
          {lessonCount} lessons · Phases 0–19
        </span>
        <span className="rounded border border-[var(--blueprint)] bg-[var(--blueprint-tint)] px-2 py-1 text-[var(--blueprint)]">
          {interactiveCount} interactive
        </span>
        <span className="rounded border border-[var(--rule-soft)] px-2 py-1">
          Lv{levelFromXp(summary.xp).level} · {summary.xp} XP
        </span>
        {summary.streakDays > 0 && (
          <span className="rounded border border-orange-200 bg-orange-50 px-2 py-1 text-orange-700">
            🔥 {summary.streakDays}d streak
          </span>
        )}
        <span>{totalDone} completed locally</span>
        {summary.badges.length > 0 && (
          <span title={summary.badges.map((b) => badgeById(b)?.name).join(", ")}>
            {summary.badges.length} badge{summary.badges.length === 1 ? "" : "s"}
          </span>
        )}
      </div>

      {phases.map(([phaseId, lessons]) => {
        const interactiveInPhase = lessons.filter((l) => l.interactive).length;
        return (
          <section key={phaseId} className="mt-10">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-mute)]">
                Phase {String(phaseId).padStart(2, "0")} — {lessons[0]?.phaseName}
              </h2>
              <span className="font-mono text-[10px] text-[var(--ink-mute)]">
                {lessons.length} lessons
                {interactiveInPhase > 0 ? ` · ${interactiveInPhase} interactive` : " · preview"}
              </span>
            </div>
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
        );
      })}
    </>
  );
}
