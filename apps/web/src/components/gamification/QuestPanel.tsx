"use client";

import { useEffect, useState } from "react";
import { notifyProgress } from "@/components/gamification/ProgressHUD";
import { cn } from "@/lib/cn";
import {
  claimAllReadyQuests,
  completedQuestIds,
  QUESTS,
  questProgress,
} from "@/lib/quests";

export function QuestPanel() {
  const [claimed, setClaimed] = useState<string[]>([]);
  const [progress, setProgress] = useState(QUESTS.map((q) => questProgress(q)));

  useEffect(() => {
    const refresh = () => {
      setClaimed(completedQuestIds());
      setProgress(QUESTS.map((q) => questProgress(q)));
      const newClaims = claimAllReadyQuests();
      if (newClaims.length > 0) {
        notifyProgress();
        setClaimed(completedQuestIds());
      }
    };
    refresh();
    window.addEventListener("m4ai:progress", refresh);
    return () => window.removeEventListener("m4ai:progress", refresh);
  }, []);

  return (
    <section className="mt-10">
      <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--ink-mute)]">Quest lines</h2>
      <p className="mt-1 font-body text-sm text-[var(--ink-soft)]">
        Complete lesson sets to earn bonus XP. Progress syncs locally.
      </p>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {QUESTS.map((quest, i) => {
          const { done, total, complete } = progress[i] ?? questProgress(quest);
          const isClaimed = claimed.includes(quest.id);
          return (
            <li
              key={quest.id}
              className={cn(
                "rounded-md border p-4",
                isClaimed
                  ? "border-[var(--blueprint)] bg-[var(--blueprint-tint)]"
                  : "border-[var(--rule-soft)] bg-[var(--bg-surface)]",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-body font-semibold">
                  <span className="mr-1">{quest.emoji}</span>
                  {quest.title}
                </p>
                <span className="shrink-0 font-mono text-[10px] text-[var(--blueprint)]">
                  +{quest.rewardXp} XP
                </span>
              </div>
              <p className="mt-1 font-body text-xs text-[var(--ink-soft)]">{quest.description}</p>
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-[var(--rule-soft)]">
                  <div
                    className="h-full bg-[var(--blueprint)] transition-all"
                    style={{ width: `${(done / total) * 100}%` }}
                  />
                </div>
                <p className="mt-1 font-mono text-[10px] text-[var(--ink-mute)]">
                  {done}/{total} lessons
                  {isClaimed && " · claimed"}
                  {complete && !isClaimed && " · ready!"}
                </p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
