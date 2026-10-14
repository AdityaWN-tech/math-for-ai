"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, BookOpen, FlaskConical, RotateCcw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Medal } from "@/components/arcade/Medal";
import { GameView } from "@/components/arcade/games/registry";
import { dailyGameId, type GameDef, MEDAL_ORDER, MEDAL_THRESHOLDS } from "@/lib/arcade/catalog";
import { DAILY_MULTIPLIER, recordArcadeRun, type RunOutcome } from "@/lib/arcade/record";
import { badgeById, todayKey } from "@/lib/gamification";
import { track } from "@/lib/analytics";
import { useIsClient, useProgress } from "@/lib/use-progress";

type Phase = "intro" | "play" | "result";

export function GameFrame({ game }: { game: GameDef }) {
  const [phase, setPhase] = useState<Phase>("intro");
  const [outcome, setOutcome] = useState<RunOutcome | null>(null);
  const [runKey, setRunKey] = useState(0);
  const record = useProgress().arcade?.[game.id] ?? null;
  const isDaily = useIsClient() && dailyGameId(todayKey()) === game.id;

  const start = () => {
    setRunKey((k) => k + 1);
    setPhase("play");
    track("arcade_start", { gameId: game.id });
  };

  const finish = (score: number) => {
    const result = recordArcadeRun(game.id, score);
    setOutcome(result);
    setPhase("result");
    track("arcade_finish", { gameId: game.id, score: result.score, medal: result.medal ?? "none" });
  };

  if (phase === "play") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="font-display text-3xl text-[var(--blueprint)]">{game.title}</h1>
          <Button variant="ghost" size="sm" onClick={() => setPhase("intro")}>
            Quit
          </Button>
        </div>
        <GameView key={runKey} id={game.id} onFinish={finish} />
      </div>
    );
  }

  if (phase === "result" && outcome) {
    return <ResultScreen game={game} outcome={outcome} onReplay={start} />;
  }

  return (
    <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 lg:grid-cols-[1.4fr_1fr]">
      <section>
        <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-widest">
          <span className="rounded-sm bg-[var(--blueprint)] px-2 py-0.5 text-white">{game.view}</span>
          <span className="text-[var(--ink-mute)]">{game.zone}</span>
          {isDaily && (
            <span className="rounded-sm bg-[var(--arcade-gold)] px-2 py-0.5 text-[#1a1a1a]">
              Daily challenge · {DAILY_MULTIPLIER}× XP
            </span>
          )}
        </div>
        <h1 className="mt-3 font-display text-6xl leading-none text-[var(--ink)]">{game.title}</h1>
        <p className="mt-3 max-w-xl font-body text-lg text-[var(--ink-soft)]">{game.tagline}</p>

        <ol className="mt-6 space-y-2">
          {game.howToPlay.map((line, i) => (
            <li key={line} className="flex gap-3 font-body">
              <span className="font-mono text-sm text-[var(--blueprint)]">{i + 1}.</span>
              <span>{line}</span>
            </li>
          ))}
        </ol>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button onClick={start}>
            {record?.plays ? "Play again" : "Start"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Link href={`/arcade/${game.id}/apply`}>
            <Button variant="secondary">
              <FlaskConical className="mr-2 h-4 w-4" />
              Apply it
            </Button>
          </Link>
          <Link href={`/demo/${game.lessonId}`}>
            <Button variant="ghost">
              <BookOpen className="mr-2 h-4 w-4" />
              Lesson: {game.lessonTitle}
            </Button>
          </Link>
        </div>
      </section>

      <aside className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-5 shadow-[var(--shadow-hard)]">
        <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Your record</p>
        <div className="mt-3 flex items-center gap-4">
          <Medal tier={record?.medal ?? null} size={56} />
          <div className="font-mono text-sm">
            <p>Best: {record?.bestScore ?? 0}/100</p>
            <p className="text-[var(--ink-mute)]">Plays: {record?.plays ?? 0}</p>
            {record?.applied && <p className="text-[var(--arcade-hit)]">Applied ✓</p>}
          </div>
        </div>
        <p className="mt-6 font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Medals</p>
        <ul className="mt-2 space-y-2">
          {MEDAL_ORDER.map((tier) => (
            <li key={tier} className="flex items-center gap-3 font-mono text-sm">
              <Medal tier={tier} size={22} />
              <span className="capitalize">{tier}</span>
              <span className="ml-auto text-[var(--ink-mute)]">{MEDAL_THRESHOLDS[tier]}+ pts</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}

function ResultScreen({
  game,
  outcome,
  onReplay,
}: {
  game: GameDef;
  outcome: RunOutcome;
  onReplay: () => void;
}) {
  const nextTier = MEDAL_ORDER.find((t) => MEDAL_THRESHOLDS[t] > outcome.score);
  const headline = outcome.medal
    ? outcome.upgraded
      ? `New ${outcome.medal} medal!`
      : `${outcome.medal[0].toUpperCase()}${outcome.medal.slice(1)} run`
    : "No medal this time";

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="m4ai-pop rounded-md border-2 border-[var(--ink)] bg-[var(--bg-surface)] p-8 text-center shadow-[6px_6px_0_var(--ink)]">
        <div className="m4ai-medal-drop mx-auto w-fit">
          <Medal tier={outcome.medal} size={96} />
        </div>
        <p className="mt-4 font-mono text-xs uppercase tracking-[0.3em] text-[var(--blueprint)]">{game.title}</p>
        <h1 className="mt-1 font-body text-3xl font-semibold capitalize">{headline}</h1>
        <p className="mt-2 font-display text-7xl leading-none">
          {outcome.score}
          <span className="text-3xl text-[var(--ink-mute)]">/100</span>
        </p>
        <div className="mt-3 flex flex-wrap justify-center gap-3 font-mono text-xs">
          {outcome.newBest && <span className="text-[var(--arcade-hit)]">Personal best</span>}
          {outcome.xpGained > 0 && (
            <span className="flex items-center gap-1 text-[var(--blueprint)]">
              <Sparkles className="h-3.5 w-3.5" />+{outcome.xpGained} XP{outcome.isDaily ? " (daily 2×)" : ""}
            </span>
          )}
          {nextTier && (
            <span className="text-[var(--ink-mute)]">
              {MEDAL_THRESHOLDS[nextTier] - outcome.score} more points for {nextTier}
            </span>
          )}
        </div>
        {outcome.newBadges.length > 0 && (
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {outcome.newBadges.map((id) => {
              const b = badgeById(id);
              return b ? (
                <span
                  key={id}
                  className="rounded-full border border-[var(--blueprint)] bg-[var(--blueprint-tint)] px-3 py-1 font-mono text-xs"
                >
                  {b.emoji} Badge unlocked: {b.name}
                </span>
              ) : null;
            })}
          </div>
        )}
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={onReplay}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Play again
          </Button>
          <Link href={`/arcade/${game.id}/apply`}>
            <Button variant="secondary">
              <FlaskConical className="mr-2 h-4 w-4" />
              Apply it in code
            </Button>
          </Link>
          <Link href="/arcade">
            <Button variant="ghost">Back to arcade</Button>
          </Link>
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-[var(--rule-soft)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--blueprint)]">The big idea</p>
          <p className="mt-2 font-body">{game.insight}</p>
        </div>
        <div className="rounded-md border border-[var(--rule-soft)] p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--blueprint)]">In real AI</p>
          <p className="mt-2 font-body">{game.inTheWild}</p>
        </div>
      </div>
    </div>
  );
}
