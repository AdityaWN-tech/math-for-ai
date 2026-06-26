const STORAGE_KEY = "m4ai:progress:v1";

export interface LessonProgress {
  completedAt: number | null;
  lastStepId: string | null;
  visitedAt: number;
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  updatedAt: number;
}

function empty(): ProgressState {
  return { lessons: {}, updatedAt: 0 };
}

export function readProgress(): ProgressState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as ProgressState;
    return parsed?.lessons ? parsed : empty();
  } catch {
    return empty();
  }
}

export function writeProgress(state: ProgressState) {
  if (typeof window === "undefined") return;
  state.updatedAt = Date.now();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* quota */
  }
}

export function markStep(lessonId: string, stepId: string) {
  const state = readProgress();
  if (!state.lessons[lessonId]) {
    state.lessons[lessonId] = { completedAt: null, lastStepId: stepId, visitedAt: Date.now() };
  } else {
    state.lessons[lessonId].lastStepId = stepId;
    state.lessons[lessonId].visitedAt = Date.now();
  }
  writeProgress(state);
}

export function markLessonComplete(lessonId: string) {
  const state = readProgress();
  if (!state.lessons[lessonId]) {
    state.lessons[lessonId] = { completedAt: Date.now(), lastStepId: null, visitedAt: Date.now() };
  } else {
    state.lessons[lessonId].completedAt = Date.now();
  }
  writeProgress(state);
}

export function isLessonComplete(lessonId: string): boolean {
  return Boolean(readProgress().lessons[lessonId]?.completedAt);
}

export function getCompletedCount(): number {
  return Object.values(readProgress().lessons).filter((l) => l.completedAt).length;
}
