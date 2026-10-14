"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Loader2, Play, RotateCcw, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { GameDef } from "@/lib/arcade/catalog";
import { recordApplyComplete } from "@/lib/arcade/record";
import { useProgress } from "@/lib/use-progress";
import { badgeById } from "@/lib/gamification";
import { type RunResult, runPythonChecks } from "@/lib/pyodide-runner";
import { track } from "@/lib/analytics";

const CodeEditor = dynamic(() => import("@/components/shell/CodeEditor"), {
  ssr: false,
  loading: () => <div className="p-4 font-mono text-xs text-[var(--ink-mute)]">Loading editor…</div>,
});

const draftKey = (id: string) => `m4ai:apply-draft:${id}`;

export function ApplyMission({ game }: { game: GameDef }) {
  const mission = game.apply;
  const [code, setCode] = useState(() => {
    if (typeof window === "undefined") return mission.starter;
    try {
      return localStorage.getItem(draftKey(game.id)) ?? mission.starter;
    } catch {
      return mission.starter;
    }
  });
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const alreadyDone = Boolean(useProgress().arcade?.[game.id]?.applied);
  const [reward, setReward] = useState<{ xp: number; badges: string[] } | null>(null);

  const onChange = (v: string) => {
    setCode(v);
    try {
      localStorage.setItem(draftKey(game.id), v);
    } catch {
      /* ignore */
    }
  };

  const run = async () => {
    setRunning(true);
    const r = await runPythonChecks(code, mission.harness);
    setResult(r);
    setRunning(false);
    track("apply_run", { gameId: game.id, passed: r.allPassed });
    if (r.allPassed) {
      const { xpGained, newBadges } = recordApplyComplete(game.id);
      if (xpGained > 0) setReward({ xp: xpGained, badges: newBadges });
    }
  };

  const reset = () => {
    onChange(mission.starter);
    setResult(null);
  };

  const passed = result?.tests.filter((t) => t.pass).length ?? 0;

  return (
    <div className="mx-auto grid max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[340px_1fr]">
      <aside className="space-y-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--blueprint)]">
            Apply it · {game.title}
          </p>
          <h1 className="mt-1 font-body text-2xl font-semibold">{mission.title}</h1>
          <p className="mt-2 font-body text-[var(--ink-soft)]">{mission.story}</p>
        </div>
        <div className="rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">From the game</p>
          <p className="mt-1 font-body text-sm">{game.insight}</p>
        </div>

        {result && (
          <div className="rounded-md border border-[var(--rule-soft)] p-3">
            <p className="font-mono text-xs">
              Checks: {passed}/{result.tests.length}
            </p>
            <ul className="mt-2 space-y-1.5">
              {result.tests.map((t) => (
                <li key={t.name} className="flex gap-2 font-mono text-xs">
                  {t.pass ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--arcade-hit)]" />
                  ) : (
                    <XCircle className="h-4 w-4 shrink-0 text-[var(--arcade-b)]" />
                  )}
                  <span>
                    {t.name}
                    {!t.pass && t.msg && <span className="block text-[var(--ink-mute)]">{t.msg}</span>}
                  </span>
                </li>
              ))}
            </ul>
            {result.error && (
              <pre className="mt-2 whitespace-pre-wrap rounded-sm bg-[var(--code-bg)] p-2 font-mono text-[11px] text-[var(--arcade-b)]">
                {result.error}
              </pre>
            )}
          </div>
        )}

        {reward && (
          <div className="m4ai-pop rounded-md border-2 border-[var(--ink)] bg-[var(--arcade-gold)] p-4 text-[#1a1a1a] shadow-[var(--shadow-hard)]">
            <p className="font-body text-lg font-semibold">Mission complete! +{reward.xp} XP</p>
            {reward.badges.map((id) => {
              const b = badgeById(id);
              return b ? (
                <p key={id} className="font-mono text-xs">
                  {b.emoji} Badge unlocked: {b.name}
                </p>
              ) : null;
            })}
          </div>
        )}
        {alreadyDone && !reward && (
          <p className="font-mono text-xs text-[var(--arcade-hit)]">✓ You&apos;ve already finished this mission.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Link href={`/arcade/${game.id}`}>
            <Button variant="secondary" size="sm">
              Back to the game
            </Button>
          </Link>
          <Link href={`/demo/${game.lessonId}`}>
            <Button variant="ghost" size="sm">
              Read the lesson
            </Button>
          </Link>
        </div>
      </aside>

      <section className="flex min-h-[560px] flex-col overflow-hidden rounded-md border border-[var(--rule-soft)]">
        <div className="flex items-center justify-between border-b border-[var(--rule-soft)] bg-[var(--bg-surface)] px-3 py-2">
          <span className="font-mono text-xs">{mission.filename}</span>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={reset} disabled={running}>
              <RotateCcw className="mr-1 h-3.5 w-3.5" /> Reset
            </Button>
            <Button size="sm" onClick={run} disabled={running}>
              {running ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <Play className="mr-1 h-3.5 w-3.5" />}
              {running ? "Running…" : "Run checks"}
            </Button>
          </div>
        </div>
        <div className="min-h-[400px] flex-1">
          <CodeEditor value={code} onChange={onChange} filename={mission.filename} />
        </div>
        <div className="max-h-48 overflow-auto border-t border-[var(--rule-soft)] bg-[var(--code-bg)] p-3">
          <p className="font-mono text-[10px] uppercase tracking-widest text-[var(--ink-mute)]">Output</p>
          <pre className="mt-1 whitespace-pre-wrap font-mono text-xs">
            {running ? "Starting Python in your browser (first run takes a few seconds)…" : result?.stdout || "Press Run checks."}
          </pre>
        </div>
      </section>
    </div>
  );
}
