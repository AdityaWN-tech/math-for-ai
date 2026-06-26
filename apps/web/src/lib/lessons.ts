import type { Lesson } from "@/lib/lesson-types";
import lessonPhase0_01 from "@/content/lessons/01-dev-environment.json";
import lessonPhase0_02 from "@/content/lessons/02-git-and-collaboration.json";
import lessonPhase0_03 from "@/content/lessons/03-gpu-setup-and-cloud.json";
import lessonPhase0_04 from "@/content/lessons/04-apis-and-keys.json";
import lessonPhase0_05 from "@/content/lessons/05-jupyter-notebooks.json";
import lessonPhase0_06 from "@/content/lessons/06-python-environments.json";
import lessonPhase0_07 from "@/content/lessons/07-docker-for-ai.json";
import lessonPhase1_01 from "@/content/lessons/01-linear-algebra-intuition.json";
import lessonPhase1_02 from "@/content/lessons/02-vectors-matrices-operations.json";
import lessonPhase1_03 from "@/content/lessons/03-matrix-transformations.json";

export const INTERACTIVE_LESSONS: Record<string, Lesson> = {
  "01-dev-environment": lessonPhase0_01 as Lesson,
  "02-git-and-collaboration": lessonPhase0_02 as Lesson,
  "03-gpu-setup-and-cloud": lessonPhase0_03 as Lesson,
  "04-apis-and-keys": lessonPhase0_04 as Lesson,
  "05-jupyter-notebooks": lessonPhase0_05 as Lesson,
  "06-python-environments": lessonPhase0_06 as Lesson,
  "07-docker-for-ai": lessonPhase0_07 as Lesson,
  "01-linear-algebra-intuition": lessonPhase1_01 as Lesson,
  "02-vectors-matrices-operations": lessonPhase1_02 as Lesson,
  "03-matrix-transformations": lessonPhase1_03 as Lesson,
};

/** Curriculum order: Phase 0 setup chain → Phase 1 math (interactive subset grows over time). */
export const INTERACTIVE_LESSON_ORDER = [
  "01-dev-environment",
  "02-git-and-collaboration",
  "03-gpu-setup-and-cloud",
  "04-apis-and-keys",
  "05-jupyter-notebooks",
  "06-python-environments",
  "07-docker-for-ai",
  "01-linear-algebra-intuition",
  "02-vectors-matrices-operations",
  "03-matrix-transformations",
] as const;

export const DEFAULT_LESSON_ID = "01-dev-environment";

export function nextInteractiveLessonId(currentId: string): string | null {
  const i = INTERACTIVE_LESSON_ORDER.indexOf(currentId as (typeof INTERACTIVE_LESSON_ORDER)[number]);
  if (i < 0 || i >= INTERACTIVE_LESSON_ORDER.length - 1) return null;
  return INTERACTIVE_LESSON_ORDER[i + 1];
}

export function isInteractiveLesson(id: string) {
  return id in INTERACTIVE_LESSONS;
}

export function firstLessonIdForPhase(phaseId: number): string | null {
  const entry = INTERACTIVE_LESSON_ORDER.find((id) => INTERACTIVE_LESSONS[id]?.phase.id === phaseId);
  return entry ?? null;
}
