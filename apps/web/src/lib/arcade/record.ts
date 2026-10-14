import { todayKey } from "@/lib/gamification";
import { type ArcadeRecord, type MedalTier, readProgress, writeProgress } from "@/lib/progress";
import { dailyGameId, GAMES, MEDAL_XP, medalForScore, medalRank } from "@/lib/arcade/catalog";

export const APPLY_XP = 60;
export const DAILY_MULTIPLIER = 2;

export interface RunOutcome {
  score: number;
  medal: MedalTier | null;
  previousMedal: MedalTier | null;
  upgraded: boolean;
  newBest: boolean;
  xpGained: number;
  isDaily: boolean;
  newBadges: string[];
}

function emptyRecord(): ArcadeRecord {
  return { bestScore: 0, medal: null, plays: 0, lastPlayedAt: 0 };
}

export function getArcadeRecords(): Record<string, ArcadeRecord> {
  return readProgress().arcade ?? {};
}

function arcadeBadges(arcade: Record<string, ArcadeRecord>, earned: Set<string>, dailyMedal: boolean) {
  const recs = Object.values(arcade);
  if (recs.some((r) => r.medal)) earned.add("first-medal");
  if (recs.filter((r) => r.medal === "gold").length >= 3) earned.add("gold-3");
  if (GAMES.every((g) => (arcade[g.id]?.plays ?? 0) > 0)) earned.add("arcade-all");
  if (recs.some((r) => r.applied)) earned.add("applied-1");
  if (GAMES.every((g) => arcade[g.id]?.applied)) earned.add("applied-all");
  if (dailyMedal) earned.add("daily-1");
}

/**
 * Store a finished run. XP is only paid for medal upgrades (difference between tiers),
 * so replaying for a higher medal is always worth it but farming isn't.
 */
export function recordArcadeRun(gameId: string, rawScore: number): RunOutcome {
  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const state = readProgress();
  const arcade = { ...(state.arcade ?? {}) };
  const rec = { ...(arcade[gameId] ?? emptyRecord()) };

  const medal = medalForScore(score);
  const previousMedal = rec.medal;
  const upgraded = medalRank(medal) > medalRank(previousMedal);
  const newBest = score > rec.bestScore;
  const isDaily = dailyGameId(todayKey()) === gameId;

  let xpGained = 0;
  if (upgraded && medal) {
    xpGained = MEDAL_XP[medal] - (previousMedal ? MEDAL_XP[previousMedal] : 0);
    if (isDaily) xpGained *= DAILY_MULTIPLIER;
    rec.medal = medal;
  }

  rec.bestScore = Math.max(rec.bestScore, score);
  rec.plays += 1;
  rec.lastPlayedAt = Date.now();
  arcade[gameId] = rec;

  const before = new Set(state.badges);
  const earned = new Set(state.badges);
  arcadeBadges(arcade, earned, isDaily && Boolean(medal));

  state.arcade = arcade;
  state.badges = [...earned];
  state.xp += xpGained;
  writeProgress(state);

  return {
    score,
    medal,
    previousMedal,
    upgraded,
    newBest,
    xpGained,
    isDaily,
    newBadges: state.badges.filter((b) => !before.has(b)),
  };
}

export function recordApplyComplete(gameId: string): { xpGained: number; newBadges: string[] } {
  const state = readProgress();
  const arcade = { ...(state.arcade ?? {}) };
  const rec = { ...(arcade[gameId] ?? emptyRecord()) };
  if (rec.applied) return { xpGained: 0, newBadges: [] };

  rec.applied = true;
  arcade[gameId] = rec;

  const before = new Set(state.badges);
  const earned = new Set(state.badges);
  arcadeBadges(arcade, earned, false);

  state.arcade = arcade;
  state.badges = [...earned];
  state.xp += APPLY_XP;
  writeProgress(state);
  return { xpGained: APPLY_XP, newBadges: state.badges.filter((b) => !before.has(b)) };
}
