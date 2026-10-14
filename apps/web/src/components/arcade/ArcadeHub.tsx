"use client";

import Link from "next/link";
import { ArrowRight, CalendarDays, Flame, FlaskConical, Gamepad2, Trophy } from "lucide-react";
import { Medal } from "@/components/arcade/Medal";
import { dailyGameId, GAMES, type GameDef, MEDAL_ORDER } from "@/lib/arcade/catalog";
import { DAILY_MULTIPLIER } from "@/lib/arcade/record";
import { levelFromXp, todayKey } from "@/lib/gamification";
import type { ArcadeRecord } from "@/lib/progress";
import { useIsClient, useProgress } from "@/lib/use-progress";
import { cn } from "@/lib/cn";

const ZONES: GameDef["zone"][] = ["Vectors", "Matrices", "Calculus", "Probability"];

export function ArcadeHub() {
  const progress = useProgress();
  const isClient = useIsClient();
  const arcade = progress.arcade ?? {};
  const xp = progress.xp;
  const streak = progress.streakDays;
  const daily = isClient ? (GAMES.find((g) => g.id === dailyGameId(todayKey())) ?? null) : null;

  const level = levelFromXp(xp);
  const tally = Object.fromEntries(
    MEDAL_ORDER.map((t) => [t, Object.values(arcade).filter((r) => r.medal === t).length]),
  ) as Record<(typeof MEDAL_ORDER)[number], number>;
  const applied = Object.values(arcade).filter((r) => r.applied).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <section className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--blueprint)]">
            Play it · Prove it · Apply it
          </p>
          <h1 className="mt-2 font-display text-7xl leading-none">Math Arcade</h1>
          <p className="mt-4 max-w-xl font-body text-lg text-[var(--ink-soft)]">
            The math behind AI, as games you can feel. Aim vectors in 3D, bend space with matrices, putt down loss
            landscapes and catch the base-rate trap. Win medals, then turn each idea into working code.
          </p>
        </div>

        <div className="rounded-md border-2 border-[var(--ink)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-hard)]">
          <div className="flex items-baseline justify-between">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Player card</p>
            <span className="flex items-center gap-1 font-mono text-xs">
              <Flame className="h-3.5 w-3.5 text-orange-500" />
              {streak}d streak
            </span>
          </div>
          <p className="mt-2 font-body text-2xl font-semibold">
            Lv {level.level} · {level.title}
          </p>
          <div className="mt-2 h-3 w-full overflow-hidden rounded-sm border border-[var(--ink)]">
            <div className="h-full bg-[var(--blueprint)] transition-all" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </div>
          <p className="mt-1 font-mono text-[11px] text-[var(--ink-mute)]">
            {xp} / {level.nextLevelXp} XP to level {level.level + 1}
          </p>
          <div className="mt-4 flex items-center gap-4">
            {MEDAL_ORDER.slice()
              .reverse()
              .map((t) => (
                <span key={t} className="flex items-center gap-1 font-mono text-sm">
                  <Medal tier={t} size={22} /> ×{tally[t]}
                </span>
              ))}
            <span className="ml-auto flex items-center gap-1 font-mono text-sm" title="Apply It missions finished">
              <FlaskConical className="h-4 w-4 text-[var(--blueprint)]" /> {applied}/{GAMES.length}
            </span>
          </div>
          <Link
            href="/arcade/trophies"
            className="mt-4 inline-flex items-center gap-1 font-mono text-xs text-[var(--blueprint)] hover:underline"
          >
            <Trophy className="h-3.5 w-3.5" /> Open trophy room
          </Link>
        </div>
      </section>

      {daily && (
        <Link
          href={`/arcade/${daily.id}`}
          className="group mt-8 flex flex-wrap items-center gap-4 rounded-md border-2 border-[var(--ink)] bg-[var(--arcade-gold)] p-5 text-[#1a1a1a] shadow-[var(--shadow-hard)] transition-transform hover:-translate-y-0.5"
        >
          <CalendarDays className="h-8 w-8" />
          <div>
            <p className="font-mono text-[10px] uppercase tracking-widest">Daily challenge · {DAILY_MULTIPLIER}× XP on medals</p>
            <p className="font-display text-4xl leading-none">{daily.title}</p>
          </div>
          <span className="ml-auto flex items-center gap-1 font-mono text-sm font-semibold">
            Play today&apos;s game <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      )}

      {ZONES.map((zone) => {
        const games = GAMES.filter((g) => g.zone === zone);
        if (games.length === 0) return null;
        return (
          <section key={zone} className="mt-10">
            <h2 className="font-mono text-xs uppercase tracking-[0.25em] text-[var(--ink-mute)]">Zone · {zone}</h2>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((g) => (
                <GameCard key={g.id} game={g} record={arcade[g.id]} />
              ))}
            </div>
          </section>
        );
      })}

      <section className="mt-12 grid gap-4 rounded-md border border-[var(--rule-soft)] p-6 sm:grid-cols-3">
        {[
          { icon: Gamepad2, title: "1 · Play it", desc: "Get a feel for the idea before any formulas. Predict, try, see it move." },
          { icon: Trophy, title: "2 · Prove it", desc: "Bronze 50, silver 75, gold 90. Each upgrade pays XP and pushes your level." },
          { icon: FlaskConical, title: "3 · Apply it", desc: "Write the real Python an AI engineer would write. It runs in your browser." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title}>
            <Icon className="h-5 w-5 text-[var(--blueprint)]" />
            <p className="mt-2 font-body font-semibold">{title}</p>
            <p className="mt-1 font-body text-sm text-[var(--ink-soft)]">{desc}</p>
          </div>
        ))}
      </section>
    </div>
  );
}

function GameCard({ game, record }: { game: GameDef; record?: ArcadeRecord }) {
  return (
    <Link
      href={`/arcade/${game.id}`}
      className={cn(
        "group flex flex-col rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4 shadow-[var(--shadow-hard)] transition-transform hover:-translate-y-0.5 hover:border-[var(--blueprint)]",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="rounded-sm bg-[var(--blueprint)] px-1.5 py-0.5 font-mono text-[10px] text-white">{game.view}</span>
          <h3 className="mt-2 font-display text-3xl leading-none">{game.title}</h3>
        </div>
        <Medal tier={record?.medal ?? null} size={34} />
      </div>
      <p className="mt-2 flex-1 font-body text-sm text-[var(--ink-soft)]">{game.tagline}</p>
      <div className="mt-4 flex items-center justify-between font-mono text-[11px] text-[var(--ink-mute)]">
        <span>{record?.plays ? `Best ${record.bestScore}` : "Not played yet"}</span>
        {record?.applied && <span className="text-[var(--arcade-hit)]">Applied ✓</span>}
        <span className="flex items-center gap-1 text-[var(--blueprint)]">
          Play <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
