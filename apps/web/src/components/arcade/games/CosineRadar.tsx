"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Flash, GameHUD, type GameProps, Slider, useThemeColors } from "@/components/arcade/games/shared";

const ROUNDS = 10;
const ROUND_SECONDS = 8;
const ACCURACY_POINTS = 8;
const SPEED_POINTS = 2;
const R = 120;

interface Round {
  angA: number;
  angB: number;
  lenA: number;
  lenB: number;
  cos: number;
}

/** Spread the true answers across the whole −1…1 range so guessing "0.5" never wins. */
function makeRounds(): Round[] {
  const deltas = [0, 20, 45, 60, 90, 110, 135, 160, 180, 75].map((d) => d + (Math.random() * 10 - 5));
  return deltas
    .sort(() => Math.random() - 0.5)
    .map((deg) => {
      const angA = Math.random() * Math.PI * 2;
      const angB = angA + (Math.random() < 0.5 ? 1 : -1) * (deg * Math.PI) / 180;
      return {
        angA,
        angB,
        lenA: 0.35 + Math.random() * 0.65,
        lenB: 0.35 + Math.random() * 0.65,
        cos: Math.cos((deg * Math.PI) / 180),
      };
    });
}

export default function CosineRadar({ onFinish }: GameProps) {
  const colors = useThemeColors();
  const rounds = useMemo(() => makeRounds(), []);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [guess, setGuess] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SECONDS);
  const [revealed, setRevealed] = useState(false);
  const [flash, setFlash] = useState<{ text: string; tone: "good" | "bad" | "info" } | null>(null);
  const startedAt = useRef(0);
  const scoreRef = useRef(0);
  const lockedRef = useRef(false);

  const r = rounds[Math.min(round, ROUNDS - 1)];

  useEffect(() => {
    startedAt.current = performance.now();
  }, [round]);

  const lockIn = useCallback(
    (timedOut = false) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      const elapsed = (performance.now() - startedAt.current) / 1000;
      const err = Math.abs(guess - r.cos);
      // full marks within ±0.05 (one slider notch), zero beyond ±0.45
      const accuracy = timedOut ? 0 : Math.max(0, 1 - Math.max(0, err - 0.05) / 0.4);
      // full speed bonus inside 2 s, fading to nothing at the buzzer
      const speed = timedOut ? 0 : Math.min(1, Math.max(0, (ROUND_SECONDS - elapsed) / (ROUND_SECONDS - 2)));
      const pts = accuracy * ACCURACY_POINTS + (accuracy > 0 ? speed * SPEED_POINTS : 0);
      scoreRef.current += pts;
      setScore(scoreRef.current);
      setRevealed(true);
      const nextCombo = err < 0.12 && !timedOut ? combo + 1 : 0;
      setCombo(nextCombo);
      setFlash(
        timedOut
          ? { text: `Time! It was ${r.cos.toFixed(2)}`, tone: "bad" }
          : {
              text: `cos = ${r.cos.toFixed(2)} · you said ${guess.toFixed(2)} · +${pts.toFixed(1)}${nextCombo >= 2 ? ` · combo ×${nextCombo} 🔥` : ""}`,
              tone: err < 0.12 ? "good" : err < 0.3 ? "info" : "bad",
            },
      );
      setTimeout(() => {
        if (round + 1 >= ROUNDS) {
          onFinish(scoreRef.current);
          return;
        }
        setRound((n) => n + 1);
        setGuess(0);
        setRevealed(false);
        setFlash(null);
        setTimeLeft(ROUND_SECONDS);
        lockedRef.current = false;
      }, 1500);
    },
    [combo, guess, onFinish, r.cos, round],
  );

  useEffect(() => {
    if (revealed) return;
    const id = setInterval(() => {
      const left = ROUND_SECONDS - (performance.now() - startedAt.current) / 1000;
      setTimeLeft(Math.max(0, left));
    }, 100);
    return () => clearInterval(id);
  }, [revealed, round]);

  useEffect(() => {
    if (!revealed && timeLeft <= 0) lockIn(true);
  }, [timeLeft, revealed, lockIn]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        lockIn();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lockIn]);

  const tip = (ang: number, len: number) => [Math.cos(ang) * len * R, -Math.sin(ang) * len * R] as const;
  const [ax, ay] = tip(r.angA, r.lenA);
  const [bx, by] = tip(r.angB, r.lenB);
  const arcPath = useMemo(() => {
    // always draw the short way round: that's the angle cos θ measures
    const a0 = r.angA;
    let diff = (r.angB - a0) % (2 * Math.PI);
    if (diff > Math.PI) diff -= 2 * Math.PI;
    if (diff <= -Math.PI) diff += 2 * Math.PI;
    const a1 = a0 + diff;
    const rr = 34;
    const sweep = diff > 0 ? 0 : 1;
    return `M ${Math.cos(a0) * rr} ${-Math.sin(a0) * rr} A ${rr} ${rr} 0 0 ${sweep} ${Math.cos(a1) * rr} ${-Math.sin(a1) * rr}`;
  }, [r]);

  return (
    <div className="space-y-3">
      <GameHUD
        round={round}
        rounds={ROUNDS}
        score={score}
        extra={
          <>
            <span className={timeLeft < 3 && !revealed ? "text-[var(--arcade-b)]" : undefined}>⏱ {timeLeft.toFixed(1)}s</span>
            {combo >= 2 && <span>🔥 ×{combo}</span>}
          </>
        }
      />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="flex items-center justify-center rounded-md border border-[var(--rule-soft)] bg-[var(--bg-surface)] p-4">
          <svg viewBox="-150 -150 300 300" className="aspect-square w-full max-w-[460px]" role="img" aria-label="Two vectors on a radar">
            <defs>
              <marker id="cr-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10z" fill={colors.a} />
              </marker>
              <marker id="cr-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0 0 L10 5 L0 10z" fill={colors.b} />
              </marker>
            </defs>
            {[40, 80, 120].map((rr) => (
              <circle key={rr} r={rr} fill="none" stroke={colors.mute} strokeOpacity={0.3} />
            ))}
            <line x1={-130} x2={130} y1={0} y2={0} stroke={colors.mute} strokeOpacity={0.3} />
            <line y1={-130} y2={130} x1={0} x2={0} stroke={colors.mute} strokeOpacity={0.3} />
            {revealed && <path d={arcPath} fill="none" stroke={colors.hit} strokeWidth={2} />}
            <line x1={0} y1={0} x2={ax} y2={ay} stroke={colors.a} strokeWidth={4} markerEnd="url(#cr-a)" />
            <line x1={0} y1={0} x2={bx} y2={by} stroke={colors.b} strokeWidth={4} markerEnd="url(#cr-b)" />
            {!revealed && (
              <circle r={R} fill="none" stroke={colors.a} strokeOpacity={0.5} strokeDasharray={`${(timeLeft / ROUND_SECONDS) * 2 * Math.PI * R} 2000`} transform="rotate(-90)" strokeWidth={3} />
            )}
          </svg>
        </div>
        <div className="space-y-4 rounded-md border border-[var(--rule-soft)] p-4">
          <p className="font-body text-sm text-[var(--ink-soft)]">How aligned are these two arrows?</p>
          <Slider label="your cos θ guess" value={guess} min={-1} max={1} step={0.05} onChange={setGuess} disabled={revealed} />
          <div className="flex justify-between font-mono text-[10px] text-[var(--ink-mute)]">
            <span>−1 opposite</span>
            <span>0 ⟂</span>
            <span>+1 same</span>
          </div>
          <Button className="w-full" onClick={() => lockIn()} disabled={revealed}>
            Lock in (Enter)
          </Button>
          <Flash text={flash?.text ?? null} tone={flash?.tone ?? "info"} />
          <p className="font-mono text-[11px] text-[var(--ink-mute)]">cos θ = a·b / (|a| |b|)</p>
        </div>
      </div>
    </div>
  );
}
