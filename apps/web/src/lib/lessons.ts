import type { Lesson } from "@/lib/lesson-types";
import manifest from "@/content/lessons/interactive-manifest.json";
import catalog from "@/content/lessons/catalog.json";
import { INTERACTIVE_LESSONS_REGISTRY } from "@/lib/interactive-lessons.registry";

export const INTERACTIVE_LESSONS: Record<string, Lesson> = INTERACTIVE_LESSONS_REGISTRY;

export const INTERACTIVE_LESSON_ORDER = manifest.lessons.map((l) => l.id);

export const DEFAULT_LESSON_ID = INTERACTIVE_LESSON_ORDER[0] ?? "01-dev-environment";

export function nextInteractiveLessonId(currentId: string): string | null {
  const i = INTERACTIVE_LESSON_ORDER.indexOf(currentId);
  if (i < 0 || i >= INTERACTIVE_LESSON_ORDER.length - 1) return null;
  return INTERACTIVE_LESSON_ORDER[i + 1];
}

export function isInteractiveLesson(id: string) {
  return id in INTERACTIVE_LESSONS;
}

export function firstLessonIdForPhase(phaseId: number): string | null {
  const entry = manifest.lessons.find((l) => l.phaseId === phaseId);
  return entry?.id ?? null;
}

/** Phase id → lesson ids (for badge evaluation). */
export function phaseLessonIndex(): Record<number, string[]> {
  const map: Record<number, string[]> = {};
  for (const l of catalog.lessons) {
    if (!map[l.phaseId]) map[l.phaseId] = [];
    map[l.phaseId].push(l.id);
  }
  return map;
}
