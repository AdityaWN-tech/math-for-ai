import questsData from "@/content/quests.json";
import { readProgress, writeProgress } from "@/lib/progress";

export interface Quest {
  id: string;
  title: string;
  description: string;
  emoji: string;
  rewardXp: number;
  lessonIds: string[];
}

export const QUESTS: Quest[] = questsData.quests;

export function questProgress(quest: Quest): { done: number; total: number; complete: boolean } {
  const state = readProgress();
  const done = quest.lessonIds.filter((id) => Boolean(state.lessons[id]?.completedAt)).length;
  return { done, total: quest.lessonIds.length, complete: done >= quest.lessonIds.length };
}

export function completedQuestIds(): string[] {
  return readProgress().questsCompleted ?? [];
}

export function isQuestClaimed(questId: string): boolean {
  return completedQuestIds().includes(questId);
}

/** Award quest XP once when all lessons done. Returns XP granted or 0. */
export function claimQuestIfReady(questId: string): number {
  const quest = QUESTS.find((q) => q.id === questId);
  if (!quest || isQuestClaimed(questId)) return 0;

  const { complete } = questProgress(quest);
  if (!complete) return 0;

  const state = readProgress();
  state.questsCompleted = [...(state.questsCompleted ?? []), questId];
  state.xp += quest.rewardXp;
  writeProgress(state);
  return quest.rewardXp;
}

export function claimAllReadyQuests(): { questId: string; xp: number; title: string }[] {
  const claimed: { questId: string; xp: number; title: string }[] = [];
  for (const quest of QUESTS) {
    const xp = claimQuestIfReady(quest.id);
    if (xp > 0) claimed.push({ questId: quest.id, xp, title: quest.title });
  }
  return claimed;
}
