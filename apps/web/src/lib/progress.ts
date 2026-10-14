import {
  computeLessonXp,
  evaluateBadges,
  LEVEL_UP_EVENT,
  levelFromXp,
  type LevelUpDetail,
  updateStreak,
  XP_PHASE_BONUS,
} from "@/lib/gamification";

export const STORAGE_KEY = "m4ai:progress:v2";
const LEGACY_KEY = "m4ai:progress:v1";

export interface LessonProgress {
  completedAt: number | null;
  lastStepId: string | null;
  visitedAt: number;
  code?: string;
  workspaceFiles?: Record<string, string>;
  attempts: number;
  firstPassAt: number | null;
  xpEarned: number;
}

export type MedalTier = "bronze" | "silver" | "gold";

export interface ArcadeRecord {
  bestScore: number;
  medal: MedalTier | null;
  plays: number;
  lastPlayedAt: number;
  applied?: boolean;
}

export interface ProgressState {
  lessons: Record<string, LessonProgress>;
  xp: number;
  streakDays: number;
  lastActiveDate: string | null;
  badges: string[];
  questsCompleted?: string[];
  arcade?: Record<string, ArcadeRecord>;
  updatedAt: number;
}

function emptyLesson(): LessonProgress {
  return {
    completedAt: null,
    lastStepId: null,
    visitedAt: Date.now(),
    attempts: 0,
    firstPassAt: null,
    xpEarned: 0,
  };
}

function empty(): ProgressState {
  return {
    lessons: {},
    xp: 0,
    streakDays: 0,
    lastActiveDate: null,
    badges: [],
    updatedAt: 0,
  };
}

function migrateLegacy(raw: unknown): ProgressState {
  const state = empty();
  if (!raw || typeof raw !== "object") return state;
  const legacy = raw as { lessons?: Record<string, { completedAt?: number | null; lastStepId?: string | null; visitedAt?: number }> };
  for (const [id, lp] of Object.entries(legacy.lessons ?? {})) {
    state.lessons[id] = {
      ...emptyLesson(),
      completedAt: lp.completedAt ?? null,
      lastStepId: lp.lastStepId ?? null,
      visitedAt: lp.visitedAt ?? Date.now(),
    };
    if (lp.completedAt) state.xp += 25;
  }
  return state;
}

export function readProgress(): ProgressState {
  if (typeof window === "undefined") return empty();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ProgressState;
      if (parsed?.lessons) {
        return {
          ...empty(),
          ...parsed,
          badges: parsed.badges ?? [],
          questsCompleted: parsed.questsCompleted ?? [],
          arcade: parsed.arcade ?? {},
          streakDays: parsed.streakDays ?? 0,
        };
      }
    }
    const legacyRaw = localStorage.getItem(LEGACY_KEY);
    if (legacyRaw) {
      const migrated = migrateLegacy(JSON.parse(legacyRaw));
      writeProgress(migrated);
      return migrated;
    }
    return empty();
  } catch {
    return empty();
  }
}

function storedXp(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? ((JSON.parse(raw) as ProgressState).xp ?? 0) : 0;
  } catch {
    return 0;
  }
}

export function writeProgress(state: ProgressState, opts?: { skipSync?: boolean }) {
  if (typeof window === "undefined") return;
  state.updatedAt = Date.now();
  try {
    const before = levelFromXp(storedXp()).level;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    if (!opts?.skipSync) {
      import("@/lib/progress-sync").then((m) => m.scheduleProgressSync());
    }
    window.dispatchEvent(new Event("m4ai:progress"));
    const after = levelFromXp(state.xp);
    if (!opts?.skipSync && after.level > before) {
      const detail: LevelUpDetail = { level: after.level, title: after.title };
      window.dispatchEvent(new CustomEvent(LEVEL_UP_EVENT, { detail }));
    }
  } catch {
    /* quota */
  }
}

function touchLesson(state: ProgressState, lessonId: string): LessonProgress {
  if (!state.lessons[lessonId]) {
    state.lessons[lessonId] = emptyLesson();
  }
  return state.lessons[lessonId];
}

export function markStep(lessonId: string, stepId: string) {
  const state = readProgress();
  const lesson = touchLesson(state, lessonId);
  lesson.lastStepId = stepId;
  lesson.visitedAt = Date.now();
  const withStreak = updateStreak(state);
  writeProgress(withStreak);
}

export function saveLessonCode(lessonId: string, code: string) {
  const state = readProgress();
  const lesson = touchLesson(state, lessonId);
  lesson.code = code;
  writeProgress(state);
}

export function getLessonCode(lessonId: string): string | undefined {
  return readProgress().lessons[lessonId]?.code;
}

export function getWorkspaceFiles(lessonId: string): Record<string, string> | undefined {
  return readProgress().lessons[lessonId]?.workspaceFiles;
}

export function saveWorkspaceFiles(lessonId: string, files: Record<string, string>) {
  const state = readProgress();
  const lesson = touchLesson(state, lessonId);
  lesson.workspaceFiles = files;
  const primary = Object.keys(files).find((k) => k.endsWith(".py")) ?? Object.keys(files)[0];
  if (primary) lesson.code = files[primary];
  writeProgress(state);
}

export function recordTestAttempt(lessonId: string): number {
  const state = readProgress();
  const lesson = touchLesson(state, lessonId);
  lesson.attempts += 1;
  writeProgress(state);
  return lesson.attempts;
}

export function recordTestPass(
  lessonId: string,
  opts: { xpReward?: number; rubric?: string; hasDeploy?: boolean },
): { xp: number; firstTry: boolean; totalXp: number } {
  const state = readProgress();
  const lesson = touchLesson(state, lessonId);
  const firstTry = lesson.attempts === 1 && !lesson.firstPassAt;
  if (!lesson.firstPassAt) lesson.firstPassAt = Date.now();

  const xp =
    lesson.xpEarned > 0
      ? 0
      : computeLessonXp({
          base: opts.xpReward,
          firstTry,
          hasDeploy: opts.hasDeploy ?? false,
          rubric: opts.rubric,
        });

  if (xp > 0) {
    lesson.xpEarned = xp;
    state.xp += xp;
  }

  writeProgress(state);
  return { xp, firstTry, totalXp: state.xp };
}

export function markLessonComplete(
  lessonId: string,
  opts?: { phaseId?: number; phaseLessonIds?: Record<number, string[]> },
) {
  const state = readProgress();
  const lesson = touchLesson(state, lessonId);
  if (!lesson.completedAt) lesson.completedAt = Date.now();

  if (opts?.phaseLessonIds && opts.phaseId !== undefined) {
    const ids = opts.phaseLessonIds[opts.phaseId] ?? [];
    const allDone = ids.every(
      (id) => id === lessonId || Boolean(state.lessons[id]?.completedAt),
    );
    if (allDone && ids.length > 0) {
      state.xp += XP_PHASE_BONUS;
    }
    state.badges = evaluateBadges(state, opts.phaseLessonIds);
  }

  const withStreak = updateStreak(state);
  writeProgress(withStreak);
}

export function isLessonComplete(lessonId: string): boolean {
  return Boolean(readProgress().lessons[lessonId]?.completedAt);
}

export function getResumeStepIndex(lessonId: string, steps: { id: string }[]): number {
  if (isLessonComplete(lessonId)) return 0;
  const lastStepId = readProgress().lessons[lessonId]?.lastStepId;
  if (!lastStepId) return 0;
  const idx = steps.findIndex((s) => s.id === lastStepId);
  return idx >= 0 ? idx : 0;
}

export function getCompletedCount(): number {
  return Object.values(readProgress().lessons).filter((l) => l.completedAt).length;
}

export function getProgressSummary() {
  const state = readProgress();
  return {
    xp: state.xp,
    streakDays: state.streakDays,
    badges: state.badges,
    completed: getCompletedCount(),
  };
}

/** Merge remote server state into local — keeps best progress from either side. */
export function mergeRemoteProgress(remote: ProgressState) {
  if (typeof window === "undefined") return;
  const local = readProgress();
  const merged: ProgressState = {
    ...local,
    xp: Math.max(local.xp, remote.xp ?? 0),
    streakDays: Math.max(local.streakDays, remote.streakDays ?? 0),
    badges: [...new Set([...(local.badges ?? []), ...(remote.badges ?? [])])],
    questsCompleted: [...new Set([...(local.questsCompleted ?? []), ...(remote.questsCompleted ?? [])])],
    lessons: { ...local.lessons },
    arcade: { ...(local.arcade ?? {}) },
    updatedAt: Math.max(local.updatedAt, remote.updatedAt ?? 0),
  };

  const medalRank = (m: MedalTier | null | undefined) => (m ? ["bronze", "silver", "gold"].indexOf(m) : -1);
  for (const [id, remoteRec] of Object.entries(remote.arcade ?? {})) {
    const localRec = merged.arcade![id];
    if (!localRec) {
      merged.arcade![id] = remoteRec;
      continue;
    }
    merged.arcade![id] = {
      bestScore: Math.max(localRec.bestScore, remoteRec.bestScore ?? 0),
      medal: medalRank(remoteRec.medal) > medalRank(localRec.medal) ? remoteRec.medal : localRec.medal,
      plays: Math.max(localRec.plays, remoteRec.plays ?? 0),
      lastPlayedAt: Math.max(localRec.lastPlayedAt, remoteRec.lastPlayedAt ?? 0),
      applied: Boolean(localRec.applied || remoteRec.applied),
    };
  }

  for (const [id, remoteLesson] of Object.entries(remote.lessons ?? {})) {
    const localLesson = local.lessons[id] ?? emptyLesson();
    const pickLocal = localLesson.visitedAt >= (remoteLesson.visitedAt ?? 0);
    merged.lessons[id] = {
      ...localLesson,
      completedAt:
        localLesson.completedAt && remoteLesson.completedAt
          ? Math.min(localLesson.completedAt, remoteLesson.completedAt)
          : localLesson.completedAt ?? remoteLesson.completedAt ?? null,
      lastStepId: pickLocal ? localLesson.lastStepId : remoteLesson.lastStepId ?? localLesson.lastStepId,
      visitedAt: Math.max(localLesson.visitedAt, remoteLesson.visitedAt ?? 0),
      attempts: Math.max(localLesson.attempts, remoteLesson.attempts ?? 0),
      firstPassAt:
        localLesson.firstPassAt && remoteLesson.firstPassAt
          ? Math.min(localLesson.firstPassAt, remoteLesson.firstPassAt)
          : localLesson.firstPassAt ?? remoteLesson.firstPassAt ?? null,
      xpEarned: Math.max(localLesson.xpEarned, remoteLesson.xpEarned ?? 0),
      code: pickLocal ? localLesson.code : remoteLesson.code ?? localLesson.code,
      workspaceFiles: pickLocal
        ? localLesson.workspaceFiles
        : remoteLesson.workspaceFiles ?? localLesson.workspaceFiles,
    };
  }

  writeProgress(merged, { skipSync: true });
}
