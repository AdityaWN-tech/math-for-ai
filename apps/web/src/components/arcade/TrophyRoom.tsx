"use client";

import Link from "next/link";
import { Medal } from "@/components/arcade/Medal";
import { GAMES, MEDAL_ORDER, MEDAL_THRESHOLDS } from "@/lib/arcade/catalog";
import { BADGES, LEVEL_TITLES, levelFromXp, xpForLevel } from "@/lib/gamification";
import { useProgress } from "@/lib/use-progress";
import { cn } from "@/lib/cn";


export function TrophyRoom() {
  const progress = useProgress();
  const arcade = progress.arcade ?? {};
  const badges = progress.badges;
  const xp = progress.xp;

  const level = levelFromXp(xp);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="font-display text-6xl leading-none">Trophy room</h1>
      <p className="mt-2 font-body text-[var(--ink-soft)]">Everything you&apos;ve earned, and what&apos;s still out there.</p>

      <section className="mt-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-mute)]">Medal cabinet</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {GAMES.map((g) => {
            const rec = arcade[g.id];
            return (
              <Link
                key={g.id}
                href={`/arcade/${g.id}`}
                className="flex items-center gap-4 rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4 hover:border-[var(--blueprint)]"
              >
                <Medal tier={rec?.medal ?? null} size={48} />
                <div className="min-w-0">
                  <p className="font-body font-semibold">{g.title}</p>
                  <p className="font-mono text-[11px] text-[var(--ink-mute)]">
                    {rec?.plays ? `Best ${rec.bestScore}/100 · ${rec.plays} play${rec.plays > 1 ? "s" : ""}` : "Locked: play to earn"}
                  </p>
                  <div className="mt-1 flex gap-1">
                    {MEDAL_ORDER.map((t) => (
                      <span
                        key={t}
                        title={`${t}: ${MEDAL_THRESHOLDS[t]}+`}
                        className={cn(
                          "h-1.5 w-6 rounded-full",
                          (rec?.bestScore ?? 0) >= MEDAL_THRESHOLDS[t] ? "bg-[var(--blueprint)]" : "bg-[var(--rule-soft)]",
                        )}
                      />
                    ))}
                    {rec?.applied && <span className="ml-1 font-mono text-[10px] text-[var(--arcade-hit)]">applied</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-mute)]">
          Badges · {badges.length}/{BADGES.length}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {BADGES.map((b) => {
            const earned = badges.includes(b.id);
            return (
              <div
                key={b.id}
                className={cn(
                  "rounded-md border p-3",
                  earned ? "border-[var(--blueprint)] bg-[var(--blueprint-tint)]" : "border-dashed border-[var(--rule-soft)] opacity-60",
                )}
              >
                <p className={cn("text-2xl", !earned && "grayscale")}>{earned ? b.emoji : "🔒"}</p>
                <p className="mt-1 font-body text-sm font-semibold">{b.name}</p>
                <p className="font-body text-xs text-[var(--ink-soft)]">{b.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-mute)]">Rank path</h2>
        <ol className="mt-3 flex flex-wrap gap-2">
          {LEVEL_TITLES.map((title, i) => {
            const lv = i + 1;
            const reached = level.level >= lv;
            return (
              <li
                key={title}
                className={cn(
                  "rounded-md border px-3 py-2 font-mono text-xs",
                  reached ? "border-[var(--ink)] bg-[var(--bg-surface)]" : "border-dashed border-[var(--rule-soft)] text-[var(--ink-mute)]",
                  level.level === lv && "border-2 border-[var(--blueprint)]",
                )}
              >
                Lv{lv} {title}
                <span className="block text-[10px] text-[var(--ink-mute)]">{lv === 1 ? 0 : xpForLevel(lv)} XP</span>
              </li>
            );
          })}
        </ol>
      </section>
    </div>
  );
}
