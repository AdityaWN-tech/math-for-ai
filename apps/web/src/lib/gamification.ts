import type { ProgressState } from "@/lib/progress";

export const XP_LESSON_BASE = 25;
export const XP_FIRST_TRY_BONUS = 15;
export const XP_DEPLOY_BONUS = 50;
export const XP_PHASE_BONUS = 100;

export interface BadgeDef {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

export const BADGES: BadgeDef[] = [
  { id: "first-lesson", name: "Hello World", description: "Complete your first lesson", emoji: "🌱" },
  { id: "streak-3", name: "On a Roll", description: "3-day learning streak", emoji: "🔥" },
  { id: "streak-7", name: "Week Warrior", description: "7-day learning streak", emoji: "⚡" },
  { id: "phase-0", name: "Tooling Ready", description: "Finish Phase 0 setup", emoji: "🛠" },
  { id: "phase-1", name: "Math Mode", description: "Finish Phase 1 math foundations", emoji: "📐" },
  { id: "ten-lessons", name: "Double Digits", description: "Complete 10 lessons", emoji: "🔟" },
  { id: "fifty-lessons", name: "Half Century", description: "Complete 50 lessons", emoji: "🏅" },
  { id: "first-try", name: "Clean Run", description: "Pass a lesson on the first attempt", emoji: "✨" },
];

export interface LevelInfo {
  level: number;
  title: string;
  xp: number;
  nextLevelXp: number;
  progress: number;
}

const LEVEL_TITLES = [
  "Curious",
  "Apprentice",
  "Builder",
  "Engineer",
  "Architect",
  "Principal",
  "Researcher",
  "Founder",
];

export function xpForLevel(level: number): number {
  return Math.floor(100 * level ** 1.35);
}

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  while (xp >= xpForLevel(level + 1) && level < 50) level += 1;
  const currentFloor = xpForLevel(level);
  const nextLevelXp = xpForLevel(level + 1);
  const span = Math.max(1, nextLevelXp - currentFloor);
  const progress = Math.min(1, (xp - currentFloor) / span);
  const title = LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)] ?? "Legend";
  return { level, title, xp, nextLevelXp, progress };
}

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function updateStreak(state: ProgressState): ProgressState {
  const today = todayKey();
  const last = state.lastActiveDate;
  if (!last) {
    return { ...state, streakDays: 1, lastActiveDate: today };
  }
  if (last === today) return state;

  const lastDate = new Date(`${last}T12:00:00`);
  const todayDate = new Date(`${today}T12:00:00`);
  const diffDays = Math.round((todayDate.getTime() - lastDate.getTime()) / 86_400_000);

  const streakDays = diffDays === 1 ? state.streakDays + 1 : 1;
  return { ...state, streakDays, lastActiveDate: today };
}

export function computeLessonXp(opts: {
  base?: number;
  firstTry: boolean;
  hasDeploy: boolean;
  rubric?: string;
}): number {
  let xp = opts.base ?? XP_LESSON_BASE;
  if (opts.rubric === "T2") xp += 25;
  else if (opts.rubric === "T1") xp += 10;
  if (opts.firstTry) xp += XP_FIRST_TRY_BONUS;
  if (opts.hasDeploy) xp += XP_DEPLOY_BONUS;
  return xp;
}

export function completedInPhase(
  state: ProgressState,
  phaseId: number,
  lessonIdsInPhase: string[],
): number {
  return lessonIdsInPhase.filter((id) => state.lessons[id]?.completedAt).length;
}

export function evaluateBadges(state: ProgressState, phaseLessonIds: Record<number, string[]>): string[] {
  const earned = new Set(state.badges);
  const completed = Object.values(state.lessons).filter((l) => l.completedAt).length;
  const anyFirstTry = Object.values(state.lessons).some((l) => l.firstPassAt && l.attempts === 1);

  if (completed >= 1) earned.add("first-lesson");
  if (completed >= 10) earned.add("ten-lessons");
  if (completed >= 50) earned.add("fifty-lessons");
  if (state.streakDays >= 3) earned.add("streak-3");
  if (state.streakDays >= 7) earned.add("streak-7");
  if (anyFirstTry) earned.add("first-try");

  const phase0 = phaseLessonIds[0] ?? [];
  if (phase0.length > 0 && completedInPhase(state, 0, phase0) >= phase0.length) {
    earned.add("phase-0");
  }
  const phase1 = phaseLessonIds[1] ?? [];
  if (phase1.length > 0 && completedInPhase(state, 1, phase1) >= phase1.length) {
    earned.add("phase-1");
  }

  return [...earned];
}

export function badgeById(id: string): BadgeDef | undefined {
  return BADGES.find((b) => b.id === id);
}
