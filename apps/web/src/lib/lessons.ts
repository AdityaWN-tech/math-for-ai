import type { Lesson } from "@/lib/lesson-types";
import lesson01 from "@/content/lessons/01-linear-algebra-intuition.json";
import lesson02 from "@/content/lessons/02-vectors-matrices-operations.json";
import lesson07 from "@/content/lessons/07-docker-for-ai.json";

export const INTERACTIVE_LESSONS: Record<string, Lesson> = {
  "01-linear-algebra-intuition": lesson01 as Lesson,
  "02-vectors-matrices-operations": lesson02 as Lesson,
  "07-docker-for-ai": lesson07 as Lesson,
};

export const DEFAULT_LESSON_ID = "01-linear-algebra-intuition";

export const INTERACTIVE_LESSON_ORDER = [
  "01-linear-algebra-intuition",
  "02-vectors-matrices-operations",
  "07-docker-for-ai",
] as const;

export function nextInteractiveLessonId(currentId: string): string | null {
  const i = INTERACTIVE_LESSON_ORDER.indexOf(currentId as (typeof INTERACTIVE_LESSON_ORDER)[number]);
  if (i < 0 || i >= INTERACTIVE_LESSON_ORDER.length - 1) return null;
  return INTERACTIVE_LESSON_ORDER[i + 1];
}

export function isInteractiveLesson(id: string) {
  return id in INTERACTIVE_LESSONS;
}
