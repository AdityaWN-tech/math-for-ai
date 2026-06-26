import type { Lesson } from "@/lib/lesson-types";
import lesson01 from "@/content/lessons/01-linear-algebra-intuition.json";
import lesson07 from "@/content/lessons/07-docker-for-ai.json";

export const INTERACTIVE_LESSONS: Record<string, Lesson> = {
  "01-linear-algebra-intuition": lesson01 as Lesson,
  "07-docker-for-ai": lesson07 as Lesson,
};

export const DEFAULT_LESSON_ID = "01-linear-algebra-intuition";

export function isInteractiveLesson(id: string) {
  return id in INTERACTIVE_LESSONS;
}
