"use client";

import { Flame, Sparkles, Trophy } from "lucide-react";
import { useEffect, useState } from "react";
import { badgeById, levelFromXp } from "@/lib/gamification";
import { getProgressSummary } from "@/lib/progress";

export function ProgressHUD() {
  const [summary, setSummary] = useState({ xp: 0, streakDays: 0, badges: [] as string[], completed: 0 });

  useEffect(() => {
    const refresh = () => setSummary(getProgressSummary());
    refresh();
    window.addEventListener("m4ai:progress", refresh);
    return () => window.removeEventListener("m4ai:progress", refresh);
  }, []);

  const level = levelFromXp(summary.xp);
  const latestBadge = summary.badges.at(-1);
  const badge = latestBadge ? badgeById(latestBadge) : null;

  return (
    <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">
      <span className="hidden items-center gap-1 sm:flex" title={`Level ${level.level} · ${level.title}`}>
        <Trophy className="h-3.5 w-3.5 text-[var(--blueprint)]" />
        Lv{level.level}
      </span>
      <span className="flex items-center gap-1" title={`${summary.xp} XP`}>
        <Sparkles className="h-3.5 w-3.5 text-[var(--blueprint)]" />
        {summary.xp} XP
      </span>
      {summary.streakDays > 0 && (
        <span className="flex items-center gap-1" title="Day streak">
          <Flame className="h-3.5 w-3.5 text-orange-500" />
          {summary.streakDays}d
        </span>
      )}
      {badge && (
        <span className="hidden md:inline" title={badge.description}>
          {badge.emoji} {badge.name}
        </span>
      )}
    </div>
  );
}

export function notifyProgress() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("m4ai:progress"));
  }
}
